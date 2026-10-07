from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, CheckConstraint, DateTime, Index, Integer, String, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "length(username) BETWEEN 3 AND 30 AND username NOT GLOB '*[^a-z0-9_.]*'",
            name="ck_users_username",
        ),
        CheckConstraint(
            "phone IS NULL OR length(phone) BETWEEN 1 AND 20",
            name="ck_users_phone",
        ),
        CheckConstraint(
            "full_name IS NULL OR length(full_name) BETWEEN 1 AND 100",
            name="ck_users_full_name",
        ),
        CheckConstraint(
            "website IS NULL OR length(website) BETWEEN 1 AND 255",
            name="ck_users_website",
        ),
        CheckConstraint("length(email) BETWEEN 3 AND 255", name="ck_users_email_len"),
        CheckConstraint(
            "length(profile_img_url) BETWEEN 1 AND 500",
            name="ck_users_profile_img_len",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    profile_img_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        default="/static/default_profile.png",
        server_default=text("'/static/default_profile.png'"),
    )
    is_private: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text("0"))
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text("0"))
    hide_likes_by_default: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("0")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("1"))
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    stories = relationship("Story", back_populates="author", cascade="all, delete-orphan")


# SQLite UNIQUE is case-sensitive. This index is the real email key.
Index("uq_users_email_lower", func.lower(User.email), unique=True)
