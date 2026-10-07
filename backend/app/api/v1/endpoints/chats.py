from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.errors import APIError
from app.models.chat import ChatParticipant, ChatRoom, Message
from app.models.user import User
from app.services.persist import commit
from app.services.serialize import iso, user_summary, utcnow

router = APIRouter()


class RoomBody(BaseModel):
    target_user_id: int


class MessageBody(BaseModel):
    content: str


def _require_member(db: Session, room_id: int, user_id: int) -> ChatRoom:
    room = db.get(ChatRoom, room_id)
    member = db.scalar(
        select(ChatParticipant.user_id).where(
            ChatParticipant.room_id == room_id,
            ChatParticipant.user_id == user_id,
        )
    )
    if room is None or member is None:
        raise APIError(403, "이 대화방에 참여하고 있지 않습니다.", "NOT_PARTICIPANT")
    return room


def _other_user(db: Session, room_id: int, user_id: int) -> User | None:
    return db.scalar(
        select(User)
        .join(ChatParticipant, ChatParticipant.user_id == User.id)
        .where(ChatParticipant.room_id == room_id, ChatParticipant.user_id != user_id)
    )


def _message_dict(message: Message, username: str) -> dict:
    return {
        "id": message.id,
        "room_id": message.room_id,
        "sender_id": message.sender_id,
        "sender_username": username,
        "content": message.content,
        "created_at": iso(message.created_at),
        "is_read": message.is_read,
    }


def _last_messages(db: Session, room_ids: list[int]) -> dict[int, Message]:
    if not room_ids:
        return {}
    last_ids = db.scalars(
        select(func.max(Message.id)).where(Message.room_id.in_(room_ids)).group_by(Message.room_id)
    ).all()
    if not last_ids:
        return {}
    rows = db.scalars(
        select(Message).where(Message.id.in_(last_ids)).options(joinedload(Message.sender))
    ).unique().all()
    return {row.room_id: row for row in rows}


def _room_dict(room: ChatRoom, other: User, last: Message | None) -> dict:
    last_message = None
    if last is not None:
        last_message = _message_dict(last, last.sender.username)
    return {
        "id": room.id,
        "participant": user_summary(other),
        "last_message": last_message,
        "updated_at": iso(room.updated_at),
    }


def _find_room(db: Session, left_id: int, right_id: int) -> int | None:
    return db.scalar(
        select(ChatParticipant.room_id)
        .where(ChatParticipant.user_id.in_([left_id, right_id]))
        .group_by(ChatParticipant.room_id)
        .having(func.count(ChatParticipant.user_id) == 2)
    )


@router.get("/rooms")
def list_rooms(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room_ids = list(
        db.scalars(select(ChatParticipant.room_id).where(ChatParticipant.user_id == user.id)).all()
    )
    if not room_ids:
        return []
    rooms = db.scalars(
        select(ChatRoom).where(ChatRoom.id.in_(room_ids)).order_by(ChatRoom.updated_at.desc(), ChatRoom.id.desc())
    ).all()
    lasts = _last_messages(db, room_ids)
    items = []
    for room in rooms:
        other = _other_user(db, room.id, user.id)
        if other is None:
            continue
        items.append(_room_dict(room, other, lasts.get(room.id)))
    return items


@router.post("/rooms")
def open_room(
    body: RoomBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.target_user_id == user.id:
        raise APIError(400, "자기 자신에게는 메시지를 보낼 수 없습니다.", "INVALID_TARGET")
    target = db.get(User, body.target_user_id)
    if target is None or not target.is_active:
        raise APIError(404, "사용자를 찾을 수 없습니다.", "USER_NOT_FOUND")
    room_id = _find_room(db, user.id, target.id)
    if room_id is None:
        room = ChatRoom(is_group=False)
        db.add(room)
        db.flush()
        db.add(ChatParticipant(room_id=room.id, user_id=user.id))
        db.add(ChatParticipant(room_id=room.id, user_id=target.id))
        commit(db)
        db.refresh(room)
    else:
        room = db.get(ChatRoom, room_id)
    lasts = _last_messages(db, [room.id])
    return _room_dict(room, target, lasts.get(room.id))


@router.get("/rooms/{room_id}/messages")
def list_messages(
    room_id: int,
    limit: int = Query(50, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_member(db, room_id, user.id)
    newest = db.scalars(
        select(Message)
        .where(Message.room_id == room_id)
        .options(joinedload(Message.sender))
        .order_by(Message.id.desc())
        .limit(limit)
    ).unique().all()
    rows = list(reversed(newest))
    changed = False
    for message in rows:
        if message.sender_id != user.id and not message.is_read:
            message.is_read = True
            changed = True
    if changed:
        commit(db)
    return [_message_dict(message, message.sender.username) for message in rows]


@router.post("/rooms/{room_id}/messages", status_code=status.HTTP_201_CREATED)
def send_message(
    room_id: int,
    body: MessageBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = body.content.strip()
    if not content:
        raise APIError(400, "메시지 내용을 입력해 주세요.", "EMPTY_CONTENT")
    room = _require_member(db, room_id, user.id)
    message = Message(room_id=room.id, sender_id=user.id, content=content, is_read=False)
    db.add(message)
    room.updated_at = utcnow()
    commit(db)
    db.refresh(message)
    return _message_dict(message, user.username)
