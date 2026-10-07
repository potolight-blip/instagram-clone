from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class UserBase(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None
    profile_img_url: str
    is_verified: bool = False
    is_private: bool = False

    class Config:
        from_attributes = True


class UserProfileResponse(UserBase):
    post_count: int = 0
    follower_count: int = 0
    following_count: int = 0
    is_following: bool = False
    is_self: bool = False


class UserSummary(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    profile_img_url: str
    is_verified: bool = False

    class Config:
        from_attributes = True
