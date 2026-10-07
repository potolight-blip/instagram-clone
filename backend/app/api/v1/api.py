from fastapi import APIRouter
from app.api.v1.endpoints import auth, chats, comments, notifications, posts, stories, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(posts.router, prefix="/posts", tags=["Posts"])
api_router.include_router(comments.router, prefix="/comments", tags=["Comments"])
api_router.include_router(stories.router, prefix="/stories", tags=["Stories"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(chats.router, prefix="/chats", tags=["Chats"])
