from fastapi import APIRouter, Depends, Query, Response, status
from pydantic import BaseModel, ConfigDict, EmailStr
from sqlalchemy import delete, func, or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.errors import APIError
from app.models.chat import ChatParticipant, ChatRoom, Message
from app.models.comment import Comment
from app.models.follow import Follow
from app.models.notification import Notification
from app.models.post import Post, PostMedia
from app.models.user import User
from app.services.persist import commit
from app.services.serialize import (
    follow_counts,
    is_following,
    iso,
    me_user,
    profile_user,
    user_summary,
)

router = APIRouter()


class UserPatch(BaseModel):
    model_config = ConfigDict(extra="ignore")
    full_name: str | None = None
    bio: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    is_private: bool | None = None
    hide_likes_by_default: bool | None = None


class ConfirmBody(BaseModel):
    confirm: str


def _blank(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


@router.patch("/me")
def update_me(
    body: UserPatch,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sent = body.model_dump(exclude_unset=True)
    if "full_name" in sent:
        full_name = _blank(sent["full_name"])
        if full_name is not None and len(full_name) > 100:
            raise APIError(400, "이름은 100자 이하여야 합니다.", "INVALID_FULL_NAME")
        user.full_name = full_name
    if "bio" in sent:
        user.bio = _blank(sent["bio"])
    if "phone" in sent:
        phone = _blank(sent["phone"])
        if phone is not None and not 1 <= len(phone) <= 20:
            raise APIError(400, "휴대폰 번호는 1~20자입니다.", "INVALID_PHONE")
        user.phone = phone
    if "email" in sent and sent["email"] is not None:
        email = str(sent["email"]).strip().lower()
        if not 3 <= len(email) <= 255:
            raise APIError(400, "이메일 길이가 올바르지 않습니다.", "INVALID_EMAIL")
        taken = db.scalar(
            select(User.id).where(func.lower(User.email) == email, User.id != user.id)
        )
        if taken:
            raise APIError(409, "이미 사용 중인 이메일입니다.", "EMAIL_TAKEN")
        user.email = email
    if "is_private" in sent:
        user.is_private = bool(sent["is_private"])
    if "hide_likes_by_default" in sent:
        user.hide_likes_by_default = bool(sent["hide_likes_by_default"])
    commit(db)
    db.refresh(user)
    return me_user(user)


@router.get("/search")
def search_users(
    q: str = "",
    limit: int = Query(10, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = q.strip()
    if not query:
        cap = min(limit, 4)
        others = db.scalars(
            select(User)
            .where(User.is_active.is_(True), User.id != user.id)
            .order_by(User.id.asc())
            .limit(max(cap - 1, 0))
        ).all()
        rows = [user, *others][:cap]
        return [user_summary(row) for row in rows]

    pattern = f"%{query}%"
    rows = db.scalars(
        select(User)
        .where(
            User.is_active.is_(True),
            or_(User.username.ilike(pattern), User.full_name.ilike(pattern)),
        )
        .order_by(User.id.asc())
        .limit(limit)
    ).all()
    return [user_summary(row) for row in rows]


@router.get("/suggested")
def suggested_users(
    limit: int = Query(5, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(User)
        .where(User.is_active.is_(True), User.id != user.id)
        .order_by(User.id.asc())
        .limit(limit)
    ).all()
    return [
        {**user_summary(row), "is_following": is_following(db, user.id, row.id)}
        for row in rows
    ]


@router.post("/me/deactivate", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_me(
    body: ConfirmBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.confirm != "비활성화":
        raise APIError(400, "확인 문구가 일치하지 않습니다.", "CONFIRM_MISMATCH")
    user.is_active = False
    commit(db)
    return None


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    body: ConfirmBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.confirm != "삭제":
        raise APIError(400, "확인 문구가 일치하지 않습니다.", "CONFIRM_MISMATCH")
    room_ids = list(
        db.scalars(select(ChatParticipant.room_id).where(ChatParticipant.user_id == user.id)).all()
    )
    post_ids = select(Post.id).where(Post.user_id == user.id)
    comment_ids = select(Comment.id).where(Comment.user_id == user.id)
    db.execute(
        delete(Notification).where(
            or_(
                Notification.recipient_id == user.id,
                Notification.actor_id == user.id,
                Notification.post_id.in_(post_ids),
                Notification.comment_id.in_(comment_ids),
            )
        )
    )
    db.delete(user)
    commit(db)
    if room_ids:
        counts = dict(
            db.execute(
                select(ChatParticipant.room_id, func.count())
                .where(ChatParticipant.room_id.in_(room_ids))
                .group_by(ChatParticipant.room_id)
            ).all()
        )
        for room_id in room_ids:
            if counts.get(room_id, 0) < 2:
                room = db.get(ChatRoom, room_id)
                if room is not None:
                    db.delete(room)
        commit(db)
    return None


@router.get("/me/export")
def export_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    posts = db.scalars(
        select(Post).where(Post.user_id == user.id).order_by(Post.id.asc())
    ).all()
    post_ids = [post.id for post in posts]
    media_rows = []
    if post_ids:
        media_rows = db.scalars(
            select(PostMedia).where(PostMedia.post_id.in_(post_ids)).order_by(PostMedia.order_index.asc())
        ).all()
    media_by_post: dict[int, list] = {post_id: [] for post_id in post_ids}
    for media in media_rows:
        media_by_post[media.post_id].append(
            {
                "id": media.id,
                "post_id": media.post_id,
                "media_url": media.media_url,
                "media_type": media.media_type,
                "order_index": media.order_index,
                "aspect_ratio": media.aspect_ratio,
                "created_at": iso(media.created_at),
            }
        )
    comments = db.scalars(
        select(Comment).where(Comment.user_id == user.id).order_by(Comment.id.asc())
    ).all()
    messages = db.scalars(
        select(Message).where(Message.sender_id == user.id).order_by(Message.id.asc())
    ).all()
    payload = {
        "user": me_user(user),
        "posts": [
            {
                "id": post.id,
                "caption": post.caption,
                "location": post.location,
                "hide_likes": post.hide_likes,
                "disable_comments": post.disable_comments,
                "created_at": iso(post.created_at),
                "media": media_by_post.get(post.id, []),
            }
            for post in posts
        ],
        "comments": [
            {
                "id": comment.id,
                "post_id": comment.post_id,
                "content": comment.content,
                "created_at": iso(comment.created_at),
            }
            for comment in comments
        ],
        "messages": [
            {
                "id": message.id,
                "room_id": message.room_id,
                "content": message.content,
                "created_at": iso(message.created_at),
                "is_read": message.is_read,
            }
            for message in messages
        ],
    }
    import json

    return Response(
        content=json.dumps(payload, ensure_ascii=False),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{user.username}-data.json"'},
    )


@router.get("/{username}")
def get_user_profile(
    username: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target = db.scalar(select(User).where(User.username == username))
    if target is None or not target.is_active:
        raise APIError(404, "사용자를 찾을 수 없습니다.", "USER_NOT_FOUND")
    return profile_user(db, target, user.id)


@router.post("/{user_id}/follow")
def toggle_follow(
    user_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_id == user.id:
        raise APIError(400, "자기 자신은 팔로우할 수 없습니다.", "CANNOT_FOLLOW_SELF")
    target = db.get(User, user_id)
    if target is None or not target.is_active:
        raise APIError(404, "사용자를 찾을 수 없습니다.", "USER_NOT_FOUND")
    existing = db.scalar(
        select(Follow).where(Follow.follower_id == user.id, Follow.following_id == target.id)
    )
    if existing is not None:
        db.delete(existing)
        db.execute(
            delete(Notification).where(
                Notification.actor_id == user.id,
                Notification.recipient_id == target.id,
                Notification.type == "FOLLOW",
            )
        )
        following = False
    else:
        db.add(Follow(follower_id=user.id, following_id=target.id, status="ACCEPTED"))
        db.add(
            Notification(
                recipient_id=target.id,
                actor_id=user.id,
                type="FOLLOW",
                post_id=None,
                comment_id=None,
            )
        )
        following = True
    commit(db)
    _, follower_count, _ = follow_counts(db, target.id)
    return {"is_following": following, "follower_count": follower_count}
