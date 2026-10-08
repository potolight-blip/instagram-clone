# Muksta 백엔드 개발 명세서 (backend.md)

현재 프론트엔드 화면이 실제로 보여주는 기능만 서버에 구현한다.  
로컬(`ENV=local`)은 **SQLite**, 서버(`ENV=production`)는 **PostgreSQL**이다. Alembic이 `DATABASE_URL`을 보고 같은 리비전을 해당 엔진에 적용한다.

프론트는 React + Vite이며, 지금은 Zustand 목 데이터로 동작한다. 백엔드는 그 화면이 읽는 필드와 누르는 동작만 제공한다.

> **연동 상태 (2026-10-07)**: 이 문서가 설명하는 API는 전부 구현되어 프로덕션에 배포되어 있지만, 현재 `frontend/`는 이 API를 호출하지 않는다. 프론트는 `src/mock/initialData.ts` 목 데이터로만 동작한다 (`front.md` 참고). API는 `curl`/`/docs`(Swagger)로만 검증된 상태다.

> **프로덕션 배포 현황 (2026-10-07)**: `https://tripastay.com`에 배포됨.
> - 실행 환경: Python **3.11** venv(`backend/venv`). 시스템 기본 Python은 3.9라 `deps.py` 등의 `X | None` 문법(PEP 604)을 지원하지 못해 3.11을 별도 설치했다.
> - 프로세스: systemd 서비스 `instagram-clone-backend` (`/etc/systemd/system/instagram-clone-backend.service`), `uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2`로 상시 구동, 장애 시 자동 재시작.
> - 리버스 프록시: nginx(`/etc/nginx/conf.d/tripastay.com.conf`)가 `/api/`, `/uploads/`, `/static/`, `/docs`, `/redoc`, `/openapi.json`, `/health`을 `127.0.0.1:8000`으로 프록시. SSL은 기존 Certbot 인증서 사용.
> - `backend/.env`의 `ALLOWED_ORIGINS`는 `https://tripastay.com,https://www.tripastay.com`. 다만 프론트와 백엔드가 같은 도메인으로 묶여 있어 현재는 CORS가 실제로 걸릴 일이 없다(프론트가 아직 호출을 안 하므로).
> - 서버 DB는 PostgreSQL이다. `ENV=production`과 `DATABASE_URL=postgresql://...`을 둔 뒤 `alembic upgrade head`로 스키마를 만든다. 이전에 배포된 SQLite 파일(`instagram.db`)은 이 설정에서 쓰지 않는다.

---

## 1. 범위

### 1.1. 서버가 담당하는 화면

| 화면 | 서버가 할 일 |
| :--- | :--- |
| 로그인, 회원가입 | 이메일·사용자 이름·비밀번호 인증, JWT 발급 |
| 홈 피드 | 팔로우한 사람의 사진 게시물, 최신순 |
| 스토리 트레이 / 뷰어 | 만료 전 스토리 목록, 열람 여부 |
| 탐색 | 좋아요가 많은 게시물 그리드 |
| 검색 패널 | 사용자 이름·이름 검색. 검색어가 없을 때의 목록은 최근 검색 기록이 아니다 |
| 추천 계정 | 나를 뺀 사용자 5명. 이미 팔로우한 계정도 포함하고 버튼만 팔로잉 |
| 알림 패널 | 좋아요, 댓글, 팔로우 알림과 읽음 처리 |
| 게시물 카드 / 상세 | 조회, 좋아요, 저장, 댓글, 댓글 좋아요 |
| 새 게시물 | 사진만 업로드 (최대 10장), 캡션, 위치, 비율, 좋아요 숨김, 댓글 해제 |
| 프로필 | 정보, 게시물 그리드, 저장됨, 팔로우 |
| 프로필 편집 | 이름, 소개 |
| 다이렉트 | 1:1 방 목록, 메시지 조회, 텍스트 전송. 스토리 답장도 같은 메시지 |
| 설정 | 비밀번호, 이메일·휴대폰, 비공개, 비활성화·삭제, 보관함, 데이터 받기, 좋아요 숨김 기본값 |

### 1.2. 브라우저만 담당 (API·테이블 없음)

아래는 화면에 있지만 서버에 저장하지 않는다.

- 언어, 테마(다크/라이트), 모션 줄이기
- 고객센터, 개인정보처리방침, 약관 문구
- 홈 하단 푸터 링크
- 게시물 **공유** (클립보드에 `/p/{id}` 복사)
- 게시물 **옵션** 버튼 (동작 없음)
- 다이렉트 **사진 첨부**, 상단 **새 메시지** 아이콘, **대화 정보** 버튼 (동작 없음)
- 다이렉트 대화창 **프로필 보기** (알림만. 프로필 조회 API를 다시 만들지 않음)
- 스토리 **하트** (알림만. 좋아요 테이블에 넣지 않음)
- 검색 **모두 지우기** (핸들러 없음. 최근 검색 테이블 없음)
- 추천 **모두 보기** (알림만. `suggested`의 `limit`만 쓴다)
- 홈 하단 “지난 3일” 문구 (고정 문구. 날짜 필터 없음)
- 댓글 **답글 달기** 버튼 (동작 없음)
- **계정 전환** 화면 (다른 계정으로 다시 로그인. 전환 전용 API 없음)
- **비밀번호를 잊으셨나요?** 링크 (재설정 화면 없음)
- 프로필 **태그됨** 탭 (항상 빈 목록. 멘션 테이블 없음)

