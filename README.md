# 📸 Muksta Full-Stack (인스타그램 클론)

Muksta 프로젝트는 **React 18 + Vite** 프론트엔드와 **FastAPI + SQLAlchemy** 백엔드로 구성된 풀스택 소셜 네트워크 서비스입니다. 로컬 데이터베이스는 SQLite, 서버는 PostgreSQL입니다.  
이번 단계에서는 요청에 따라 **프론트엔드 중심**으로 인스타그램의 모든 시각적 완성도와 마이크로 인터랙션을 완벽하게 구현하였습니다.

---

## 🚀 빠른 시작 가이드 (Quick Start)

### 1. 프론트엔드 실행 (React + Vite)
프론트엔드 개발 서버는 현재 백그라운드에서 구동 중이거나 아래 명령어로 즉시 실행할 수 있습니다:

```bash
cd frontend
npm run dev
```

브라우저에서 **`http://localhost:5173`** 에 접속하시면 실제 인스타그램과 동일한 UI 및 모든 인터랙션을 즉시 확인하실 수 있습니다.

### 2. 백엔드 기본 구조 및 실행 (FastAPI)
백엔드는 `front.md`, `backend.md`, `db.md` 명세서의 계층형 아키텍처 및 SQLAlchemy 모델을 준수하여 기본 구조가 구축되어 있습니다.

```bash
cd backend
# 가상환경 생성 및 활성화
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows

# 패키지 설치
pip install -r requirements.txt

# 테스트 더미 데이터 시딩 (선택)
python seed.py

# FastAPI 서버 실행
uvicorn app.main:app --reload --port 8000
```
- Swagger API 문서: `http://localhost:8000/docs`
- Redoc API 문서: `http://localhost:8000/redoc`

---

## 🎨 구현된 프론트엔드 핵심 기능 & 시각적 완성도

1. **디자인 시스템 및 테마**:
   - 인스타그램 공식 다크 모드 (순수 블랙 `#000000`, 매트 다크 서피스 `#121212`, 카드 `#262626`, 인디고 블루 `#0095F6`, 코랄 레드 하트 `#ED4956`)
   - 24시간 미확인 스토리 그라디언트 링 (`linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)`)
   - 읽은 스토리 그레이 링 전환
   - 모던 산세리프 타이포그래피 및 커스텀 스크롤바

2. **반응형 3단계 레이아웃 아키텍처**:
   - **Desktop (>= 1264px)**: 245px 좌측 확장 사이드바 (워드마크 로고, 텍스트 라벨, 알림/메시지 배지) + 630px 중앙 피드 + 320px 우측 추천 패널
   - **Tablet (768px ~ 1263px)**: 72px 슬림 사이드바 (아이콘만 중앙 정렬 표시) + 중앙 피드
   - **Mobile (< 768px)**: 44px 상단 헤더 + 모바일 스크롤 뷰 + 48px 하단 고정 네비게이션 바

3. **피드 & 인터랙션**:
   - **스토리 트레이 (`StoryTray`)**: 가로 스크롤, 내 스토리 추가 (+), 팔로우 유저 스토리 목록, 클릭 시 풀스크린 뷰어 오픈
   - **더블 탭 좋아요 (`Double Tap to Like`)**: 사진 영역을 연속 2회 클릭 시 중앙에 거대한 하트 아이콘이 팝업 애니메이션(`scale(0) -> scale(1.3) -> scale(1.0)`) 후 사라짐
   - **다중 이미지 캐러셀**: 좌/우 슬라이드 화살표 및 하단 도트 인디케이터
   - **원터치 댓글 & 즉석 피드백**: 댓글 입력 즉시 피드 및 상세 창에 반영

4. **모달 시스템**:
   - **게시물 작성 모달 (`CreatePostModal`)**: 3단계 스텝퍼 (1단계 미디어 드래그앤드롭 / 로컬 파일 / 샘플 프리셋 선택 -> 2단계 1:1, 4:5, 16:9 비율 설정 -> 3단계 문구, 2,200자 카운터, 위치 입력 및 공유)
   - **게시물 상세 모달 (`PostDetailModal`)**: 인스타그램 데스크톱 분할 뷰 (좌측 미디어 캐러셀, 우측 작성자 정보 + 스크롤 댓글 트리 + 댓글별 좋아요 + 액션 바 + 즉석 댓글 입력)
   - **스토리 뷰어 모달 (`StoryViewerModal`)**: 9:16 풀스크린 모바일 뷰어, 5초 자동 진행 타이머 바, 좌/우 화면 클릭 전환, 일시정지, DM 답장 전송

5. **라우팅 및 서브 페이지**:
   - `/`: 메인 피드 및 스토리
   - `/explore`: 3열 정사각형 그리드, 마우스 호버 시 좋아요/댓글 수 오버레이, 다중 사진 인디케이터
   - `/reels`: 세로형 릴스 플레이어 (사운드 트랙 마키, 좋아요, 댓글, 공유 카운터)
   - `/direct`: DM 대화방 목록 + 1:1 실시간 대화창 (말풍선, 메시지 전송, 하트 퀵 전송)
   - `/:username`: 유저 프로필 헤더 (통계 카운트, 바이오, 프로필 편집) 및 `게시물` | `저장됨` | `태그됨` 탭 그리드
   - `/login` & `/signup`: 인스타그램 폰 목업 애니메이션 및 로그인/회원가입 폼

---

## 📁 디렉토리 구조 요약

```
my_instagram/
├── backend/                   # FastAPI + SQLAlchemy 2.0 백엔드
│   ├── app/
│   │   ├── api/v1/endpoints/  # auth, users, posts 라우터
│   │   ├── core/              # database.py (SQLite WAL, foreign keys), config, security
│   │   ├── models/            # User, Post, PostMedia, Like, Bookmark, Comment, Follow, Story, Chat
│   │   ├── schemas/           # Pydantic DTOs
│   │   └── main.py            # FastAPI entrypoint, CORS, Static mounts
│   ├── requirements.txt
│   ├── seed.py                # 초기 더미 데이터 시딩 스크립트
│   └── .env.example
├── frontend/                  # React 18 + Vite 프론트엔드
│   ├── src/
│   │   ├── components/        # common, layout, feed, post, story
│   │   ├── pages/             # HomePage, ExplorePage, ReelsPage, DirectPage, ProfilePage, LoginPage, SignupPage
│   │   ├── store/             # Zustand (useAuthStore, useModalStore, usePostStore)
│   │   ├── types/             # TypeScript 인터페이스
│   │   ├── mock/              # 고화질 샘플 데이터
│   │   ├── App.tsx
│   │   └── index.css          # 인스타그램 디자인 토큰 및 마이크로 애니메이션
│   ├── tailwind.config.js
│   └── package.json
├── db.md                      # DB 설계 명세서
├── backend.md                 # 백엔드 API 명세서
├── front.md                   # 프론트엔드 명세서
├── guide.md                   # 전체 프로젝트 가이드
└── README.md
```
