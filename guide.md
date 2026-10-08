# 📘 Instagram 클론 전체 프로젝트 가이드 (guide.md)

본 문서는 **React (Frontend)** + **FastAPI (Backend)** 로 만든 Instagram 웹 애플리케이션의 로컬 개발 환경 구성, 프로덕션 배포, 현재 구현 범위를 정리한 마스터 가이드입니다. 데이터베이스는 로컬 SQLite, 서버 PostgreSQL이다.

> **현재 상태 요약 (2026-10-07)**
> - 백엔드: `backend.md`에 정리된 REST API가 전부 구현되어 있고, `https://tripastay.com`에 실제로 배포되어 정상 동작 중이다.
> - 프론트엔드: UI는 전부 구현되어 있지만 **백엔드 API를 호출하지 않는다.** `frontend/src/mock/initialData.ts`의 목 데이터를 Zustand 스토어에 올려 화면을 채우고, 로그인도 하드코딩된 테스트 계정 비교로만 통과한다 (`front.md` 참고). 아래 로드맵(6장)의 각 Phase 항목들은 "화면과 서버 API가 각각 구현됐다"는 뜻이고, "화면이 그 API를 실제로 호출한다"는 뜻이 아니다.
> - 배포 환경: AWS 계열 EC2(Amazon Linux 2023), nginx + Let's Encrypt(Certbot) 인증서가 이미 구성되어 있던 서버에 백엔드(systemd)와 프론트엔드(정적 빌드)를 올렸다.

---

## 1. 시스템 전체 아키텍처

```mermaid
graph LR
    subgraph Client["Frontend (React + Vite)"]
        UI[Instagram UI / Components]
        Store[Zustand Store (Auth/Modal)]
        TQuery[TanStack Query (Cache/Sync)]
        WSClient[WebSocket Client (DM)]
    end

    subgraph Server["Backend (FastAPI)"]
        Router[API Routers /api/v1]
        Auth[JWT & Bcrypt Security]
        MediaPipeline[Pillow Image Pipeline]
        WSHub[WebSocket Connection Hub]
        ORM[SQLAlchemy 2.0 ORM]
    end

    subgraph Storage["Persistence & Files"]
        DB[(SQLite local / PostgreSQL server)]
        Disk[Local Static & Uploads]
    end

    UI --> Store
    UI --> TQuery
    TQuery -->|REST API Requests| Router
    WSClient <-->|Realtime Chat WS| WSHub
    Router --> Auth
    Router --> MediaPipeline
    MediaPipeline --> Disk
    Router --> ORM
    ORM --> DB
    WSHub --> ORM
```

---

## 2. 전체 프로젝트 디렉토리 구조

프로젝트 루트는 `backend`와 `frontend`가 독립적이면서 조화롭게 공존하는 모노레포(Monorepo) 스타일로 구성합니다:

```
my_instagram/
├── backend/                        # FastAPI 백엔드
│   ├── app/
│   │   ├── api/v1/endpoints/       # 라우터 엔드포인트
│   │   ├── core/                   # 환경변수, 보안, DB 엔진
│   │   ├── crud/                   # DB 쿼리 리포지토리
│   │   ├── models/                 # SQLAlchemy 모델 정의
│   │   ├── schemas/                # Pydantic DTO
│   │   ├── services/               # 이미지 최적화 및 비즈니스 로직
│   │   └── main.py                 # 앱 엔트리포인트
│   ├── uploads/                    # 업로드된 이미지 저장 디렉토리
│   ├── static/                     # 기본 아바타, 로고 등
│   ├── seed.py                     # 초기 더미 데이터 시딩 스크립트
│   ├── requirements.txt            # 파이썬 의존성 패키지 목록
│   └── .env.example
├── frontend/                       # React 프론트엔드
│   ├── src/
│   │   ├── api/                    # Axios 인스턴스 및 API 함수
│   │   ├── assets/                 # 로고, 정적 이미지
│   │   ├── components/
│   │   │   ├── common/             # 아바타, 버튼, 모달 래퍼
│   │   │   ├── feed/               # 포스트 카드, 스토리 트레이
│   │   │   ├── post/               # 작성 모달, 상세 모달
│   │   │   └── layout/             # 사이드바, 바텀 네비게이션
│   │   ├── hooks/                  # TanStack Query 커스텀 훅
│   │   ├── pages/                  # 홈, 로그인, 프로필, 탐색, DM
│   │   ├── store/                  # Zustand 스토어
│   │   ├── types/                  # TypeScript 인터페이스
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── .env.example
├── db.md                           # 데이터베이스 설계 명세서
├── backend.md                      # 백엔드 API 명세서
├── front.md                        # 프론트엔드 UI/UX 명세서
├── guide.md                        # 전체 프로젝트 종합 가이드
└── README.md
```