### 1.3. 구현하지 않음

릴스, 동영상 게시물, 페이스북 로그인, 2단계 인증, 차단, 제한, 푸시/이메일 알림 설정, 해시태그 페이지, 대댓글 작성, 팔로우 요청 승인함, 그룹 채팅, WebSocket, Refresh Token 테이블.

비공개 계정(`is_private`)은 프로필에 저장하고 표시한다. 승인 대기 UI가 없으므로 팔로우는 즉시 `ACCEPTED`로 저장한다.

---

## 2. 기술 스택

| 분류 | 선택 | 용도 |
| :--- | :--- | :--- |
| Language | Python 3.10+ | |
| API | FastAPI | REST `/api/v1` |
| Server | Uvicorn | |
| ORM | SQLAlchemy 2.0 | |
| Schema | Pydantic v2 | |
| DB | **SQLite / PostgreSQL** | 로컬 SQLite, 서버 PostgreSQL. `ENV`로 선택 |
| Password | passlib[bcrypt] | |
| Token | python-jose | Access Token만 (Bearer, 유효 7일) |
| Image | Pillow | JPEG/PNG/WEBP/HEIC → WebP |
| Upload | python-multipart | |

로컬 `DATABASE_URL` 예: `sqlite:///./instagram.db`  
서버 예: `postgresql://user:password@127.0.0.1:5432/instagram` (`ENV=production`)

연결 시 반드시 실행한다.

```python
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
```

`connect_args={"check_same_thread": False}` 를 사용한다.

---

## 3. 디렉터리

기존 `backend/app` 구조를 유지한다. WebSocket 모듈은 두지 않는다.

```
backend/
├── app/
│   ├── api/v1/endpoints/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── posts.py
│   │   ├── comments.py
│   │   ├── stories.py
│   │   ├── notifications.py
│   │   └── chats.py
│   ├── core/          # config, security, database
│   ├── models/
│   ├── schemas/
│   ├── services/media_service.py
│   └── main.py
├── uploads/           # profiles, posts, stories
├── static/
├── seed.py
└── requirements.txt
```

정적 파일:

```python
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")
```

CORS: `http://localhost:5173`, `http://localhost:5174`, `allow_credentials=True`.

공통 오류:

```json
{ "detail": "해당 게시물을 찾을 수 없습니다.", "error_code": "POST_NOT_FOUND" }
```

인증이 필요한 API는 `Authorization: Bearer <token>` 이 없거나 만료되면 `401`을 반환한다.

---

## 4. 데이터베이스

테이블은 아래 **13개**만 사용한다. `db.md`에 있는 `hashtags`, `post_hashtags`는 만들지 않는다.

`users`, `posts`, `post_media`, `comments`, `likes`, `bookmarks`, `follows`, `stories`, `story_views`, `notifications`, `chat_rooms`, `chat_participants`, `messages`.

SQLite는 `VARCHAR(n)` 길이를 검사하지 않는다. 길이, 값 목록, 빈 문자열 금지는 아래 `CHECK`로 강제한다.

화면에만 있고 컬럼으로 저장하지 않는 값:

- `like_count`, `comment_count`, `post_count`, `follower_count`, `following_count` — 행을 세서 계산
- `is_liked`, `is_bookmarked`, `is_following`, `is_self`, `has_unseen` — 로그인 사용자 기준으로 계산
- `post_thumbnail` — 해당 게시물 `post_media`의 `order_index`가 가장 작은 URL
- `recent_comments` — 그 게시물의 최상위 댓글 최신 2개
- 알림·메시지 목록의 `5분 전`, `오후 8:12` 같은 상대 시각 — `created_at`을 저장하고 화면에서 포맷

### 4.1. `users`

| 컬럼 | 타입 | 설명 |
| :--- | :--- | :--- |
| `id` | INTEGER PK | |
| `username` | VARCHAR(30) UNIQUE | 소문자, 숫자, `_`, `.` / 3~30자 |
| `email` | VARCHAR(255) | 대소문자 무시 고유. 인덱스 `uq_users_email_lower` = `UNIQUE(lower(email))` |
| `phone` | VARCHAR(20) NULL | 1~20자. 빈 문자열은 NULL |
| `hashed_password` | VARCHAR(255) | |
| `full_name` | VARCHAR(100) NULL | 1~100자. 빈 문자열은 NULL |
| `bio` | TEXT NULL | |
| `website` | VARCHAR(255) NULL | 1~255자. 프로필에 표시. 편집 화면에서는 수정하지 않음 |
| `profile_img_url` | VARCHAR(500) | 기본 `/static/default_profile.png` |
| `is_private` | BOOLEAN | 기본 false. 설정 > 계정 공개 범위 |
| `is_verified` | BOOLEAN | 기본 false. 시드 데이터용 |
| `hide_likes_by_default` | BOOLEAN | 기본 false. 새 게시물의 `hide_likes` 초기값 |
| `is_active` | BOOLEAN | 기본 true. 비활성화 시 false |
| `created_at` / `updated_at` | DATETIME | |

