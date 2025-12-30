@echo off
title Mobile Store Live Server
echo Starting Live Server for your project...
echo This will open your website in the default browser with auto-reload.
echo Press Ctrl+C in this window to stop the server.
echo.
npx live-server . --port=5500 --no-browser=false
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: Could not start Live Server. 
    echo Please make sure Node.js is installed correctly.
    pause
)
