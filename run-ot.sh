#!/bin/bash
# ============================================
# ตัวรันแอป "ตัวคิดเวลา OT (ประเทศไทย)"
# ============================================

cd "$(dirname "$0")"

if ! command -v node &> /dev/null; then
  echo "❌ ไม่พบ Node.js กรุณาติดตั้งจาก https://nodejs.org/"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "📦 กำลังติดตั้ง express..."
  npm install express
fi

echo "🚀 เริ่มรันแอปที่ http://localhost:3000"
# เปิด browser ตาม OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open "http://localhost:3000"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  open "http://localhost:3000"
elif [[ "$OS" == "Windows_NT" ]]; then
  start "http://localhost:3000"
fi

node server.js