`profile_img_url`은 1~500자. `email`의 `UNIQUE(lower(email))`가 대소문자만 다른 중복 가입을 막는다.

### 4.2. `posts`

`user_id`, `caption`, `location`, `hide_likes`, `disable_comments`, `created_at`, `updated_at`.  
`user_id`는 `users.id` CASCADE. `created_at` 인덱스 `idx_posts_created_at`.

`caption`은 NULL이거나 2200자 이하 (작성 화면 `maxLength`).  
`location`은 NULL이거나 1~100자.  
`disable_comments`는 게시물 단위 플래그다. 계정 설정에는 댓글 기본값 화면이 없다. 새 게시물 화면에서는 좋아요 숨김이 `hide_likes_by_default`로 시작하고, 댓글 해제는 꺼진 상태다. 공유하기 직전 체크박스가 그 게시물 값을 정한다.

### 4.3. `post_media`

`post_id`, `media_url`, `media_type`, `order_index`, `aspect_ratio`, `created_at`.  
`media_type`은 항상 `IMAGE`. `aspect_ratio`는 `1:1`, `4:5`, `16:9`.  
`media_url`은 1~500자. `order_index`는 0 이상이고 `(post_id, order_index)`가 고유하다. 게시물당 최대 10장 (트리거).

### 4.4. `comments`

`post_id`, `user_id`, `parent_id` NULL, `content`, `created_at`, `updated_at`.  
화면은 최상위 댓글만 작성한다. API는 `parent_id`를 받지 않고 항상 NULL로 저장한다. `content`는 공백만인 문자열을 거부한다.  
상세의 **답글 달기** 버튼은 동작이 없으므로 대댓글 행은 만들지 않는다.

### 4.5. `likes`

`user_id`, `post_id` NULL, `comment_id` NULL, `created_at`.  
`UNIQUE(user_id, post_id)`, `UNIQUE(user_id, comment_id)`. `comment_id` 인덱스가 있다.  
한 행은 게시물 좋아요 또는 댓글 좋아요 중 하나만 가진다. SQLite `UNIQUE`는 `NULL`을 서로 다른 값으로 본다. 그래서 비어 있는 쪽 컬럼은 중복을 막지 않고, 채워진 쪽 컬럼이 중복 좋아요를 막는다.

### 4.6. `bookmarks`

`user_id`, `post_id`, `created_at`. `UNIQUE(user_id, post_id)`.

### 4.7. `follows`

`follower_id`, `following_id`, `status`, `created_at`.  
`UNIQUE(follower_id, following_id)`. `follower_id != following_id`. `status`는 `ACCEPTED`만 사용한다.

### 4.8. `stories`

`user_id`, `media_url`, `media_type`=`IMAGE`, `caption` NULL, `expires_at`, `created_at`.  
`media_url`은 1~500자. `caption`은 NULL이거나 1~255자.  
스토리 작성 화면이 없으므로 행은 시드(또는 이후 관리 스크립트)로만 넣는다. 업로드 API는 없다.

### 4.9. `story_views`

`user_id`, `story_id`, `viewed_at`. `PRIMARY KEY(user_id, story_id)`.  
스토리 트레이의 `has_unseen` 계산용.

### 4.10. `notifications`

`recipient_id`, `actor_id`, `type`, `post_id` NULL, `comment_id` NULL, `is_read`, `created_at`.  
`type`: `LIKE_POST`, `LIKE_COMMENT`, `COMMENT`, `FOLLOW`. `MENTION`은 없다.  
`actor_id != recipient_id`.  
`FOLLOW`는 게시물·댓글이 둘 다 NULL. `LIKE_POST`는 `post_id`만. `LIKE_COMMENT`는 `comment_id`가 필수이고, API는 썸네일을 위해 그 댓글의 `post_id`도 넣는다. `COMMENT`는 `post_id`가 필수이고, API는 `comment_id`도 항상 넣는다.  
본인 행동으로는 알림을 만들지 않는다. `LIKE_POST`와 `COMMENT`의 수신자는 그 게시물의 주인이고, `LIKE_COMMENT`의 수신자는 그 댓글의 작성자다.  
조회 인덱스: `(recipient_id, is_read, created_at)`.

### 4.11. `chat_rooms` / `chat_participants` / `messages`

- `chat_rooms`: `id`, `is_group`(항상 false), `updated_at`, `created_at`. `room_name` 컬럼은 없다.
- `chat_participants`: `room_id`, `user_id`, `joined_at`. PK `(room_id, user_id)`. `user_id` 인덱스 `idx_chat_participants_user_id`. 방은 항상 2명이고, 같은 두 사람의 방은 하나다.
- `messages`: `room_id`, `sender_id`, `content`, `is_read`, `created_at`. 텍스트만 저장한다. 공백만인 `content`는 거부한다. `media_url` 컬럼은 두지 않는다. 보낸 사람은 그 방의 참여자여야 한다.

### 4.12. 트리거

