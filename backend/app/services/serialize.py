from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.comment import Comment
from app.models.follow import Follow
from app.models.post import Bookmark, Like, Post, PostMedia
from app.models.story import Story, StoryView
from app.models.user import User


def iso(value: datetime | None) -> str | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.isoformat() + "Z"
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def user_summary(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "profile_img_url": user.profile_img_url,
        "is_verified": user.is_verified,
    }


def me_user(user: User) -> dict:
    data = user_summary(user)
    data.update(
        {
            "email": user.email,
            "phone": user.phone,
            "bio": user.bio,
            "website": user.website,
            "is_private": user.is_private,
            "is_active": user.is_active,
            "hide_likes_by_default": user.hide_likes_by_default,
        }
    )
    return data


def follow_counts(db: Session, user_id: int) -> tuple[int, int, int]:
    post_count = db.scalar(select(func.count()).select_from(Post).where(Post.user_id == user_id)) or 0
    follower_count = db.scalar(
        select(func.count()).select_from(Follow).where(Follow.following_id == user_id)
    ) or 0
    following_count = db.scalar(
        select(func.count()).select_from(Follow).where(Follow.follower_id == user_id)
    ) or 0
    return post_count, follower_count, following_count


def is_following(db: Session, follower_id: int, following_id: int) -> bool:
    row = db.scalar(
        select(Follow.id).where(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id,
        )
    )
    return row is not None


def profile_user(db: Session, user: User, viewer_id: int) -> dict:
    post_count, follower_count, following_count = follow_counts(db, user.id)
    data = user_summary(user)
    data.update(
        {
            "bio": user.bio,
            "website": user.website,
            "is_private": user.is_private,
            "post_count": post_count,
            "follower_count": follower_count,
            "following_count": following_count,
            "is_following": is_following(db, viewer_id, user.id),
            "is_self": user.id == viewer_id,
        }
    )
    return data


def _comment_maps(db: Session, comment_ids: list[int], viewer_id: int) -> tuple[dict[int, int], set[int]]:
    if not comment_ids:
        return {}, set()
    counts = dict(
        db.execute(
            select(Like.comment_id, func.count())
            .where(Like.comment_id.in_(comment_ids))
            .group_by(Like.comment_id)
        ).all()
    )
    liked = set(
        db.scalars(
            select(Like.comment_id).where(
                Like.user_id == viewer_id,
                Like.comment_id.in_(comment_ids),
            )
        ).all()
    )
    return counts, liked


def serialize_comment(comment: Comment, counts: dict[int, int], liked: set[int]) -> dict:
    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "parent_id": None,
        "content": comment.content,
        "created_at": iso(comment.created_at),
        "user": user_summary(comment.author),
        "likes_count": counts.get(comment.id, 0),
        "is_liked": comment.id in liked,
    }


def serialize_comments(db: Session, comments: list[Comment], viewer_id: int) -> list[dict]:
    counts, liked = _comment_maps(db, [c.id for c in comments], viewer_id)
    return [serialize_comment(c, counts, liked) for c in comments]


def load_posts(db: Session, stmt) -> list[Post]:
    return list(
        db.scalars(
            stmt.options(joinedload(Post.author), selectinload(Post.media))
        ).unique().all()
    )


def serialize_posts(db: Session, posts: list[Post], viewer_id: int, recent_limit: int = 2) -> list[dict]:
    post_ids = [post.id for post in posts]
    if not post_ids:
        return []
    like_counts = dict(
        db.execute(
            select(Like.post_id, func.count())
            .where(Like.post_id.in_(post_ids))
            .group_by(Like.post_id)
        ).all()
    )
    comment_counts = dict(
        db.execute(
            select(Comment.post_id, func.count())
            .where(Comment.post_id.in_(post_ids), Comment.parent_id.is_(None))
            .group_by(Comment.post_id)
        ).all()
    )
    liked = set(
        db.scalars(
            select(Like.post_id).where(Like.user_id == viewer_id, Like.post_id.in_(post_ids))
        ).all()
    )
    bookmarked = set(
        db.scalars(
            select(Bookmark.post_id).where(
                Bookmark.user_id == viewer_id,
                Bookmark.post_id.in_(post_ids),
            )
        ).all()
    )
    recent_rows = db.scalars(
        select(Comment)
        .where(Comment.post_id.in_(post_ids), Comment.parent_id.is_(None))
        .options(joinedload(Comment.author))
        .order_by(Comment.id.desc())
    ).unique().all()
    grouped: dict[int, list[Comment]] = {post_id: [] for post_id in post_ids}
    for comment in recent_rows:
        bucket = grouped[comment.post_id]
        if len(bucket) < recent_limit:
            bucket.append(comment)
    flat = [comment for bucket in grouped.values() for comment in bucket]
    rendered = {
        item["id"]: item
        for item in serialize_comments(db, flat, viewer_id)
    }

    items = []
    for post in posts:
        media = sorted(post.media, key=lambda row: row.order_index)
        items.append(
            {
                "id": post.id,
                "caption": post.caption,
                "location": post.location,
                "hide_likes": post.hide_likes,
                "disable_comments": post.disable_comments,
                "created_at": iso(post.created_at),
                "author": user_summary(post.author),
                "media": [
                    {
                        "id": row.id,
                        "media_url": row.media_url,
                        "media_type": row.media_type,
                        "order_index": row.order_index,
                        "aspect_ratio": row.aspect_ratio,
                    }
                    for row in media
                ],
                "like_count": like_counts.get(post.id, 0),
                "comment_count": comment_counts.get(post.id, 0),
                "is_liked": post.id in liked,
                "is_bookmarked": post.id in bookmarked,
                "recent_comments": [rendered[c.id] for c in grouped[post.id]],
            }
        )
    return items


def active_user(db: Session, username: str) -> User | None:
    return db.scalar(
        select(User).where(User.username == username, User.is_active.is_(True))
    )


def story_groups(db: Session, stories: list[Story], viewer_id: int) -> list[dict]:
    if not stories:
        return []
    story_ids = [story.id for story in stories]
    viewed = set(
        db.scalars(
            select(StoryView.story_id).where(
                StoryView.user_id == viewer_id,
                StoryView.story_id.in_(story_ids),
            )
        ).all()
    )
    grouped: dict[int, list[Story]] = {}
    authors: dict[int, User] = {}
    for story in stories:
        grouped.setdefault(story.user_id, []).append(story)
        authors[story.user_id] = story.author
    ordered_users = sorted(
        grouped,
        key=lambda user_id: max(item.id for item in grouped[user_id]),
        reverse=True,
    )
    result = []
    for user_id in ordered_users:
        rows = sorted(grouped[user_id], key=lambda item: item.id)
        result.append(
            {
                "user": user_summary(authors[user_id]),
                "has_unseen": any(row.id not in viewed for row in rows),
                "stories": [
                    {
                        "id": row.id,
                        "media_url": row.media_url,
                        "media_type": row.media_type,
                        "caption": row.caption,
                        "created_at": iso(row.created_at),
                        "expires_at": iso(row.expires_at),
                    }
                    for row in rows
                ],
            }
        )
    return result


def thumbnails_for(db: Session, post_ids: list[int]) -> dict[int, str]:
    if not post_ids:
        return {}
    rows = db.execute(
        select(PostMedia.post_id, PostMedia.media_url)
        .where(PostMedia.post_id.in_(post_ids))
        .order_by(PostMedia.order_index.asc(), PostMedia.id.asc())
    ).all()
    found: dict[int, str] = {}
    for post_id, media_url in rows:
        found.setdefault(post_id, media_url)
    return found
