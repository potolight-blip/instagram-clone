from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import APIError
from app.core.security import decode_access_token
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise APIError(401, "인증이 필요합니다.", "UNAUTHORIZED")
    try:
        user_id = decode_access_token(credentials.credentials)
    except (JWTError, ValueError):
        raise APIError(401, "토큰이 유효하지 않습니다.", "UNAUTHORIZED")
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise APIError(401, "인증이 필요합니다.", "UNAUTHORIZED")
    return user
