#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

git pull --ff-only origin main

cd "$ROOT/backend"
if [[ ! -x venv/bin/python ]]; then
  python3.11 -m venv venv
fi
venv/bin/pip install -r requirements.txt
venv/bin/alembic upgrade head

cd "$ROOT/frontend"
npm install
npm run build

sudo systemctl restart instagram-clone-backend
