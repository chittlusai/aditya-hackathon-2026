#!/usr/bin/env bash
set -e

PORT="${PORT:-10000}"

echo "=========================================="
echo " Starting Arogya Setu Local Backend       "
echo " Host: 0.0.0.0  |  Port: ${PORT}          "
echo "=========================================="

if command -v uvicorn >/dev/null 2>&1; then
  echo ">>> Starting via uvicorn command..."
  exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
fi

if python -m uvicorn --version >/dev/null 2>&1; then
  echo ">>> Starting via python -m uvicorn..."
  exec python -m uvicorn main:app --host 0.0.0.0 --port "$PORT"
fi

if python3 -m uvicorn --version >/dev/null 2>&1; then
  echo ">>> Starting via python3 -m uvicorn..."
  exec python3 -m uvicorn main:app --host 0.0.0.0 --port "$PORT"
fi

for venv_path in \
  "/opt/render/project/src/.venv" \
  "/opt/render/project/src/backend/.venv" \
  "./.venv" \
  "../.venv" \
  "$HOME/.venv" \
  "$HOME/.local"
do
  if [ -f "$venv_path/bin/uvicorn" ]; then
    echo ">>> Starting via $venv_path/bin/uvicorn..."
    exec "$venv_path/bin/uvicorn" main:app --host 0.0.0.0 --port "$PORT"
  fi
  if [ -f "$venv_path/bin/python" ]; then
    echo ">>> Starting via $venv_path/bin/python..."
    exec "$venv_path/bin/python" -m uvicorn main:app --host 0.0.0.0 --port "$PORT"
  fi
done

if command -v gunicorn >/dev/null 2>&1; then
  echo ">>> Starting via gunicorn..."
  exec gunicorn -w 2 -k uvicorn.workers.UvicornWorker main:app --bind "0.0.0.0:$PORT"
fi

echo ">>> Starting via direct python main.py..."
exec python main.py
