from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import delete, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.errors import APIError
from app.models.comment import Comment
from app.models.follow import Follow
from app.models.notification import Notification
from app.models.post import Bookmark, Like, Post, PostMedia
from app.models.user import User
from app.services.media_service import save_post_image
from app.services.persist import commit
from app.services.serialize import active_user, load_posts, serialize_comments, serialize_posts

router = APIRouter()
ASPECTS = {"1:1", "4:5", "16:9"}


def _form_bool(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _blank(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _visible_post(db: Session, post_id: int) -> Post:
    post = db.scalar(
        select(Post)
        .join(User, User.id == Post.user_id)
        .where(Post.id == post_id, User.is_active.is_(True))
    )
    if post is None:
        raise APIError(404, "해당 게시물을 찾을 수 없습니다.", "POST_NOT_FOUND")
    return post


def _one(db: Session, post_id: int, viewer_id: int) -> dict:
    rows = load_posts(db, select(Post).where(Post.id == post_id))
    return serialize_posts(db, rows, viewer_id)[0]


def _page(db: Session, stmt, viewer_id: int, page: int, limit: int) -> dict:
    page = max(page, 1)
    limit = min(max(limit, 1), 50)
    rows = load_posts(db, stmt.offset((page - 1) * limit).limit(limit + 1))
    has_more = len(rows) > limit
    items = serialize_posts(db, rows[:limit], viewer_id)
    return {"items": items, "page": page, "has_more": has_more}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_post(
    files: list[UploadFile] = File(...),
    caption: str = Form(""),
    location: str = Form(""),
    aspect_ratio: str = Form("1:1"),
    hide_likes: str = Form("false"),
    disable_comments: str = Form("false"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not files or len(files) > 10:
        raise APIError(400, "사진은 1장 이상 10장 이하로 올려 주세요.", "MEDIA_NOT_ALLOWED")
    if aspect_ratio not in ASPECTS:
        raise APIError(400, "비율은 1:1, 4:5, 16:9 중 하나여야 합니다.", "INVALID_ASPECT_RATIO")
    caption_value = _blank(caption)
    if caption_value is not None and len(caption_value) > 2200:
        raise APIError(400, "캡션은 2200자 이하여야 합니다.", "INVALID_CAPTION")
    location_value = _blank(location)
    if location_value is not None and not 1 <= len(location_value) <= 100:
        raise APIError(400, "위치는 1~100자입니다.", "INVALID_LOCATION")

    post = Post(
        user_id=user.id,
        caption=caption_value,
        location=location_value,
        hide_likes=_form_bool(hide_likes),
        disable_comments=_form_bool(disable_comments),
    )
    db.add(post)
    db.flush()
    for index, upload in enumerate(files):
        url = save_post_image(upload)
        db.add(
            PostMedia(
                post_id=post.id,
                media_url=url,
                media_type="IMAGE",
                order_index=index,
                aspect_ratio=aspect_ratio,
            )
        )
    commit(db)
    return _one(db, post.id, user.id)


@router.get("/feed")
def feed(
    cursor: int | None = None,
    limit: int = Query(10, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    followed = select(Follow.following_id).where(Follow.follower_id == user.id)
    stmt = (
        select(Post)
        .join(User, User.id == Post.user_id)
        .where(
            User.is_active.is_(True),
            or_(Post.user_id == user.id, Post.user_id.in_(followed)),
        )
        .order_by(Post.id.desc())
    )
    if cursor is not None:
        stmt = stmt.where(Post.id < cursor)
    rows = load_posts(db, stmt.limit(limit + 1))
    has_more = len(rows) > limit
    page_rows = rows[:limit]
    items = serialize_posts(db, page_rows, user.id)
    next_cursor = page_rows[-1].id if has_more and page_rows else None
    return {"items": items, "next_cursor": next_cursor, "has_more": has_more}


@router.get("/explore")
def explore(
    page: int = Query(1, ge=1),
    limit: int = Query(18, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    like_count = (
        select(func.count(Like.id))
        .where(Like.post_id == Post.id)
        .correlate(Post)
        .scalar_subquery()
    )
    stmt = (
        select(Post)
        .join(User, User.id == Post.user_id)
        .where(User.is_active.is_(True))
        .order_by(like_count.desc(), Post.id.desc())
    )
    return _page(db, stmt, user.id, page, limit)


@router.get("/bookmarked")
def bookmarked(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Post)
        .join(Bookmark, Bookmark.post_id == Post.id)
        .join(User, User.id == Post.user_id)
        .where(Bookmark.user_id == user.id, User.is_active.is_(True))
        .order_by(Bookmark.created_at.desc(), Post.id.desc())
    )
    return _page(db, stmt, user.id, page, limit)


@router.get("/user/{username}")
def user_posts(
    username: str,
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    author = active_user(db, username)
    if author is None:
        raise APIError(404, "사용자를 찾을 수 없습니다.", "USER_NOT_FOUND")
    stmt = select(Post).where(Post.user_id == author.id).order_by(Post.id.desc())
    return _page(db, stmt, user.id, page, limit)


@router.get("/{post_id}")
def get_post(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _visible_post(db, post_id)
    return _one(db, post_id, user.id)


@router.post("/{post_id}/like")
def toggle_like(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = _visible_post(db, post_id)
    existing = db.scalar(
        select(Like).where(Like.user_id == user.id, Like.post_id == post.id)
    )
    if existing is not None:
        db.delete(existing)
        db.execute(
            delete(Notification).where(
                Notification.actor_id == user.id,
                Notification.type == "LIKE_POST",
                Notification.post_id == post.id,
            )
        )
        liked = False
    else:
        db.add(Like(user_id=user.id, post_id=post.id, comment_id=None))
        if post.user_id != user.id:
            db.add(
                Notification(
                    recipient_id=post.user_id,
                    actor_id=user.id,
                    type="LIKE_POST",
                    post_id=post.id,
                    comment_id=None,
                )
            )
        liked = True
    commit(db)
    like_count = db.scalar(
        select(func.count()).select_from(Like).where(Like.post_id == post.id)
    ) or 0
    return {"liked": liked, "like_count": like_count}


@router.post("/{post_id}/bookmark")
def toggle_bookmark(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = _visible_post(db, post_id)
    existing = db.scalar(
        select(Bookmark).where(Bookmark.user_id == user.id, Bookmark.post_id == post.id)
    )
    if existing is not None:
        db.delete(existing)
        bookmarked_now = False
    else:
        db.add(Bookmark(user_id=user.id, post_id=post.id))
        bookmarked_now = True
    commit(db)
    return {"bookmarked": bookmarked_now}


@router.get("/{post_id}/comments")
def list_comments(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _visible_post(db, post_id)
    comments = db.scalars(
        select(Comment)
        .where(Comment.post_id == post_id, Comment.parent_id.is_(None))
        .options(joinedload(Comment.author))
        .order_by(Comment.id.desc())
    ).unique().all()
    return serialize_comments(db, list(comments), user.id)


class CommentBody(BaseModel):
    content: str


@router.post("/{post_id}/comments", status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    body: CommentBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = body.content.strip()
    if not content:
        raise APIError(400, "댓글 내용을 입력해 주세요.", "EMPTY_CONTENT")
    post = _visible_post(db, post_id)
    if post.disable_comments:
        raise APIError(403, "댓글을 달 수 없는 게시물입니다.", "COMMENTS_DISABLED")
    comment = Comment(post_id=post.id, user_id=user.id, parent_id=None, content=content)
    db.add(comment)
    db.flush()
    if post.user_id != user.id:
        db.add(
            Notification(
                recipient_id=post.user_id,
                actor_id=user.id,
                type="COMMENT",
                post_id=post.id,
                comment_id=comment.id,
            )
        )
    commit(db)
    stored = db.scalar(
        select(Comment).where(Comment.id == comment.id).options(joinedload(Comment.author))
    )
    return serialize_comments(db, [stored], user.id)[0]
