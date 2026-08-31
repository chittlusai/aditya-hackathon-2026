#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Starting Full-Stack Build for Render     "
echo "=========================================="

# 1. Install Python dependencies
echo ">>> Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 2. Ensure Node.js & npm are present for building React Vite app
if ! command -v npm >/dev/null 2>&1; then
  echo ">>> Installing portable Node.js (v20) for Render environment..."
  NODE_URL="https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.xz"
  mkdir -p /tmp/node
  curl -fsSL "$NODE_URL" | tar -xJ -C /tmp/node --strip-components=1
  export PATH="/tmp/node/bin:$PATH"
  echo ">>> Node installed: $(node --version), npm: $(npm --version)"
fi

# 3. Build React Vite frontend
echo ">>> Building React Vite Frontend..."
if [ -d "frontend" ]; then
  cd frontend
  npm install
  npm run build
  cd ..
elif [ -f "package.json" ]; then
  npm install
  npm run build
fi

# 4. Mirror frontend/dist to backend/dist and dist
if [ -d "frontend/dist" ]; then
  mkdir -p backend/dist dist
  cp -r frontend/dist/* backend/dist/ 2>/dev/null || true
  cp -r frontend/dist/* dist/ 2>/dev/null || true
  echo ">>> Frontend built successfully and mirrored to backend/dist."
fi

echo "=========================================="
echo " Full-Stack Build Completed Successfully! "
echo "=========================================="
