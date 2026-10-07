from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
)


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# updated_at is maintained in SQLite, not only by the ORM.
# recursive_triggers stays off, so these updates do not loop.
SCHEMA_TRIGGERS = (
    """
    CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_posts_updated_at
    AFTER UPDATE ON posts
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
    BEGIN
        UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_comments_updated_at
    AFTER UPDATE ON comments
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
    BEGIN
        UPDATE comments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_chat_rooms_updated_at
    AFTER UPDATE ON chat_rooms
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
    BEGIN
        UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_chat_room_two_people
    BEFORE INSERT ON chat_participants
    FOR EACH ROW
    WHEN (
        SELECT COUNT(*) FROM chat_participants WHERE room_id = NEW.room_id
    ) >= 2
    BEGIN
        SELECT RAISE(ABORT, 'chat room allows only 2 participants');
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_messages_sender_in_room
    BEFORE INSERT ON messages
    FOR EACH ROW
    WHEN NOT EXISTS (
        SELECT 1 FROM chat_participants
        WHERE room_id = NEW.room_id AND user_id = NEW.sender_id
    )
    BEGIN
        SELECT RAISE(ABORT, 'sender must belong to the chat room');
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_chat_room_unique_pair
    BEFORE INSERT ON chat_participants
    FOR EACH ROW
    WHEN EXISTS (
        SELECT 1
        FROM chat_participants AS mine
        JOIN chat_participants AS other
          ON other.room_id = mine.room_id
         AND other.user_id != mine.user_id
        JOIN chat_participants AS peer
          ON peer.room_id = NEW.room_id
         AND peer.user_id != NEW.user_id
        WHERE mine.user_id = NEW.user_id
          AND mine.room_id != NEW.room_id
          AND other.user_id = peer.user_id
    )
    BEGIN
        SELECT RAISE(ABORT, 'direct room already exists for this pair');
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_notifications_recipient_owns_target
    BEFORE INSERT ON notifications
    FOR EACH ROW
    WHEN (
        NEW.type IN ('LIKE_POST', 'COMMENT')
        AND NOT EXISTS (
            SELECT 1 FROM posts
            WHERE id = NEW.post_id AND user_id = NEW.recipient_id
        )
    ) OR (
        NEW.type = 'LIKE_COMMENT'
        AND NOT EXISTS (
            SELECT 1 FROM comments
            WHERE id = NEW.comment_id AND user_id = NEW.recipient_id
        )
    )
    BEGIN
        SELECT RAISE(ABORT, 'notification recipient must own the target');
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS trg_post_media_max_ten
    BEFORE INSERT ON post_media
    FOR EACH ROW
    WHEN (
        SELECT COUNT(*) FROM post_media WHERE post_id = NEW.post_id
    ) >= 10
    BEGIN
        SELECT RAISE(ABORT, 'a post allows at most 10 images');
    END
    """,
)


def init_db() -> None:
    """Apply Alembic migrations: 13 tables, checks, indexes, and triggers."""
    from pathlib import Path

    from alembic import command
    from alembic.config import Config

    backend_dir = Path(__file__).resolve().parents[2]
    cfg = Config(str(backend_dir / "alembic.ini"))
    cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("%", "%%"))
    command.upgrade(cfg, "head")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