---

## 3. 사전 요구사항 및 환경 준비

### 3.1. 필수 설치 항목
- **Python 3.10+** — 단, `backend/app/core/deps.py` 등에서 `X | None` (PEP 604) 타입 문법을 실제 런타임에 평가하므로 **3.10 미만에서는 임포트 시점에 `TypeError`로 바로 죽는다.** 배포 서버의 시스템 기본 Python이 3.9였던 탓에 겪은 문제라, 3.10 미만이면 반드시 3.11 등을 별도로 설치해서 venv를 그걸로 만들어야 한다.
- **Node.js 20 이상** — `package.json`의 `vite@8`, `rolldown`이 Node 18 이하에서 `node:util`의 `styleText` 미지원으로 빌드 시 `SyntaxError`를 낸다. Node 18 LTS로는 `npm run build`가 실패한다.
- **npm** (프로젝트는 npm 기준. `package-lock.json` 있음)
- **Git**

---

## 4. 환경 셋업 및 실행 방법

### 4.1. 백엔드 (Backend) 설정 및 기동

1. **백엔드 폴더 이동 및 가상환경 생성**:
   ```bash
   cd backend
   python -m venv venv
   ```

2. **가상환경 활성화**:
   - Windows (PowerShell):
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - macOS / Linux:
     ```bash
     source venv/bin/activate
     ```

3. **필수 패키지 설치**:
   ```bash
   pip install -r requirements.txt
   ```

   > **실제 requirements.txt 내용**:
   > ```text
   > fastapi>=0.110.0
   > uvicorn[standard]>=0.28.0
   > sqlalchemy>=2.0.28
   > pydantic>=2.6.4
   > pydantic-settings>=2.2.1
   > python-jose[cryptography]>=3.3.0
   > bcrypt>=4.0.0
   > python-multipart>=0.0.9
   > Pillow>=10.2.0
   > websockets>=12.0
   > email-validator>=2.0.0
   > alembic>=1.13.1
   > ```
   > `passlib`는 쓰지 않는다 — 비밀번호 해싱은 `app/core/security.py`에서 `bcrypt` 패키지를 직접 호출한다 (`bcrypt.hashpw` / `bcrypt.checkpw`, 72바이트 컷). `websockets`는 의존성에 있지만 실제 WebSocket 엔드포인트는 구현되어 있지 않다(다이렉트 메시지는 REST 폴링 방식).

4. **환경 변수 파일 생성 (`backend/.env`, `backend/.env.example` 복사)**:
   ```env
   PROJECT_NAME="Instagram Clone"
   SECRET_KEY="instagram-clone-super-secret-key-change-in-production"
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=120
   ENV=local
   DATABASE_URL="sqlite:///./instagram.db"
   ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
   ```
   `ENV=local`(기본값)이면 SQLite를 쓰고, `ENV=production`이면 `DATABASE_URL`은 PostgreSQL이어야 한다. `postgresql://` 로 주면 드라이버는 `postgresql+psycopg`로 바뀐다.  
   `SECRET_KEY`를 비워두면 `app/core/config.py`의 하드코딩된 기본값(위 예시와 동일한 문자열)이 그대로 쓰인다 — 로컬 개발은 괜찮지만 **운영 환경에서는 반드시 랜덤 값으로 교체**해야 한다(7장 프로덕션 배포 참고). `ACCESS_TOKEN_EXPIRE_MINUTES`를 설정하지 않으면 코드 기본값은 7일(`60*24*7`)이다.