`alembic upgrade head`가 13개 테이블, CHECK, 인덱스, 트리거를 만든다. 앱을 시작할 때 `init_db()`가 이 마이그레이션을 적용한다. `uq_users_email_lower`는 `lower(email)` 표현식 인덱스라 마이그레이션 SQL로 직접 만든다. `recursive_triggers`는 끄고, `updated_at` 트리거는 값이 그대로일 때만 시각을 바꾼다.

| 트리거 | 하는 일 |
| :--- | :--- |
| `trg_users_updated_at` | `users.updated_at` |
| `trg_posts_updated_at` | `posts.updated_at` |
| `trg_comments_updated_at` | `comments.updated_at` |
| `trg_chat_rooms_updated_at` | `chat_rooms.updated_at` |
| `trg_chat_room_two_people` | 참여자가 3명째면 중단 |
| `trg_chat_room_unique_pair` | 같은 두 사람의 1:1 방이 이미 있으면 중단 |
| `trg_messages_sender_in_room` | 참여자가 아닌 사람의 메시지 중단 |
| `trg_post_media_max_ten` | 게시물 사진이 11장째면 중단 |
| `trg_notifications_recipient_owns_target` | 좋아요·댓글 알림의 수신자가 대상의 주인이 아니면 중단 |

---

## 5. API

접두사 `/api/v1`. 시각은 ISO 8601 UTC. 개수(`like_count`, `comment_count`, `likes_count`, `post_count`, `follower_count`, `following_count`)는 컬럼이 아니라 `COUNT`다.

`post_id`는 정수다. 그래서 `/posts/feed` 같은 고정 경로와 충돌하지 않는다.  
`/users/search`, `/users/suggested`, `/users/me`는 `/users/{username}`보다 먼저 등록한다. `search`와 `suggested`는 사용자 이름 규칙을 통과한다.

사용자 요약 객체. `users`의 공개 열만 담는다.

```json
{ "id": 7, "username": "test", "full_name": "테스트 계정", "profile_img_url": "/uploads/profiles/7.webp", "is_verified": false }
```

로그인 사용자 객체는 요약에 더해 `email`, `phone`, `bio`, `website`, `is_private`, `is_active`, `hide_likes_by_default`를 준다. `hashed_password`는 주지 않는다.

게시물 객체는 프론트 `Post`와 같게 반환한다.  
`author`, `media[]`(`id`, `media_url`, `media_type`, `order_index`, `aspect_ratio`), `like_count`, `comment_count`, `is_liked`, `is_bookmarked`, `recent_comments`(최상위 최신 2개), `hide_likes`, `disable_comments`, `location`, `caption`, `created_at`.  
`is_liked`는 `likes`의 `(user_id, post_id)`, `is_bookmarked`는 `bookmarks`의 `(user_id, post_id)`다.

`is_active`가 false인 사용자는 검색, 추천, 피드, 탐색, 스토리에서 빼다. 프로필은 `404`다.

### 5.1. 인증

#### `POST /auth/signup`

```json
{ "email": "user@example.com", "username": "instadev", "password": "12345", "full_name": "홍길동" }
```

비밀번호는 5자 이상. 회원가입 화면에는 비밀번호 확인 칸이 없다.  
`username`은 `users` 제약과 같다. 소문자, 숫자, `_`, `.`, 3~30자. 어기면 `400 INVALID_USERNAME`.  
`email`은 3~255자. 저장 전에 소문자로 바꾼다. `full_name`이 빈 문자열이면 `NULL`.  
이미 있는 사용자 이름은 `409 USERNAME_TAKEN`. 대소문자를 무시한 이메일이 있으면 `409 EMAIL_TAKEN` (`uq_users_email_lower`).  
`201`: `{ "user", "access_token", "token_type": "bearer" }`. `user`는 로그인 사용자 객체다.

#### `POST /auth/login`

```json
{ "username_or_email": "test@gmail.com", "password": "12345" }
```

이메일은 `lower(email)`, 사용자 이름은 그대로 찾는다. 비밀번호 불일치 `401 INVALID_CREDENTIALS`. `is_active`가 false면 `403 ACCOUNT_INACTIVE`.  
`200`: signup과 같은 토큰 응답.

시드 계정: 이메일 `test@gmail.com`, 사용자 이름 `test`, 비밀번호 `12345`.

#### `GET /auth/me`

로그인 사용자 객체, `unread_notification_count`, `unread_message_count`.  
알림 배지는 `notifications`에서 `recipient_id`가 나이고 `is_read`가 false인 행 수다.  
메시지 배지는 사이드바와 같이, 내가 참여한 방 가운데 **마지막 메시지**의 `is_read`가 false인 방의 수다. 메시지 행을 모두 세지 않는다.

로그아웃은 클라이언트가 토큰을 지우면 끝난다. 서버 세션 테이블은 없다.

#### `POST /auth/change-password`

설정 > 비밀번호 변경. `{ "current_password", "new_password" }`.  
새 비밀번호 확인 칸은 화면에서만 비교하고 서버로 보내지 않는다.  
현재 비밀번호 불일치 `400 INVALID_PASSWORD`. 새 비밀번호 5자 미만 `400`. `users.hashed_password`만 바꾼다.

### 5.2. 프로필과 계정

#### `GET /users/{username}`

