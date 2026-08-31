#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Starting Arogya Setu Local Backend       "
echo " PORT: ${PORT:-8000}                      "
echo "=========================================="

if python -m uvicorn --version >/dev/null 2>&1; then
  echo ">>> Starting via python -m uvicorn main:app..."
  exec python -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
fi

if python3 -m uvicorn --version >/dev/null 2>&1; then
  echo ">>> Starting via python3 -m uvicorn main:app..."
  exec python3 -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
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
    exec "$venv_path/bin/uvicorn" main:app --host 0.0.0.0 --port "${PORT:-8000}"
  fi
  if [ -f "$venv_path/bin/python" ]; then
    echo ">>> Starting via $venv_path/bin/python..."
    exec "$venv_path/bin/python" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
  fi
done

if command -v uvicorn >/dev/null 2>&1; then
  echo ">>> Starting via uvicorn command..."
  exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
fi

echo "Error: Could not locate uvicorn or Python environment."
exit 1
