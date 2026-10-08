import os
import sys
import time
import subprocess
import webbrowser
import signal

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
DB_FILE = os.path.join(BACKEND_DIR, "instagram.db")


def print_banner():
    print("=" * 60)
    print("  📸 Muksta - One-Click Launcher")
    print("  Backend (FastAPI) + Frontend (React 18 + Vite)")
    print("=" * 60)


def check_backend_dependencies():
    print("\n[1/4] 🔍 백엔드 패키지 확인 중...")
    req_file = os.path.join(BACKEND_DIR, "requirements.txt")
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import pydantic
        import bcrypt
        import email_validator
        print("  ✓ 백엔드 패키지가 모두 정상 설치되어 있습니다.")
    except ImportError:
        print("  ⚡ 필수 백엔드 패키지를 자동 설치합니다...")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "-r", req_file],
            stdout=sys.stdout,
            stderr=sys.stderr,
        )
        print("  ✓ 백엔드 패키지 설치 완료.")


def check_frontend_dependencies():
    print("\n[2/4] 🔍 프론트엔드 패키지 확인 중...")
    node_modules = os.path.join(FRONTEND_DIR, "node_modules")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"

    if not os.path.exists(node_modules):
        print("  ⚡ 프론트엔드 node_modules를 자동 설치합니다...")
        subprocess.check_call([npm_cmd, "install"], cwd=FRONTEND_DIR, shell=False)
        print("  ✓ 프론트엔드 패키지 설치 완료.")
    else:
        print("  ✓ 프론트엔드 패키지가 이미 준비되어 있습니다.")


def check_and_seed_db():
    print("\n[3/4] 🗄️  데이터베이스 및 시드 데이터 확인 중...")
    if not os.path.exists(DB_FILE):
        print("  🌱 초기 SQLite DB 및 테스트용 더미 데이터를 자동 생성합니다...")
        seed_script = os.path.join(BACKEND_DIR, "seed.py")
        subprocess.check_call(
            [sys.executable, seed_script],
            cwd=BACKEND_DIR,
            stdout=sys.stdout,
            stderr=sys.stderr,
        )
        print("  ✓ 데이터베이스 시딩 완료.")
    else:
        print("  ✓ 데이터베이스가 이미 준비되어 있습니다.")


def run_servers():
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    processes = []

    try:
        # ── Backend (FastAPI + uvicorn --reload) ──────────────────────
        print("\n[4/4] 🚀 서버를 시작합니다...")
        print("      ├─ FastAPI  → http://127.0.0.1:8000  (docs: /docs)")
        print("      └─ Vite     → http://localhost:5173")
        print()

        backend_cmd = [
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--host", "127.0.0.1",
            "--port", "8000",
            "--reload",
        ]
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=BACKEND_DIR,
        )
        processes.append(backend_proc)

        # ── Frontend (Vite dev server) ────────────────────────────────
        frontend_proc = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=FRONTEND_DIR,
            shell=False,
        )
        processes.append(frontend_proc)

        # Wait briefly for servers to warm up, then open browser
        time.sleep(3.0)
        url = "http://localhost:5173"
        print("=" * 60)
        print("  🎉 인스타그램 클론이 성공적으로 실행되었습니다!")
        print(f"  - 프론트엔드 URL : {url}")
        print("  - 백엔드 API 문서: http://localhost:8000/docs")
        print("  - 서버를 종료하려면 Ctrl + C 를 누르세요.")
        print("=" * 60 + "\n")
        webbrowser.open(url)

        # Keep runner alive; exit if any child process dies unexpectedly
        while True:
            time.sleep(1)
            for p in processes:
                if p.poll() is not None:
                    print(f"\n⚠️  서버 프로세스(PID {p.pid})가 예기치 않게 종료되었습니다.")
                    raise KeyboardInterrupt

    except KeyboardInterrupt:
        print("\n\n🛑 종료 신호를 받았습니다. 서버 프로세스를 정리합니다...")
    finally:
        for p in processes:
            try:
                if sys.platform == "win32":
                    subprocess.call(
                        ["taskkill", "/F", "/T", "/PID", str(p.pid)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
                else:
                    p.terminate()
                    p.wait(timeout=5)
            except Exception:
                pass
        print("✅ 모든 서버가 안전하게 종료되었습니다. 안녕히 가세요!\n")


def setup_only():
    """의존성 설치 및 DB 시딩만 수행하고 서버는 띄우지 않는다."""
    print_banner()
    check_backend_dependencies()
    check_frontend_dependencies()
    check_and_seed_db()
    print("\n✅ 셋업 완료. 서버를 시작하려면 'npm run dev' 또는 'python run.py' 를 실행하세요.\n")


if __name__ == "__main__":
    if "--setup-only" in sys.argv:
        setup_only()
    else:
        print_banner()
        check_backend_dependencies()
        check_frontend_dependencies()
        check_and_seed_db()
        run_servers()
