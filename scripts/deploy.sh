#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/muksta"
BRANCH="main"

step() { echo; echo "==> $*"; }

# Non-interactive SSH shells skip nvm setup, so pm2/npm may be missing from PATH.
if ! command -v pm2 >/dev/null 2>&1 && [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  # shellcheck disable=SC1091
  source "$HOME/.nvm/nvm.sh"
fi

cd "$APP_DIR"
if [[ ! -d .git ]]; then
  echo "$APP_DIR is not a git repository. Clone the project there first."
  exit 1
fi

step "git pull origin $BRANCH"
git pull --ff-only origin "$BRANCH"

step "pip install -r backend/requirements.txt"
VENV=""
for dir in backend/venv backend/.venv venv .venv; do
  if [[ -x "$dir/bin/python" ]]; then
    VENV="$dir"
    break
  fi
done
if [[ -z "$VENV" ]]; then
  VENV="backend/venv"
  PYTHON="$(command -v python3.11 || command -v python3)"
  "$PYTHON" -m venv "$VENV"
fi
VENV="$APP_DIR/$VENV"
"$VENV/bin/pip" install -r backend/requirements.txt

step "alembic upgrade head"
(cd backend && "$VENV/bin/alembic" upgrade head)

if [[ -f frontend/package.json ]]; then
  step "frontend build"
  (cd frontend && npm ci && npm run build)
fi

step "pm2 restart all"
pm2 restart all
pm2 save
pm2 status

echo
echo "Deploy finished: $(git rev-parse --short HEAD)"
