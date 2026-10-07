from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.errors import APIError
from app.models.story import Story, StoryView
from app.models.user import User
from app.services.persist import commit
from app.services.serialize import story_groups, utcnow

router = APIRouter()


def _stories(db: Session, include_expired: bool, viewer_id: int) -> list[Story]:
    stmt = (
        select(Story)
        .join(User, User.id == Story.user_id)
        .where(User.is_active.is_(True))
        .options(joinedload(Story.author))
        .order_by(Story.id.asc())
    )
    if not include_expired:
        stmt = stmt.where(Story.expires_at > utcnow(), Story.user_id != viewer_id)
    return list(db.scalars(stmt).unique().all())


@router.get("/feed")
def story_feed(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return story_groups(db, _stories(db, include_expired=False, viewer_id=user.id), user.id)


@router.get("/archive")
def story_archive(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return story_groups(db, _stories(db, include_expired=True, viewer_id=user.id), user.id)


@router.post("/{story_id}/view", status_code=status.HTTP_204_NO_CONTENT)
def view_story(
    story_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    story = db.scalar(
        select(Story)
        .join(User, User.id == Story.user_id)
        .where(Story.id == story_id, User.is_active.is_(True))
    )
    if story is None:
        raise APIError(404, "스토리를 찾을 수 없습니다.", "STORY_NOT_FOUND")
    if story.expires_at <= utcnow():
        raise APIError(404, "만료된 스토리입니다.", "STORY_EXPIRED")
    existing = db.get(StoryView, (user.id, story.id))
    if existing is None:
        db.add(StoryView(user_id=user.id, story_id=story.id))
        commit(db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
