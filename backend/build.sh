#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=========================================="
echo " Starting Backend & Frontend Build        "
echo "=========================================="

# 1. Install Python dependencies
echo ">>> Installing Python requirements..."
pip install --upgrade pip
pip install -r requirements.txt

# 2. Build React frontend if located in parent folder
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

# 3. Mirror frontend dist if exists
if [ -d "../frontend/dist" ]; then
  mkdir -p dist
  cp -r ../frontend/dist/* dist/ 2>/dev/null || true
  echo ">>> Synced ../frontend/dist to backend/dist."
fi

echo "=========================================="
echo " Build Completed Successfully!            "
echo "=========================================="
