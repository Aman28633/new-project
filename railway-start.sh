#!/bin/sh
set -e

export DATABASE_URL="${DATABASE_URL:-sqlite:////tmp/team_task_manager.db}"
export SECRET_KEY="${SECRET_KEY:-railway-change-this-secret}"
export FRONTEND_ORIGIN="${FRONTEND_ORIGIN:-*}"
export FRONTEND_ORIGINS="${FRONTEND_ORIGINS:-*}"

cd /app/backend
/opt/venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &

cd /app/frontend
exec npm run start -- -H 0.0.0.0 -p "${PORT:-3000}"
