import sys
from datetime import datetime, timedelta, timezone

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import app.models  # noqa: F401  — register every table before drop/create
from app.core.database import Base, SessionLocal, engine, init_db
from app.core.security import get_password_hash
from app.models.chat import ChatParticipant, ChatRoom, Message
from app.models.comment import Comment
from app.models.follow import Follow
from app.models.notification import Notification
from app.models.post import Bookmark, Like, Post, PostMedia
from app.models.story import Story, StoryView
from app.models.user import User


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def parse_utc(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)


def seed() -> None:
    print("Seeding database...")
    with engine.begin() as connection:
        connection.exec_driver_sql("PRAGMA foreign_keys=OFF")
        Base.metadata.drop_all(bind=connection)
        connection.exec_driver_sql("DROP TABLE IF EXISTS alembic_version")
    init_db()

    db = SessionLocal()
    now = utc_now()
    password_hash = get_password_hash("12345")

    try:
        users = [
            User(
                id=1,
                username="admin",
                email="admin@instagram.com",
                hashed_password=password_hash,
                full_name="Muksta 관리자",
                bio="React 18 + FastAPI 풀스택 Muksta 🚀\n아름다운 인터랙티브 경험을 만듭니다 ✨",
                website="https://github.com/developer",
                profile_img_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
                is_verified=True,
            ),
            User(
                id=2,
                username="traveler_june",
                email="june@example.com",
                hashed_password=password_hash,
                full_name="여행가 준",
                bio="지구 곳곳을 유랑하는 포토그래퍼 ✈️📸\n다음 목적지는 아이슬란드 🇮🇸 | 문의: 메시지",
                website="https://traveler-june.blog",
                profile_img_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
            ),
            User(
                id=3,
                username="design_sarah",
                email="sarah@example.com",
                hashed_password=password_hash,
                full_name="디자이너 사라",
                bio="서울에서 일하는 프로덕트 디자이너 ✨\n디자인 시스템, 타이포그래피, 건축을 사랑합니다 🖤",
                website="https://sarahdesign.io",
                profile_img_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
                is_verified=True,
            ),
            User(
                id=4,
                username="foodie_min",
                email="min@example.com",
                hashed_password=password_hash,
                full_name="미식가 민",
                bio="서울 숨은 골목 맛집 탐방 🍜🍷\n솔직한 내돈내산 미식 일기",
                website="https://instagram.com",
                profile_img_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
            ),
            User(
                id=5,
                username="art_minji",
                email="minji@example.com",
                hashed_password=password_hash,
                full_name="아티스트 민지",
                bio="현대 유화와 혼합 매체 작업을 합니다 🎨\n다음 전시: 2026년 11월",
                website="https://minji-gallery.art",
                profile_img_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
                is_verified=True,
            ),
            User(
                id=6,
                username="coder_kim",
                email="kim@example.com",
                hashed_password=password_hash,
                full_name="김개발",
                bio="프론트엔드 엔지니어 💻 커피와 깨끗한 코드를 좋아합니다 ☕",
                profile_img_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
            ),
            User(
                id=7,
                username="test",
                email="test@gmail.com",
                hashed_password=password_hash,
                full_name="테스트 계정",
                bio="모든 페이지 확인용 테스트 계정입니다.\n아이디: test@gmail.com",
                website="https://instagram.com",
                profile_img_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
            ),
        ]
        db.add_all(users)
        db.flush()

        posts = [
            Post(
                id=100,
                user_id=7,
                caption="테스트 계정으로 올린 첫 게시물입니다 👋\n홈, 탐색, 메시지, 프로필을 모두 확인해 보세요.\n#테스트 #인스타그램클론",
                location="서울",
                created_at=parse_utc("2026-10-03T10:00:00Z"),
                updated_at=parse_utc("2026-10-03T10:00:00Z"),
            ),
            Post(
                id=101,
                user_id=2,
                caption="노을이 지는 황금빛 바다에서 포착한 찰나의 순간 🌅\n파도 소리와 함께 하루를 마무리하는 중입니다. 다들 오늘 하루도 고생 많으셨어요!\n#여행 #제주도 #노을 #바다 #석양 #사진",
                location="제주 애월",
                created_at=parse_utc("2026-10-02T18:30:00Z"),
                updated_at=parse_utc("2026-10-02T18:30:00Z"),
            ),
            Post(
                id=102,
                user_id=3,
                caption="새로운 모바일 디자인 시스템 완성 🎨\n다크 테마에서 최상의 명도 대비와 정갈한 타이포그래피 계층을 맞추는 데 주력했습니다. 의견 환영합니다!\n#유아이유엑스 #디자인시스템 #타이포그래피 #미니멀리즘 #다크모드",
                location="서울 성수 크리에이티브 스페이스",
                created_at=parse_utc("2026-10-02T16:15:00Z"),
                updated_at=parse_utc("2026-10-02T16:15:00Z"),
            ),
            Post(
                id=103,
                user_id=4,
                caption="비 내리는 성수동 골목의 조용한 에스프레소 바 ☕💧\n진한 헤이즐넛 크레마와 감각적인 인테리어가 비 오는 날과 너무 잘 어울려요.\n#성수동카페 #에스프레소 #카페투어 #커피스타그램 #서울카페",
                location="서울 성수동",
                created_at=parse_utc("2026-10-02T14:00:00Z"),
                updated_at=parse_utc("2026-10-02T14:00:00Z"),
            ),
            Post(
                id=104,
                user_id=5,
                caption="새로운 캔버스 작업 중 🎨 질감과 색채의 레이어를 쌓아가는 명상의 시간.\n#예술 #현대미술 #유화 #작가의일상 #갤러리",
                location="서울 한남 아틀리에",
                created_at=parse_utc("2026-10-02T11:20:00Z"),
                updated_at=parse_utc("2026-10-02T11:20:00Z"),
            ),
            Post(
                id=105,
                user_id=3,
                caption="도심 속의 미니멀리즘 건축물 🏢 직선과 유리의 조화\n#건축 #미니멀 #서울 #디자인",
                location="서울",
                created_at=parse_utc("2026-10-01T10:00:00Z"),
                updated_at=parse_utc("2026-10-01T10:00:00Z"),
            ),
            Post(
                id=106,
                user_id=2,
                caption="숲속 캠핑의 아침 🌲 따뜻한 커피 한 잔과 새소리\n#캠핑 #자연 #숲 #아웃도어 #아침",
                location="강원도",
                created_at=parse_utc("2026-09-30T09:00:00Z"),
                updated_at=parse_utc("2026-09-30T09:00:00Z"),
            ),
            Post(
                id=107,
                user_id=4,
                caption="오늘 구운 바삭하고 고소한 크루아상 🥐 결이 살아있어요\n#베이킹 #크루아상 #베이커리 #페이스트리 #디저트",
                location="서울 연남동",
                created_at=parse_utc("2026-09-29T11:00:00Z"),
                updated_at=parse_utc("2026-09-29T11:00:00Z"),
            ),
            Post(
                id=108,
                user_id=6,
                caption="도시의 밤을 달리는 네온 사인 🌌 사이버펑크 감성\n#도시야경 #네온 #도쿄 #야간사진",
                location="도쿄 신주쿠",
                created_at=parse_utc("2026-09-28T22:00:00Z"),
                updated_at=parse_utc("2026-09-28T22:00:00Z"),
            ),
        ]
        db.add_all(posts)
        db.flush()

        media = [
            (1000, 100, "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1080&auto=format&fit=crop&q=80", 0),
            (1001, 101, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80", 0),
            (1002, 101, "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1080&auto=format&fit=crop&q=80", 1),
            (1003, 101, "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1080&auto=format&fit=crop&q=80", 2),
            (1004, 102, "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&auto=format&fit=crop&q=80", 0),
            (1005, 102, "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1080&auto=format&fit=crop&q=80", 1),
            (1006, 103, "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=80", 0),
            (1007, 104, "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=80", 0),
            (1008, 104, "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080&auto=format&fit=crop&q=80", 1),
            (1009, 105, "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80", 0),
            (1010, 106, "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1080&auto=format&fit=crop&q=80", 0),
            (1011, 107, "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1080&auto=format&fit=crop&q=80", 0),
            (1012, 108, "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&auto=format&fit=crop&q=80", 0),
        ]
        db.add_all(
            PostMedia(id=media_id, post_id=post_id, media_url=url, order_index=order, aspect_ratio="1:1")
            for media_id, post_id, url, order in media
        )

        comments = [
            Comment(
                id=200,
                post_id=100,
                user_id=3,
                content="테스트 계정 환영합니다! 🎉",
                created_at=parse_utc("2026-10-03T10:20:00Z"),
                updated_at=parse_utc("2026-10-03T10:20:00Z"),
            ),
            Comment(
                id=201,
                post_id=101,
                user_id=3,
                content="색감이 정말 예술이네요! 어떤 렌즈 쓰셨는지 알 수 있을까요? 🧡",
                created_at=parse_utc("2026-10-02T19:10:00Z"),
                updated_at=parse_utc("2026-10-02T19:10:00Z"),
            ),
            Comment(
                id=202,
                post_id=101,
                user_id=1,
                content="힐링 제대로 하고 갑니다. 멋진 샷이네요 👍",
                created_at=parse_utc("2026-10-02T19:40:00Z"),
                updated_at=parse_utc("2026-10-02T19:40:00Z"),
            ),
            Comment(
                id=203,
                post_id=102,
                user_id=6,
                content="컴포넌트 구조가 정말 깔끔하네요. 개발자 친화적인 토큰 구조 최고!",
                created_at=parse_utc("2026-10-02T16:50:00Z"),
                updated_at=parse_utc("2026-10-02T16:50:00Z"),
            ),
            Comment(
                id=204,
                post_id=103,
                user_id=2,
                content="여기 진짜 분위기 좋죠! 저도 저번주에 다녀왔어요 ㅎㅎ",
                created_at=parse_utc("2026-10-02T14:30:00Z"),
                updated_at=parse_utc("2026-10-02T14:30:00Z"),
            ),
        ]
        db.add_all(comments)
        db.flush()

        # Rows behind the test account's is_liked / is_bookmarked flags, plus the likes named by notifications.
        db.add_all(
            [
                Like(user_id=7, post_id=102),
                Like(user_id=7, post_id=104),
                Like(user_id=7, comment_id=202),
                Like(user_id=7, comment_id=203),
                Like(user_id=2, post_id=100),
                Like(user_id=6, post_id=100),
                Bookmark(user_id=7, post_id=100),
                Bookmark(user_id=7, post_id=102),
                Follow(follower_id=7, following_id=2),
                Follow(follower_id=7, following_id=3),
                Follow(follower_id=5, following_id=7),
            ]
        )

        stories = [
            (
                501,
                2,
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80",
                "비행기 창밖으로 보이는 알프스 설산 🏔️",
                5,
            ),
            (
                502,
                2,
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&auto=format&fit=crop&q=80",
                "로드 트립 시작합니다! 🚗💨",
                4,
            ),
            (
                503,
                3,
                "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&auto=format&fit=crop&q=80",
                "금요일 야간 작업 & 아이디어 스케치 ☕✨",
                3,
            ),
            (
                504,
                4,
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80",
                "오늘 저녁은 정갈한 오마카세 🍣",
                8,
            ),
            (
                505,
                5,
                "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1080&auto=format&fit=crop&q=80",
                "새로운 물감 팔레트 준비 완료 🎨",
                6,
            ),
        ]
        db.add_all(
            Story(
                id=story_id,
                user_id=user_id,
                media_url=url,
                caption=caption,
                created_at=now - timedelta(hours=hours_ago),
                expires_at=now + timedelta(hours=24),
            )
            for story_id, user_id, url, caption, hours_ago in stories
        )
        db.flush()
        db.add(StoryView(user_id=7, story_id=504, viewed_at=now - timedelta(hours=1)))

        db.add_all(
            [
                Notification(
                    id=901,
                    recipient_id=7,
                    actor_id=2,
                    type="LIKE_POST",
                    post_id=100,
                    is_read=False,
                    created_at=now - timedelta(minutes=5),
                ),
                Notification(
                    id=902,
                    recipient_id=7,
                    actor_id=3,
                    type="COMMENT",
                    post_id=100,
                    comment_id=200,
                    is_read=False,
                    created_at=now - timedelta(minutes=20),
                ),
                Notification(
                    id=903,
                    recipient_id=7,
                    actor_id=5,
                    type="FOLLOW",
                    is_read=True,
                    created_at=now - timedelta(hours=2),
                ),
                Notification(
                    id=904,
                    recipient_id=7,
                    actor_id=6,
                    type="LIKE_POST",
                    post_id=100,
                    is_read=True,
                    created_at=now - timedelta(days=1),
                ),
            ]
        )

        rooms = [
            (1, parse_utc("2026-10-02T20:12:00Z")),
            (2, parse_utc("2026-10-02T18:45:00Z")),
            (3, parse_utc("2026-10-01T15:20:00Z")),
        ]
        db.add_all(
            ChatRoom(id=room_id, is_group=False, created_at=updated_at, updated_at=updated_at)
            for room_id, updated_at in rooms
        )
        db.flush()
        db.add_all(
            [
                ChatParticipant(room_id=1, user_id=7),
                ChatParticipant(room_id=1, user_id=3),
                ChatParticipant(room_id=2, user_id=7),
                ChatParticipant(room_id=2, user_id=2),
                ChatParticipant(room_id=3, user_id=7),
                ChatParticipant(room_id=3, user_id=4),
            ]
        )
        db.flush()
        db.add_all(
            [
                Message(
                    id=801,
                    room_id=1,
                    sender_id=3,
                    content="방금 보내주신 피그마 링크 잘 봤습니다! 컴포넌트 구조가 아주 훌륭해요 👍",
                    is_read=False,
                    created_at=parse_utc("2026-10-02T20:12:00Z"),
                ),
                Message(
                    id=802,
                    room_id=2,
                    sender_id=7,
                    content="아이슬란드 일정 정해지면 공유 부탁드려요!",
                    is_read=True,
                    created_at=parse_utc("2026-10-02T18:45:00Z"),
                ),
                Message(
                    id=803,
                    room_id=3,
                    sender_id=4,
                    content="다음 주에 성수동 신상 파스타집 가실래요?",
                    is_read=True,
                    created_at=parse_utc("2026-10-01T15:20:00Z"),
                ),
            ]
        )

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print("Seeding completed. Login: test@gmail.com / test / 12345")


if __name__ == "__main__":
    seed()
