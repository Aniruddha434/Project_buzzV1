@echo off
echo 🔧 Fixing React dependencies and module resolution issues...

REM Remove node_modules and package-lock.json
echo 📦 Cleaning up existing dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

REM Clear npm cache
echo 🧹 Clearing npm cache...
npm cache clean --force

REM Install dependencies with exact versions
echo ⬇️ Installing compatible dependencies...
npm install

REM Clear Vite cache
echo 🗑️ Clearing Vite cache...
if exist .vite rmdir /s /q .vite

echo ✅ Dependencies fixed! You can now run 'npm run dev' to start the development server.
pause
