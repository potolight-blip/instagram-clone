from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.errors import APIError


def commit(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        text = str(getattr(exc, "orig", exc)).lower()
        if "username" in text:
            raise APIError(409, "이미 사용 중인 사용자 이름입니다.", "USERNAME_TAKEN") from exc
        if "email" in text:
            raise APIError(409, "이미 사용 중인 이메일입니다.", "EMAIL_TAKEN") from exc
        raise APIError(400, "저장할 수 없습니다.", "CONSTRAINT_FAILED") from exc