5. **마이그레이션 적용 및 시딩 실행**:
   ```bash
   python seed.py
   ```
   *(이 스크립트는 기존 테이블과 `alembic_version`을 지운 뒤 `alembic upgrade head`로 스키마를 다시 만들고, 테스트용 계정·게시물·댓글·스토리·알림·대화방 데이터를 채웁니다. `seed.py`를 돌리지 않아도 서버를 켤 때 `main.py`의 `init_db()`가 아직 적용 안 된 마이그레이션은 실행하지만, 시드 데이터는 넣지 않습니다.)*

6. **FastAPI 서버 구동**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - Swagger API 문서: `http://localhost:8000/docs`
   - Redoc 문서: `http://localhost:8000/redoc`

---

### 4.2. 프론트엔드 (Frontend) 설정 및 기동

1. **새 터미널 열고 프론트엔드 폴더 이동**:
   ```bash
   cd frontend
   ```

2. **의존성 설치**:
   ```bash
   npm install
   ```

   > **실제 package.json 의존성** (`@tanstack/react-query` 없음, `axios`는 설치만 되어 있고 미사용 — `front.md` 참고):
   > ```json
   > "dependencies": {
   >   "react": "^19.2.8",
   >   "react-dom": "^19.2.8",
   >   "react-router-dom": "^7.18.4",
   >   "zustand": "^5.0.15",
   >   "axios": "^1.20.0",
   >   "lucide-react": "^1.50.0",
   >   "date-fns": "^4.4.0",
   >   "clsx": "^2.1.1",
   >   "tailwindcss": "^4.3.3"
   > }
   > ```
   > `vite@^8.3.0`과 `rolldown`은 **Node.js 20 이상**이 필요하다 (3.1절 참고). Node 18에서 `npm run build`를 실행하면 `node:util`의 `styleText` 미지원으로 빌드가 실패한다.

3. **환경 변수 파일 생성 (`frontend/.env`)**:
   ```env
   VITE_API_BASE_URL="http://localhost:8000/api/v1"
   VITE_STATIC_BASE_URL="http://localhost:8000"
   VITE_WS_BASE_URL="ws://localhost:8000/ws"
   ```

4. **Vite 개발 서버 구동**:
   ```bash
   npm run dev
   ```
   - 브라우저 접속: `http://localhost:5173`

---

## 5. 더미 데이터 시딩 스크립트 가이드 (`seed.py`)

`backend/seed.py`는 기존 테이블을 지우고 `alembic upgrade head`로 스키마를 다시 만든 뒤, 프론트 `mock/initialData.ts`와 동일한 사용자·게시물·댓글·스토리·알림·대화방 데이터를 넣는다. 기본 키 값도 목 데이터와 맞춘다(비밀번호는 전부 bcrypt 해시로 다시 저장).

### 실제 시드 계정 (전부 비밀번호 `12345`):
- **테스트 계정**: 이메일 `test@gmail.com` / 아이디 `test` / 비밀번호 `12345` — `/docs`로 API를 직접 테스트할 때 쓰는 계정 (id=7)
- `traveler_june` (`june@example.com`), `design_sarah` (`sarah@example.com`), `foodie_min` (`min@example.com`), `art_minji` (`minji@example.com`), `coder_kim` (`kim@example.com`)

> `admin` / `password123!` 같은 계정은 **존재하지 않는다.** 위 계정만 실제로 시드된다. 자세한 팔로우/좋아요/알림/대화방 초기 상태는 `backend.md` 6장 참고.

`seed.py` 실행 시:
1. `users` 6명 등록 (위 6개 계정)
2. `test` ↔ `traveler_june`, `design_sarah` 팔로우, `art_minji` → `test` 팔로우(팔로우 알림 포함)
3. 다중 이미지 게시물과 좋아요·댓글·북마크 데이터 등록
4. 24시간 이내 만료되는 스토리와 열람 기록 1건 등록
5. 1:1 대화방 3개와 메시지 등록

**프론트는 아직 이 데이터를 읽지 않는다** — `seed.py`를 실행해도 브라우저 화면은 바뀌지 않는다. 화면은 `frontend/src/mock/initialData.ts`만 본다. `seed.py`가 만든 데이터는 `/docs`(Swagger)나 `curl`로 API를 직접 두드려야 확인할 수 있다.

