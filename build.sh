#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=========================================="
echo " Starting Full-Stack Build for Render     "
echo "=========================================="

# 1. Install Python backend dependencies
echo ">>> Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# 2. Build React Vite frontend
echo ">>> Installing and Building React Frontend..."
if [ -d "frontend" ]; then
  cd frontend
  npm install
  npm run build
  cd ..
  echo ">>> Frontend build succeeded: frontend/dist created."
else
  echo ">>> Note: Checking current directory for package.json..."
  if [ -f "package.json" ]; then
    npm install
    npm run build
  fi
fi

# 3. Mirror frontend dist to backend/dist as a fallback
if [ -d "frontend/dist" ]; then
  mkdir -p backend/dist
  cp -r frontend/dist/* backend/dist/ 2>/dev/null || true
  echo ">>> Synced frontend/dist to backend/dist."
fi

echo "=========================================="
echo " Full-Stack Build Completed Successfully! "
echo "=========================================="
