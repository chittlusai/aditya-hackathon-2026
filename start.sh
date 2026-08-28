#!/usr/bin/env bash
set -e

# Find virtualenv python or uvicorn
for venv_path in \
  "/opt/render/project/src/.venv" \
  "/opt/render/project/src/backend/.venv" \
  "./.venv" \
  "../.venv" \
  "$HOME/.venv" \
  "$HOME/.local"
do
  if [ -f "$venv_path/bin/uvicorn" ]; then
    export PATH="$venv_path/bin:$PATH"
    echo "Found uvicorn in $venv_path/bin/uvicorn"
    exec "$venv_path/bin/uvicorn" main:app --host 0.0.0.0 --port "${PORT:-8000}"
  fi
  if [ -f "$venv_path/bin/python" ]; then
    export PATH="$venv_path/bin:$PATH"
    echo "Found python in $venv_path/bin/python"
    exec "$venv_path/bin/python" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
  fi
done

# Fallback: check if uvicorn is in PATH
if command -v uvicorn >/dev/null 2>&1; then
  echo "Found uvicorn in PATH"
  exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
fi

# Fallback: check which python3/python has uvicorn module
for py in python3 python /usr/local/bin/python3 /usr/bin/python3; do
  if command -v "$py" >/dev/null 2>&1; then
    if "$py" -c "import uvicorn" >/dev/null 2>&1; then
      echo "Found uvicorn in $py"
      exec "$py" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
    fi
  fi
done

echo "Error: Could not locate uvicorn or Python environment."
exit 1
