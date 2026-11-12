@echo off
title Synaptix Matrix - 3D Digital Public Library
echo ==================================================================
echo   LAUNCHING DIGITAL PUBLIC LIBRARY & MANAGEMENT SYSTEM
echo ==================================================================
echo.
cd /d "%~dp0"

echo [1/2] Verifying dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm.cmd install
)

echo.
echo [2/2] Starting Node.js Express server on http://localhost:5000 ...
echo.
start http://localhost:5000
node server/server.js
pause
