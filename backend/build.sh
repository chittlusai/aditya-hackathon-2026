#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Starting Backend & Frontend Build        "
echo "=========================================="

# 1. Install Python dependencies
echo ">>> Installing Python requirements..."
pip install --upgrade pip
pip install -r requirements.txt

# 2. Ensure Node.js & npm are present
if ! command -v npm >/dev/null 2>&1; then
  echo ">>> Installing portable Node.js (v20) for Render environment..."
  NODE_URL="https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.xz"
  mkdir -p /tmp/node
  curl -fsSL "$NODE_URL" | tar -xJ -C /tmp/node --strip-components=1
  export PATH="/tmp/node/bin:$PATH"
  echo ">>> Node installed: $(node --version), npm: $(npm --version)"
fi

# 3. Build React frontend
if [ -d "../frontend" ]; then
  echo ">>> Building React frontend from ../frontend..."
  cd ../frontend
  npm install
  npm run build
  cd ../backend
elif [ -d "frontend" ]; then
  echo ">>> Building React frontend from frontend..."
  cd frontend
  npm install
  npm run build
  cd ..
fi

if [ -d "../frontend/dist" ]; then
  mkdir -p dist
  cp -r ../frontend/dist/* dist/ 2>/dev/null || true
fi

echo "=========================================="
echo " Build Completed Successfully!            "
echo "=========================================="