---

## 6. 단계별 개발 로드맵 (Development Roadmap)

프로젝트를 한 번에 모두 만들기보다 아래 6단계 페이즈(Phase)에 맞춰 개발하면 체계적이고 안정적인 완성에 도달할 수 있습니다.

```mermaid
timeline
    title Instagram 클론 개발 로드맵
    Phase 1 : 기반 설정 및 인증 : SQLite 모델 구축 : 회원가입 및 JWT 로그인 : 사이드바 레이아웃
    Phase 2 : 게시물 & 피드 : 미디어 업로드 파이프라인 (Pillow) : 피드 카드 및 다중 이미지 슬라이더 : 무한 스크롤
    Phase 3 : 소셜 인터랙션 : 더블 탭 좋아요 애니메이션 : 댓글/대댓글 트리 : 북마크 & 팔로우/언팔로우
    Phase 4 : 프로필 & 탐색 : 유저 프로필 그리드 : 본인 프로필 수정 : 탐색(Explore) 및 해시태그
    Phase 5 : 스토리 & 알림 : 24시간 스토리 뷰어 : 스토리 5초 타이머 바 : 인앱 알림 팝오버
    Phase 6 : 실시간 DM 채팅 : 대화방 개설 : WebSocket 실시간 메시징 : 최종 반응형 및 디자인 폴리싱
```

### [Phase 1] 기반 설정 및 회원 인증 시스템
- [ ] 백엔드: FastAPI 프로젝트 초기화, SQLite 엔진 및 SQLAlchemy `users` 모델 생성.
- [ ] 백엔드: 회원가입(`POST /auth/signup`), 로그인(`POST /auth/login`), JWT 토큰 발급 및 `get_current_user` 의존성.
- [ ] 프론트엔드: React + Tailwind 세팅, 라우터 구성, 인스타그램 스타일 로그인/회원가입 폼.
- [ ] 프론트엔드: 데스크탑 사이드바 & 모바일 헤더/바텀바 반응형 레이아웃 셸 구현.

### [Phase 2] 미디어 업로드 및 메인 피드
- [ ] 백엔드: `posts`, `post_media` 모델 생성.
- [ ] 백엔드: Pillow 기반 이미지 리사이징, 정사각형 크롭 및 `.webp` 최적화 서비스 작성.
- [ ] 백엔드: 게시물 등록(`POST /posts`) 및 피드 목록 커서 기반 페이징 API(`GET /posts/feed`).
- [ ] 프론트엔드: 포스트 작성 모달 (파일 드래그 앤 드롭, 미리보기, 캡션 입력).
- [ ] 프론트엔드: 메인 홈 피드 카드 컴포넌트, 다중 이미지 캐러셀 슬라이더, `useInfiniteQuery` 무한 스크롤.

### [Phase 3] 소셜 인터랙션 (좋아요, 댓글, 팔로우, 북마크)
- [ ] 백엔드: `likes`, `comments`, `bookmarks`, `follows` 모델 및 토글 API 구현.
- [ ] 백엔드: 댓글 및 대댓글 목록 조회/작성 API.
- [ ] 프론트엔드: 피드 이미지 **더블 탭 하트 팝업** 마이크로 인터랙션 구현.
- [ ] 프론트엔드: 좋아요 및 북마크 **낙관적 업데이트(Optimistic Updates)** 적용.
- [ ] 프론트엔드: 포스트 상세 모달 (좌측 미디어, 우측 댓글 스크롤 리스트).

### [Phase 4] 프로필, 검색 및 탐색 (Explore)
- [ ] 백엔드: 프로필 조회(`GET /users/{username}`), 프로필 수정(`PATCH /users/profile`), 유저 검색 API.
- [ ] 백엔드: 탐색 피드(`GET /explore`) 및 해시태그별 게시물 조회.
- [ ] 프론트엔드: 3열 정사각형 그리드 프로필 페이지 (게시물/저장됨 탭 지원).
- [ ] 프론트엔드: 사이드바 검색 클릭 시 슬라이드 아웃되는 실시간 검색창.
- [ ] 프론트엔드: 탐색(Explore) 페이지의 호버 오버레이 효과(좋아요/댓글 수 노출).

