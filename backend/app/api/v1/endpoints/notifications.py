from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.errors import APIError
from app.models.notification import Notification
from app.models.user import User
from app.services.persist import commit
from app.services.serialize import iso, thumbnails_for, user_summary

router = APIRouter()


def _item(notification: Notification, thumbs: dict[int, str]) -> dict:
    return {
        "id": notification.id,
        "actor": user_summary(notification.actor),
        "type": notification.type,
        "post_id": notification.post_id,
        "comment_id": notification.comment_id,
        "post_thumbnail": thumbs.get(notification.post_id) if notification.post_id else None,
        "is_read": notification.is_read,
        "created_at": iso(notification.created_at),
    }


@router.get("")
def list_notifications(
    limit: int = Query(20, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(Notification)
        .where(Notification.recipient_id == user.id)
        .options(joinedload(Notification.actor))
        .order_by(Notification.id.desc())
        .limit(limit)
    ).unique().all()
    thumbs = thumbnails_for(db, [row.post_id for row in rows if row.post_id])
    return [_item(row, thumbs) for row in rows]


@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def read_all(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.execute(
        update(Notification)
        .where(Notification.recipient_id == user.id, Notification.is_read.is_(False))
        .values(is_read=True)
    )
    commit(db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def read_one(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = db.get(Notification, notification_id)
    if notification is None or notification.recipient_id != user.id:
        raise APIError(404, "알림을 찾을 수 없습니다.", "NOTIFICATION_NOT_FOUND")
    notification.is_read = True
    commit(db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
