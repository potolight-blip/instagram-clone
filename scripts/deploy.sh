#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

git fetch origin main
git checkout -f main
git reset --hard origin/main

cd "$ROOT/backend"
if [[ ! -f .env ]]; then
  echo "backend/.env is missing. Create it on the server before deploying."
  exit 1
fi

if [[ ! -x venv/bin/python ]] || ! venv/bin/python -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)'; then
  rm -rf venv
  python3.11 -m venv venv
fi
venv/bin/pip install -r requirements.txt
venv/bin/alembic upgrade head

cd "$ROOT/frontend"
node_major="$(node -p "process.versions.node.split('.')[0]")"
if [[ "$node_major" -lt 20 ]]; then
  echo "Node.js 20 or newer is required. Found $(node -v)."
  exit 1
fi
if [[ ! -f .env ]]; then
  cat > .env <<'EOF'
VITE_API_BASE_URL=https://tripastay.com/api/v1
VITE_STATIC_BASE_URL=https://tripastay.com
VITE_WS_BASE_URL=wss://tripastay.com/ws
EOF
fi
npm ci
npm run build

sudo -n systemctl restart instagram-clone-backend