### [Phase 5] 24시간 스토리 및 알림 (Stories & Notifications)
- [ ] 백엔드: `stories` (만료시간 24시간) 모델 및 스토리 피드 API(`GET /stories/feed`).
- [ ] 백엔드: 좋아요/댓글/팔로우 시 발생하는 `notifications` 생성 로직.
- [ ] 프론트엔드: 피드 상단 원형 스토리 트레이 (미확인 그라디언트 링 표시).
- [ ] 프론트엔드: 풀스크린 스토리 뷰어 모달 (5초 자동 프로그레스 바 타이머, 좌우 클릭 전환).
- [ ] 프론트엔드: 알림 팝오버 드롭다운 및 읽음 처리.

### [Phase 6] 다이렉트 메시지 (DM)
- [x] 백엔드: `chat_rooms`, `chat_participants`, `messages` 모델 구축 (구현 완료).
- [x] 백엔드: ~~WebSocket 엔드포인트~~ → **REST 폴링 방식으로 변경**. `backend.md` 1.3절 결정에 따라 WebSocket, `ConnectionManager`는 만들지 않았고 `GET/POST /chats/rooms/{id}/messages`로 요청마다 저장·조회한다.
- [ ] 프론트엔드: DM 페이지(`/direct`)는 UI만 존재하고 `usePostStore`의 목 데이터로 동작 — 백엔드 REST 연동 전.
- [x] 통합 테스트 및 다크모드/반응형 세부 디테일 폴리싱 — UI 완료.

> 위 체크박스는 "백엔드 API 구현 여부"만 나타낸다. 프론트엔드가 실제로 그 API를 호출하는 Phase는 아직 없다 (front.md 참고).

---

## 7. 프로덕션 배포 가이드 (`https://tripastay.com`, 2026-10-07 기준)

