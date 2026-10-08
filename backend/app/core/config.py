from typing import List

from pydantic import model_validator
from pydantic_settings import BaseSettings

LOCAL_SQLITE_URL = "sqlite:///./instagram.db"


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://") :]
    if url.startswith("postgresql+psycopg2://"):
        return "postgresql+psycopg://" + url[len("postgresql+psycopg2://") :]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    return url


class Settings(BaseSettings):
    PROJECT_NAME: str = "Muksta"
    SECRET_KEY: str = "instagram-clone-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    # local: SQLite. production: PostgreSQL URL is required.
    ENV: str = "local"
    DATABASE_URL: str = ""
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"

    @model_validator(mode="after")
    def resolve_database_url(self):
        env_name = self.ENV.strip().lower()
        url = _normalize_database_url(self.DATABASE_URL.strip())
        production = env_name in {"production", "prod"}
        if production and not url.startswith("postgresql"):
            raise ValueError(
                "ENV=production 에서는 PostgreSQL DATABASE_URL 이 필요합니다. "
                "예: postgresql://user:password@host:5432/instagram"
            )
        if url.startswith("postgresql") or (url.startswith("sqlite") and url):
            self.DATABASE_URL = url
        else:
            self.DATABASE_URL = LOCAL_SQLITE_URL
        return self

    @property
    def uses_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
