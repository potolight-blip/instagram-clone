from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        Index("idx_posts_created_at", "created_at"),
        CheckConstraint(
            "caption IS NULL OR length(caption) <= 2200",
            name="ck_posts_caption_length",
        ),
        CheckConstraint(
            "location IS NULL OR length(location) BETWEEN 1 AND 100",
            name="ck_posts_location_length",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    caption: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    hide_likes: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text("0"))
    disable_comments: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    author = relationship("User", back_populates="posts")
    media = relationship(
        "PostMedia",
        back_populates="post",
        cascade="all, delete-orphan",
        order_by="PostMedia.order_index",
    )
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")


class PostMedia(Base):
    __tablename__ = "post_media"
    __table_args__ = (
        CheckConstraint("media_type = 'IMAGE'", name="ck_post_media_image_only"),
        CheckConstraint("aspect_ratio IN ('1:1', '4:5', '16:9')", name="ck_post_media_aspect_ratio"),
        CheckConstraint("order_index >= 0", name="ck_post_media_order_index"),
        CheckConstraint("length(media_url) BETWEEN 1 AND 500", name="ck_post_media_url_len"),
        UniqueConstraint("post_id", "order_index", name="uq_post_media_order"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    media_url: Mapped[str] = mapped_column(String(500), nullable=False)
    media_type: Mapped[str] = mapped_column(String(10), nullable=False, default="IMAGE", server_default=text("'IMAGE'"))
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default=text("0"))
    aspect_ratio: Mapped[str] = mapped_column(String(10), nullable=False, default="1:1", server_default=text("'1:1'"))
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    post = relationship("Post", back_populates="media")


class Like(Base):
    __tablename__ = "likes"
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_user_post_like"),
        UniqueConstraint("user_id", "comment_id", name="uq_user_comment_like"),
        CheckConstraint(
            "(post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL)",
            name="ck_likes_one_target",
        ),
        Index("idx_likes_user_id", "user_id"),
        Index("idx_likes_post_id", "post_id"),
        Index("idx_likes_comment_id", "comment_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id: Mapped[Optional[int]] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    comment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")
    comment = relationship("Comment", back_populates="likes")


class Bookmark(Base):
    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_user_bookmark"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", back_populates="bookmarks")
    post = relationship("Post")