이미 nginx + Certbot(Let's Encrypt) SSL이 구성된 Amazon Linux 2023 EC2 서버(`/var/www/tripastay.com` = 이 저장소의 clone)에 실제로 배포한 절차다.

### 7.1. 런타임 준비
```bash
# 시스템 기본 Python 3.9는 deps.py의 `X | None` 문법을 지원 못해 3.11을 별도 설치
sudo dnf install -y python3.11 python3.11-pip python3.11-devel
# 시스템 기본 Node 18은 Vite 8을 못 빌드하므로 20을 추가 설치 후 기본값 전환
sudo dnf install -y nodejs20 nodejs20-npm
sudo alternatives --set node /usr/bin/node-20
```

### 7.2. 백엔드
```bash
cd backend
python3.11 -m venv venv
venv/bin/pip install -r requirements.txt

# .env — SECRET_KEY는 매번 새로 생성, ALLOWED_ORIGINS는 실제 도메인
cat > .env <<EOF
PROJECT_NAME="Instagram Clone"
SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=120
ENV=production
DATABASE_URL="postgresql://instagram:password@127.0.0.1:5432/instagram"
ALLOWED_ORIGINS="https://tripastay.com,https://www.tripastay.com"
EOF

venv/bin/alembic upgrade head
```

systemd 서비스로 등록 (`/etc/systemd/system/instagram-clone-backend.service`):
```ini
[Unit]
Description=Instagram Clone FastAPI backend
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/var/www/tripastay.com/backend
ExecStart=/var/www/tripastay.com/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now instagram-clone-backend
```
127.0.0.1:8000에서만 열어두고, 외부에는 nginx를 통해서만 노출한다.

### 7.3. 프론트엔드
```bash
cd frontend
cat > .env <<EOF
VITE_API_BASE_URL=https://tripastay.com/api/v1
VITE_STATIC_BASE_URL=https://tripastay.com
VITE_WS_BASE_URL=wss://tripastay.com/ws
EOF
npm install
npm run build   # frontend/dist 생성 (Node 20 필요)
```

### 7.4. nginx (`/etc/nginx/conf.d/tripastay.com.conf`)
기존 Certbot이 관리하는 SSL 블록은 그대로 두고, `root`와 프록시 위치만 추가한다.
```nginx
root /var/www/tripastay.com/frontend/dist;
index index.html;

location / {
    try_files $uri $uri/ /index.html;   # SPA 라우팅 폴백
}
location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_set_header Host $host;
}
location /uploads/ { proxy_pass http://127.0.0.1:8000/uploads/; }
location /static/  { proxy_pass http://127.0.0.1:8000/static/; }
location ~ ^/(docs|redoc|openapi.json|health)$ {
    proxy_pass http://127.0.0.1:8000;
}
```
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 7.5. 배포 후 확인
```bash
curl -s https://tripastay.com/health                 # {"status":"ok",...}
curl -s -o /dev/null -w "%{http_code}\n" https://tripastay.com/docs   # 200
curl -s https://tripastay.com/ | grep -o "<title>.*</title>"          # <title>Instagram</title>
```
브라우저에서 바뀐 게 안 보이면 거의 항상 **브라우저 캐시** 문제다 — 시크릿 창이나 하드 리프레시(`Ctrl+Shift+R`)로 먼저 확인한다.

### 7.6. 자동 배포
`main`에 푸시하거나 Actions에서 수동 실행하면 `.github/workflows/deploy.yml`이 `scripts/deploy.sh`를 서버의 `/var/www/muksta/deploy.sh`로 복사한 뒤 실행한다. 그래서 첫 배포 때 서버에 `deploy.sh`가 없어도 자동으로 생기고, 이후에도 저장소 버전으로 갱신된다. 스크립트는 `git pull --ff-only origin main`, `pip install -r backend/requirements.txt`, `alembic upgrade head`, 프론트 빌드(`frontend/package.json`이 있을 때), `pm2 restart all` 순서로 실행한다. 어느 단계든 실패하면 즉시 멈추고 Actions에 실패로 표시된다.

GitHub 저장소 Secrets에 다음 세 값을 넣어야 워크플로가 동작한다.

| Secret | 값 |
| :--- | :--- |
| `SERVER_HOST` | 서버 공인 IP 또는 도메인 |
| `SERVER_USER` | 서버 접속 사용자 (예: `ubuntu`, `ec2-user`) |
| `SERVER_SSH_KEY` | 해당 사용자로 접속하는 개인 키 전체 |

`/var/www/muksta`는 이 저장소를 clone한 폴더여야 하고, `SERVER_USER`에게 쓰기 권한이 있어야 한다. PM2도 같은 사용자로 실행 중이어야 한다. 저장소가 private이면 서버의 `git pull`용 인증도 따로 필요하다.

### 7.7. 다음 단계 (아직 안 함)
배포는 프론트 UI와 백엔드 API를 "같은 서버에 각자" 올려둔 상태다. 실제로 로그인/피드/업로드가 되게 하려면 `front.md` 7.2절의 프론트-백엔드 연동 작업이 필요하다.

---

## 8. 핵심 개발 주의사항 및 팁

1. **SQLite 외래 키 활성화**:
   - SQLite는 기본적으로 외래키 체크가 꺼져 있으므로 SQLAlchemy 엔진 연결 시 `PRAGMA foreign_keys=ON;`을 반드시 걸어야 합니다.
2. **미디어 파일 경로 서빙**:
   - 업로드된 이미지는 로컬 `uploads/` 폴더에 물리적으로 저장하고, FastAPI의 `app.mount("/uploads", StaticFiles(directory="uploads"))`를 통해 웹에서 즉시 URL로 접근 가능하도록 합니다.
3. **CORS 설정**:
   - 프론트엔드(5173 포트)와 백엔드(8000 포트)가 다르므로 백엔드 `main.py`의 `CORSMiddleware`에 프론트엔드 주소를 정확히 허용해야 쿠키 및 인증 헤더가 전달됩니다.
4. **Optimistic Updates 적극 활용**:
   - 인스타그램의 핵심은 '즉각적인 손맛'입니다. 좋아요 하트를 누를 때 서버 응답을 기다리지 않고 UI가 먼저 빨간색으로 바뀌어야 실제 인스타그램과 같은 쾌적함을 체감할 수 있습니다.
