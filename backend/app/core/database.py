from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

_engine_kwargs = {"pool_pre_ping": True}
if settings.uses_sqlite:
    _engine_kwargs = {"connect_args": {"check_same_thread": False}}

engine = create_engine(settings.DATABASE_URL, **_engine_kwargs)


if settings.uses_sqlite:

    @event.listens_for(engine, "connect")
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

# PostgreSQL has no SQLite trigger syntax. Same rules, plpgsql functions.
POSTGRES_SCHEMA_SQL = (
    """
    CREATE OR REPLACE FUNCTION fn_touch_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        IF NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at THEN
            NEW.updated_at := CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
    END;
    $$
    """,
    "DROP TRIGGER IF EXISTS trg_users_updated_at ON users",
    """
    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE fn_touch_updated_at()
    """,
    "DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts",
    """
    CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE PROCEDURE fn_touch_updated_at()
    """,
    "DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments",
    """
    CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE PROCEDURE fn_touch_updated_at()
    """,
    "DROP TRIGGER IF EXISTS trg_chat_rooms_updated_at ON chat_rooms",
    """
    CREATE TRIGGER trg_chat_rooms_updated_at
    BEFORE UPDATE ON chat_rooms
    FOR EACH ROW
    EXECUTE PROCEDURE fn_touch_updated_at()
    """,
    """
    CREATE OR REPLACE FUNCTION fn_chat_room_two_people()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        IF (SELECT COUNT(*) FROM chat_participants WHERE room_id = NEW.room_id) >= 2 THEN
            RAISE EXCEPTION 'chat room allows only 2 participants';
        END IF;
        RETURN NEW;
    END;
    $$
    """,
    "DROP TRIGGER IF EXISTS trg_chat_room_two_people ON chat_participants",
    """
    CREATE TRIGGER trg_chat_room_two_people
    BEFORE INSERT ON chat_participants
    FOR EACH ROW
    EXECUTE PROCEDURE fn_chat_room_two_people()
    """,
    """
    CREATE OR REPLACE FUNCTION fn_messages_sender_in_room()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM chat_participants
            WHERE room_id = NEW.room_id AND user_id = NEW.sender_id
        ) THEN
            RAISE EXCEPTION 'sender must belong to the chat room';
        END IF;
        RETURN NEW;
    END;
    $$
    """,
    "DROP TRIGGER IF EXISTS trg_messages_sender_in_room ON messages",
    """
    CREATE TRIGGER trg_messages_sender_in_room
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE PROCEDURE fn_messages_sender_in_room()
    """,
    """
    CREATE OR REPLACE FUNCTION fn_chat_room_unique_pair()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        IF EXISTS (
            SELECT 1
            FROM chat_participants AS mine
            JOIN chat_participants AS other
              ON other.room_id = mine.room_id
             AND other.user_id <> mine.user_id
            JOIN chat_participants AS peer
              ON peer.room_id = NEW.room_id
             AND peer.user_id <> NEW.user_id
            WHERE mine.user_id = NEW.user_id
              AND mine.room_id <> NEW.room_id
              AND other.user_id = peer.user_id
        ) THEN
            RAISE EXCEPTION 'direct room already exists for this pair';
        END IF;
        RETURN NEW;
    END;
    $$
    """,
    "DROP TRIGGER IF EXISTS trg_chat_room_unique_pair ON chat_participants",
    """
    CREATE TRIGGER trg_chat_room_unique_pair
    BEFORE INSERT ON chat_participants
    FOR EACH ROW
    EXECUTE PROCEDURE fn_chat_room_unique_pair()
    """,
    """
    CREATE OR REPLACE FUNCTION fn_notifications_recipient_owns_target()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        IF (
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
        ) THEN
            RAISE EXCEPTION 'notification recipient must own the target';
        END IF;
        RETURN NEW;
    END;
    $$
    """,
    "DROP TRIGGER IF EXISTS trg_notifications_recipient_owns_target ON notifications",
    """
    CREATE TRIGGER trg_notifications_recipient_owns_target
    BEFORE INSERT ON notifications
    FOR EACH ROW
    EXECUTE PROCEDURE fn_notifications_recipient_owns_target()
    """,
    """
    CREATE OR REPLACE FUNCTION fn_post_media_max_ten()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        IF (SELECT COUNT(*) FROM post_media WHERE post_id = NEW.post_id) >= 10 THEN
            RAISE EXCEPTION 'a post allows at most 10 images';
        END IF;
        RETURN NEW;
    END;
    $$
    """,
    "DROP TRIGGER IF EXISTS trg_post_media_max_ten ON post_media",
    """
    CREATE TRIGGER trg_post_media_max_ten
    BEFORE INSERT ON post_media
    FOR EACH ROW
    EXECUTE PROCEDURE fn_post_media_max_ten()
    """,
)

POSTGRES_SCHEMA_DROP = (
    "DROP TRIGGER IF EXISTS trg_post_media_max_ten ON post_media",
    "DROP TRIGGER IF EXISTS trg_notifications_recipient_owns_target ON notifications",
    "DROP TRIGGER IF EXISTS trg_chat_room_unique_pair ON chat_participants",
    "DROP TRIGGER IF EXISTS trg_messages_sender_in_room ON messages",
    "DROP TRIGGER IF EXISTS trg_chat_room_two_people ON chat_participants",
    "DROP TRIGGER IF EXISTS trg_chat_rooms_updated_at ON chat_rooms",
    "DROP TRIGGER IF EXISTS trg_comments_updated_at ON comments",
    "DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts",
    "DROP TRIGGER IF EXISTS trg_users_updated_at ON users",
    "DROP FUNCTION IF EXISTS fn_post_media_max_ten()",
    "DROP FUNCTION IF EXISTS fn_notifications_recipient_owns_target()",
    "DROP FUNCTION IF EXISTS fn_chat_room_unique_pair()",
    "DROP FUNCTION IF EXISTS fn_messages_sender_in_room()",
    "DROP FUNCTION IF EXISTS fn_chat_room_two_people()",
    "DROP FUNCTION IF EXISTS fn_touch_updated_at()",
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