프로필 헤더. `bio`, `website`, `is_private`, `is_verified`, `post_count`, `follower_count`, `following_count`, `is_following`, `is_self`.  
비활성 계정은 `404`.

#### `PATCH /users/me`

보낸 필드만 수정.

```json
{
  "full_name": "테스트 계정",
  "bio": "소개",
  "email": "test@gmail.com",
  "phone": "010-0000-0000",
  "is_private": true,
  "hide_likes_by_default": true
}
```

프로필 편집은 `full_name`, `bio`. 연락처 화면은 `email`, `phone`. 공개 범위는 `is_private`. 좋아요 숨기기는 `hide_likes_by_default`.  
빈 `full_name`, `phone`은 `NULL`로 저장한다. `website`와 `profile_img_url`은 이 화면에서 바꾸지 않는다. `email`은 소문자로 저장하고, 다른 계정이 쓰면 `409 EMAIL_TAKEN`.

#### `GET /users/search?q=&limit=10`

`q`가 있으면 `username`, `full_name`을 대소문자 무시하고 부분 일치한다. 비활성 계정은 빼다. 나는 결과에 남는다.  
`q`가 비어 있으면 활성 사용자 가운데 나를 맨 앞에 두고 `id` 오름차순으로 최대 4명을 준다. 화면의 “최근 검색 항목”은 이 목록이다. 검색 기록 테이블은 없다.

#### `GET /users/suggested?limit=5`

나를 제외한 활성 사용자 최대 5명. 각 항목은 사용자 요약과 `is_following`이다. 추천 패널은 이미 팔로우한 계정도 보여주고 버튼만 팔로잉으로 표시한다.

#### `POST /users/{id}/follow`

팔로우가 없으면 `follows`에 `status=ACCEPTED`로 넣고, 있으면 그 행을 지운다. 자기 자신은 `400` (`ck_follows_not_self`).  
응답: `{ "is_following": true, "follower_count": 19 }`. `follower_count`는 대상 사용자를 `following_id`로 둔 행 수다.  
상대에게 `FOLLOW` 알림을 넣는다. `post_id`와 `comment_id`는 `NULL`이다. 언팔로우하면 내가 `actor_id`인 그 `FOLLOW` 알림을 지운다.  
프로필 팔로우 버튼, 추천 패널, 알림의 **맞팔로우**가 같은 API를 쓴다. 맞팔로우 전용 경로는 없다.

#### `POST /users/me/deactivate`

`{ "confirm": "비활성화" }`. `is_active=false` 후 클라이언트가 로그아웃한다.  
같은 계정으로 다시 로그인하는 API는 없다. 복구가 필요하면 시드 또는 관리 스크립트로 `is_active`를 되돌린다.  
화면 문구의 “다시 로그인하면 복구”는 이 명세에서 구현하지 않는다. 비활성화는 로그인 거부로 동작한다.

#### `DELETE /users/me`

`{ "confirm": "삭제" }`. 화면에는 비밀번호 칸이 없다. 확인 문구가 다르면 `400`.  
`users` 행을 지운다. `ON DELETE CASCADE`로 그 사용자의 게시물과 `post_media`, 댓글, 좋아요, 저장, 팔로우, 스토리, `story_views`, 알림(수신·발신), `chat_participants`, 그 사용자가 보낸 `messages`가 지워진다. `chat_rooms`는 사용자 외래 키가 없으므로, 참여자가 2명 미만이 된 방을 이어서 지운다. 방 삭제는 남은 메시지도 지운다. `204`.

#### `GET /users/me/export`

설정 > 내 정보 다운로드. JSON을 바로 반환한다. 작업 큐 테이블은 없다.  
`Content-Disposition: attachment; filename="{username}-data.json"`.

```json
{
  "user": "users 열. hashed_password 제외",
  "posts": [{ "id", "caption", "location", "hide_likes", "disable_comments", "created_at", "media": ["post_media 열"] }],
  "comments": [{ "id", "post_id", "content", "created_at" }],
  "messages": [{ "id", "room_id", "content", "created_at", "is_read" }]
}
```

`comments`는 내가 쓴 행, `messages`는 내가 보낸 행만 담는다.

### 5.3. 게시물

#### `POST /posts`

`multipart/form-data`.

| 필드 | 저장 |
| :--- | :--- |
| `files` | 1~10개. `post_media` 한 행씩. 11개째는 트리거가 거부한다 |
| `caption` | 빈 값이면 `NULL`. 2200자 초과 `400` |
| `location` | 빈 값이면 `NULL`. 1~100자. 빈 문자열은 `ck_posts_location_length`에 걸린다 |
| `aspect_ratio` | `1:1`, `4:5`, `16:9` 중 하나. 이번 요청의 모든 `post_media.aspect_ratio`에 같은 값을 넣는다 |
| `hide_likes` | `posts.hide_likes`. 폼은 `true` 또는 `false` |
| `disable_comments` | `posts.disable_comments`. 폼은 `true` 또는 `false` |

