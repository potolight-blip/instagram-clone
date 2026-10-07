from fastapi import APIRouter, Depends
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.errors import APIError
from app.models.comment import Comment
from app.models.notification import Notification
from app.models.post import Like
from app.models.user import User
from app.services.persist import commit

router = APIRouter()


@router.post("/{comment_id}/like")
def toggle_comment_like(
    comment_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = db.scalar(
        select(Comment)
        .join(User, User.id == Comment.user_id)
        .where(Comment.id == comment_id, User.is_active.is_(True))
    )
    if comment is None:
        raise APIError(404, "댓글을 찾을 수 없습니다.", "COMMENT_NOT_FOUND")
    existing = db.scalar(
        select(Like).where(Like.user_id == user.id, Like.comment_id == comment.id)
    )
    if existing is not None:
        db.delete(existing)
        db.execute(
            delete(Notification).where(
                Notification.actor_id == user.id,
                Notification.type == "LIKE_COMMENT",
                Notification.comment_id == comment.id,
            )
        )
        liked = False
    else:
        db.add(Like(user_id=user.id, post_id=None, comment_id=comment.id))
        if comment.user_id != user.id:
            db.add(
                Notification(
                    recipient_id=comment.user_id,
                    actor_id=user.id,
                    type="LIKE_COMMENT",
                    post_id=comment.post_id,
                    comment_id=comment.id,
                )
            )
        liked = True
    commit(db)
    likes_count = db.scalar(
        select(func.count()).select_from(Like).where(Like.comment_id == comment.id)
    ) or 0
    return {"liked": liked, "likes_count": likes_count}
