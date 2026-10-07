from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.user import UserSummary


class PostMediaResponse(BaseModel):
    id: int
    media_url: str
    media_type: str
    order_index: int
    aspect_ratio: str

    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    author: UserSummary
    created_at: datetime
    likes_count: int = 0
    is_liked: bool = False

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    caption: Optional[str] = None
    location: Optional[str] = None
    hide_likes: bool = False
    disable_comments: bool = False
    created_at: datetime
    author: UserSummary
    media: List[PostMediaResponse]
    like_count: int = 0
    comment_count: int = 0
    is_liked: bool = False
    is_bookmarked: bool = False
    recent_comments: List[CommentResponse] = []

    class Config:
        from_attributes = True


class PostFeedResponse(BaseModel):
    items: List[PostResponse]
    next_cursor: Optional[int] = None
    has_more: bool = False
