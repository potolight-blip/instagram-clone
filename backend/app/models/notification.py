from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        CheckConstraint(
            "type IN ('LIKE_POST', 'LIKE_COMMENT', 'COMMENT', 'FOLLOW')",
            name="ck_notifications_type",
        ),
        CheckConstraint("actor_id != recipient_id", name="ck_notifications_not_self"),
        CheckConstraint(
            "("
            "type = 'FOLLOW' AND post_id IS NULL AND comment_id IS NULL"
            ") OR ("
            "type = 'LIKE_POST' AND post_id IS NOT NULL AND comment_id IS NULL"
            ") OR ("
            "type = 'LIKE_COMMENT' AND comment_id IS NOT NULL"
            ") OR ("
            "type = 'COMMENT' AND post_id IS NOT NULL"
            ")",
            name="ck_notifications_payload",
        ),
        Index("idx_notifications_recipient", "recipient_id", "is_read", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    actor_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    post_id: Mapped[Optional[int]] = mapped_column(ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)
    comment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("comments.id", ondelete="SET NULL"), nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default=text("0"))
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    recipient = relationship("User", foreign_keys=[recipient_id])
    actor = relationship("User", foreign_keys=[actor_id])
