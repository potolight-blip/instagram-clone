import re

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.errors import APIError
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.chat import ChatParticipant, Message
from app.models.notification import Notification
from app.models.user import User
from app.services.persist import commit
from app.services.serialize import me_user

router = APIRouter()
USERNAME_RE = re.compile(r"^[a-z0-9_.]{3,30}$")


class SignupBody(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr
    username: str
    password: str = Field(min_length=5)
    full_name: str | None = None


class LoginBody(BaseModel):
    username_or_email: str
    password: str


class PasswordBody(BaseModel):
    current_password: str
    new_password: str


def _blank_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _token_response(user: User) -> dict:
    return {
        "user": me_user(user),
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
    }


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(body: SignupBody, db: Session = Depends(get_db)):
    username = body.username.strip().lower()
    email = str(body.email).strip().lower()
    if not USERNAME_RE.fullmatch(username):
        raise APIError(400, "사용자 이름 형식이 올바르지 않습니다.", "INVALID_USERNAME")
    if not 3 <= len(email) <= 255:
        raise APIError(400, "이메일 길이가 올바르지 않습니다.", "INVALID_EMAIL")
    full_name = _blank_to_none(body.full_name)
    if full_name is not None and len(full_name) > 100:
        raise APIError(400, "이름은 100자 이하여야 합니다.", "INVALID_FULL_NAME")
    if db.scalar(select(User.id).where(User.username == username)):
        raise APIError(409, "이미 사용 중인 사용자 이름입니다.", "USERNAME_TAKEN")
    if db.scalar(select(User.id).where(func.lower(User.email) == email)):
        raise APIError(409, "이미 사용 중인 이메일입니다.", "EMAIL_TAKEN")

    user = User(
        username=username,
        email=email,
        hashed_password=get_password_hash(body.password),
        full_name=full_name,
        profile_img_url="/static/default_profile.png",
    )
    db.add(user)
    commit(db)
    db.refresh(user)
    return _token_response(user)


@router.post("/login")
def login(body: LoginBody, db: Session = Depends(get_db)):
    raw = body.username_or_email.strip()
    if "@" in raw:
        user = db.scalar(select(User).where(func.lower(User.email) == raw.lower()))
    else:
        user = db.scalar(select(User).where(User.username == raw))
    if user is None or not verify_password(body.password, user.hashed_password):
        raise APIError(401, "아이디 또는 비밀번호가 올바르지 않습니다.", "INVALID_CREDENTIALS")
    if not user.is_active:
        raise APIError(403, "비활성화된 계정입니다.", "ACCOUNT_INACTIVE")
    return _token_response(user)


@router.get("/me")
def read_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    unread_notifications = db.scalar(
        select(func.count())
        .select_from(Notification)
        .where(Notification.recipient_id == user.id, Notification.is_read.is_(False))
    ) or 0
    latest = (
        select(func.max(Message.id).label("message_id"), Message.room_id)
        .join(ChatParticipant, ChatParticipant.room_id == Message.room_id)
        .where(ChatParticipant.user_id == user.id)
        .group_by(Message.room_id)
        .subquery()
    )
    unread_messages = db.scalar(
        select(func.count())
        .select_from(latest)
        .join(Message, Message.id == latest.c.message_id)
        .where(Message.is_read.is_(False))
    ) or 0
    data = me_user(user)
    data["unread_notification_count"] = unread_notifications
    data["unread_message_count"] = unread_messages
    return data


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    body: PasswordBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, user.hashed_password):
        raise APIError(400, "현재 비밀번호가 올바르지 않습니다.", "INVALID_PASSWORD")
    if len(body.new_password) < 5:
        raise APIError(400, "새 비밀번호는 5자 이상이어야 합니다.", "INVALID_PASSWORD")
    user.hashed_password = get_password_hash(body.new_password)
    commit(db)
    return None