허용 MIME: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/heic`, `image/heif`. 저장되는 `media_type`은 항상 `IMAGE`. 동영상은 `400 MEDIA_NOT_ALLOWED`.  
Pillow로 EXIF 회전 후 WebP(quality 85), 긴 변 1080px 이하로 저장한다. `order_index`는 0부터다.  
화면이 열릴 때 좋아요 숨김만 작성자의 `hide_likes_by_default`를 따르고, 댓글 해제는 꺼져 있다. 요청은 그 체크된 값을 그대로 보낸다.  
`201`: 게시물 객체.

#### `GET /posts/feed?cursor=&limit=10`

`posts.user_id`가 나이거나, `follows`에서 내가 `follower_id`이고 작성자가 `following_id`인 게시물. `id` 내림차순. 비활성 작성자는 빼다.  
`{ "items", "next_cursor", "has_more" }`. `recent_comments`는 최상위 2개만 넣고, 나머지는 댓글 조회로 가져온다.

#### `GET /posts/{post_id}`

상세 모달, `/p/:postId`, 알림에서 `post_id`가 있을 때의 이동. 없거나 작성자가 비활성이면 `404`.

#### `GET /posts/user/{username}?page=1&limit=12`

프로필 게시물 그리드. `posts.user_id`가 그 사용자인 행, `id` 내림차순. 비활성 계정이면 `404`.

#### `GET /posts/bookmarked?page=1&limit=12`

내 프로필의 저장됨 탭. `bookmarks.user_id`가 나인 행을 `bookmarks.created_at` 내림차순으로 준다. 다른 사람 프로필에는 이 탭이 없다.

#### `GET /posts/explore?page=1&limit=18`

활성 사용자의 게시물. `like_count` 내림차순, 동점이면 `posts.id` 내림차순. `like_count`는 `likes.post_id`의 `COUNT`다.

#### `POST /posts/{post_id}/like`

토글. `likes`에 `post_id`만 넣고 `comment_id`는 `NULL`이다. `{ "liked": true, "like_count": 90 }`.  
좋아요를 켜고 작성자가 내가 아니면 `LIKE_POST`를 넣는다. `recipient_id`는 `posts.user_id`, `comment_id`는 `NULL`. 트리거가 수신자의 게시물인지 확인한다. 내 게시물은 알림을 만들지 않는다 (`actor_id != recipient_id`).  
좋아요를 끄면 그 `likes` 행과, 내가 `actor_id`인 그 게시물의 `LIKE_POST` 알림을 지운다.

#### `POST /posts/{post_id}/bookmark`

토글. `bookmarks`의 `(user_id, post_id)`. 알림은 없다. `{ "bookmarked": true }`.

### 5.4. 댓글

`disable_comments`가 true인 게시물에는 작성 API가 `403`이다. 화면은 입력창을 숨긴다.

#### `GET /posts/{post_id}/comments`

`parent_id IS NULL`인 댓글, `id` 내림차순.  
각 항목: `id`, `post_id`, `user_id`, `parent_id`(항상 `null`), `content`, `created_at`, `user`, `likes_count`, `is_liked`.  
`likes_count`는 `likes.comment_id`의 `COUNT`다. `replies`는 주지 않는다.

#### `POST /posts/{post_id}/comments`

`{ "content": "..." }`. 앞뒤 공백을 뺀 내용이 비면 `400`. `parent_id`는 항상 `NULL`로 저장한다. `201`.  
게시물 주인이 내가 아니면 `COMMENT`를 넣는다. `post_id`와 `comment_id`를 둘 다 채운다. `recipient_id`는 `posts.user_id`다.

#### `POST /comments/{comment_id}/like`

토글. `likes`에 `comment_id`만 넣고 `post_id`는 `NULL`이다. `{ "liked": true, "likes_count": 2 }`.  
켜고 댓글 작성자가 내가 아니면 `LIKE_COMMENT`를 넣는다. `comment_id`와, 썸네일용으로 그 댓글의 `post_id`를 채운다. `recipient_id`는 `comments.user_id`다.  
끄면 그 `likes` 행과, 내가 `actor_id`인 그 댓글의 `LIKE_COMMENT` 알림을 지운다.

댓글 삭제 UI가 없으므로 삭제 API는 없다.

### 5.5. 스토리

#### `GET /stories/feed`

`expires_at > now` 이고 작성자가 활성인 스토리를 사용자별로 묶는다. 로그인 사용자는 빼다. 트레이의 **내 스토리** 칸은 새 게시물 버튼이고 스토리 행이 아니다. 스토리 업로드 API는 없다.

```json
[{
  "user": { "id": 2, "username": "traveler_june", "profile_img_url": "..." },
  "has_unseen": true,
  "stories": [{ "id": 501, "media_url": "...", "media_type": "IMAGE", "caption": null, "created_at": "...", "expires_at": "..." }]
}]
```

`has_unseen`은 그 묶음 안에 내 `story_views` 행이 없는 스토리가 하나라도 있으면 true. 팔로우 여부로 거르지 않는다.

#### `POST /stories/{story_id}/view`

뷰어가 그 장을 보여줄 때마다 `story_views`(`user_id`, `story_id`)에 넣는다. 이미 있으면 `204`. 만료된 스토리는 `404`.

#### `GET /stories/archive`

설정 > 보관함, 프로필 > 보관함 보기.  
활성 사용자의 스토리를 만료 포함해 같은 묶음 형식으로 준다. 타일에는 작성자 `username`이 붙는다. `is_archived` 컬럼은 없다. 로그인 사용자 자신의 스토리만 모으는 목록이 아니다.

### 5.6. 알림

#### `GET /notifications?limit=20`

`recipient_id`가 나인 행, `id` 내림차순.  
`id`, `actor`(사용자 요약), `type`, `post_id`, `comment_id`, `post_thumbnail`, `is_read`, `created_at`.  
`post_thumbnail`은 그 `post_id`의 `post_media` 중 `order_index`가 가장 작은 `media_url`이다. `FOLLOW`는 `post_id`가 없어 `null`이다.  
행을 누르면 `post_id`가 있으면 게시물 상세, 없으면 `actor.username` 프로필로 간다. 그때 `PATCH /notifications/{id}/read`를 호출한다.

알림을 넣을 때 맞추는 열:

| type | post_id | comment_id | recipient_id |
| :--- | :--- | :--- | :--- |
| `LIKE_POST` | 게시물 | `NULL` | `posts.user_id` |
| `COMMENT` | 게시물 | 그 댓글 | `posts.user_id` |
| `LIKE_COMMENT` | 댓글의 게시물 | 그 댓글 | `comments.user_id` |
| `FOLLOW` | `NULL` | `NULL` | 팔로우당한 사용자 |

`ck_notifications_payload`와 `trg_notifications_recipient_owns_target`이 이 조합을 검사한다. `actor_id`는 항상 로그인한 사용자이고 수신자와 같을 수 없다.

#### `PATCH /notifications/{id}/read`

내 알림의 `is_read`를 true로. 남의 알림은 `404`. `204`.

#### `PATCH /notifications/read-all`

내 알림을 모두 읽음. 화면의 **모두 읽음**. `204`.

### 5.7. 다이렉트

WebSocket 없이 요청마다 저장하고 조회한다.

응답에 `is_group`, `room_name`, `media_url`은 넣지 않는다. `chat_rooms.is_group`은 항상 0이고, 방 이름과 메시지 미디어 열은 없다.

#### `GET /chats/rooms`

`chat_participants.user_id`가 나인 방. 각 항목: `id`, `participant`(상대 사용자 요약), `last_message`, `updated_at`.  
`last_message`는 그 방의 `messages.id` 최댓값이다. 필드: `id`, `room_id`, `sender_id`, `sender_username`, `content`, `created_at`, `is_read`.

#### `POST /chats/rooms`

`{ "target_user_id": 2 }`. 같은 두 사람의 방이 있으면 그 방을 주고, 없으면 `chat_rooms` 하나와 참여자 두 행을 만든다. 트리거가 중복 1:1 방과 세 번째 참여자를 막는다.  
대상이 나이거나 비활성이면 `400` / `404`.  
프로필 **메시지 보내기**와 스토리 답장이 방을 찾거나 만들 때 쓴다. 다이렉트 상단 새 메시지 아이콘은 대상이 없어 이 API를 호출하지 않는다.

#### `GET /chats/rooms/{room_id}/messages?limit=50`

내가 참여한 방만. 오래된 순. 이 요청으로 `sender_id`가 내가 아닌 메시지의 `is_read`를 true로 바꾼다.

#### `POST /chats/rooms/{room_id}/messages`

`{ "content": "안녕하세요" }`. `trim` 후 비면 `400` (`ck_messages_content_not_blank`). 참여자가 아니면 `403`.  
`201`로 저장된 메시지를 준다. `sender_id`는 나이고 `is_read`는 false다. 방 `updated_at`을 갱신한다.

하트 버튼은 내용이 `❤️`인 같은 API다.  
스토리 답장도 새 경로가 없다. 스토리 작성자로 `POST /chats/rooms`를 호출한 뒤, 내용 `[스토리 답장] {본문}`을 이 API로 넣는다. 접두사는 클라이언트가 붙인다. `messages`에 `story_id` 열은 없다.

### 5.8. 엔드포인트와 테이블

새 경로는 없다. 스토리 답장, 맞팔로우, 프로필의 메시지 보내기는 아래 기존 경로를 다시 쓴다. 계정 삭제 본문의 비밀번호는 화면과 맞지 않아 뺐다.

| 엔드포인트 | 읽고 쓰는 테이블 |
| :--- | :--- |
| `POST /auth/signup` `login` `change-password` | `users` (`hashed_password`, `uq_users_email_lower`) |
| `GET /auth/me` | `users`, `notifications.is_read`, 방별 마지막 `messages.is_read` |
| `GET /users/{username}` | `users`, `posts`, `follows` 개수 |
| `PATCH /users/me` | `users`의 `full_name`, `bio`, `email`, `phone`, `is_private`, `hide_likes_by_default` |
| `GET /users/search` `suggested` | `users`, `follows` |
| `POST /users/{id}/follow` | `follows`, `notifications` (`FOLLOW`) |
| `POST /users/me/deactivate` | `users.is_active` |
| `DELETE /users/me` | `users`와 CASCADE, 이어서 참여자 2명 미만인 `chat_rooms` |
| `GET /users/me/export` | `users`, `posts`, `post_media`, `comments`, `messages` |
| `POST /posts` | `posts`, `post_media` |
| `GET /posts/feed` `/{id}` `user` `explore` | `posts`, `post_media`, `likes`, `bookmarks`, `comments`, `follows`, `users` |
| `GET /posts/bookmarked` | `bookmarks`, `posts` |
| `POST /posts/{id}/like` | `likes` (`post_id`), `notifications` (`LIKE_POST`) |
| `POST /posts/{id}/bookmark` | `bookmarks` |
| 댓글 조회·작성 | `comments` (`parent_id`는 `NULL`), `notifications` (`COMMENT`) |
| `POST /comments/{id}/like` | `likes` (`comment_id`), `notifications` (`LIKE_COMMENT`) |
| `GET /stories/feed` `archive` | `stories`, `story_views`, `users` |
| `POST /stories/{id}/view` | `story_views` |
| 알림 조회·읽음 | `notifications`, `users`, `post_media` |
| 방·메시지 | `chat_rooms`, `chat_participants`, `messages` |

---

## 6. 시드

`backend/seed.py`는 테이블과 `alembic_version`을 지운 뒤 `alembic upgrade head`로 스키마를 다시 적용하고, 프론트 `mock/initialData.ts`와 같은 사용자·사진 게시물·댓글·스토리·알림·1:1 대화를 넣는다. 기본 키는 목 데이터와 같다. `test`는 `7`이다.

- 로그인: 시드 계정 전부 비밀번호 `12345`. 테스트 계정은 `test@gmail.com` / `test`
- 이메일이 화면에 없는 계정: `traveler_june` `june@example.com`, `design_sarah` `sarah@example.com`, `foodie_min` `min@example.com`, `art_minji` `minji@example.com`, `coder_kim` `kim@example.com`
- 게시물 미디어는 이미지 URL, `aspect_ratio`는 `1:1`
- 스토리 `expires_at`은 시드 시각 + 24시간. 목 파일의 `2026-10-03` 만료 시각은 이미 지나 있으므로 복사하지 않는다
- `test`가 팔로우: `traveler_june`, `design_sarah`. `art_minji`가 `test`를 팔로우 (팔로우 알림과 같은 행)
- `test`의 좋아요: 게시물 `102`, `104`, 댓글 `202`, `203`. `traveler_june`과 `coder_kim`은 `test`의 게시물 `100`을 좋아한다
- `test`의 저장: 게시물 `100`, `102`
- `test`가 본 스토리: `504` (`foodie_min`, `has_unseen` false)
- 알림 4건의 수신자는 `test`이고 대상은 `test`가 가진 게시물 `100`이다. `901`·`904`는 `LIKE_POST`, `902`는 `COMMENT`(댓글 `200`), `903`은 `FOLLOW`
- 대화방 3개. 아이슬란드 메시지의 `sender_id`는 `test`(7)이다. 다이렉트 화면 가운데에 하드코딩된 두 줄은 데이터 행이 아니다
- 목 데이터의 `like_count`, `comment_count`, `follower_count` 같은 큰 숫자는 행으로 만들지 않는다. API는 `COUNT`로 계산한다
- 비밀번호는 bcrypt 해시

---

## 7. 화면과 API 대응

| 프론트 | 호출 |
| :--- | :--- |
| `LoginPage` | `POST /auth/login` |
| `SignupPage` | `POST /auth/signup` |
| 사이드바 배지 | `GET /auth/me` 의 미읽음 수 |
| `HomePage` 피드 | `GET /posts/feed` |
| `StoryTray` / `StoryViewerModal` | `GET /stories/feed`, 장마다 `POST /stories/{id}/view`. 답장은 `POST /chats/rooms` 후 메시지 전송. 하트는 API 없음. 내 스토리 칸은 `POST /posts`를 여는 버튼 |
| `ExplorePage` | `GET /posts/explore` |
| `SearchDrawer` | `GET /users/search` |
| `RightSuggestedPanel` | `GET /users/suggested`, `POST /users/{id}/follow` |
| `NotificationDrawer` | `GET /notifications`, 항목은 `PATCH /notifications/{id}/read`, **모두 읽음**은 `PATCH /notifications/read-all`, **맞팔로우**는 `POST /users/{id}/follow` |
| `PostCard` / `PostDetailModal` | 게시물 조회, 좋아요, 저장, 댓글, 댓글 좋아요 |
| `CreatePostModal` | `POST /posts` |
| `ProfilePage` | `GET /users/{username}`, 게시물·저장 목록, 팔로우, `PATCH /users/me` |
| `DirectPage` | `GET /chats/rooms`, 메시지 조회·전송. 하트는 내용 `❤️`. 프로필 **메시지 보내기**는 `POST /chats/rooms`로 그 사용자 방을 연다 |
| 비밀번호 / 연락처 / 공개 범위 / 좋아요 숨김 | `POST /auth/change-password`, `PATCH /users/me` |
| 비활성화 / 삭제 | `POST /users/me/deactivate`, `DELETE /users/me` |
| 보관함 | `GET /stories/archive` |
| 내 정보 다운로드 | `GET /users/me/export` |
| 로그아웃 | 로컬 토큰 삭제 |
