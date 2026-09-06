@echo off
title TRYON Super Admin Panel
echo Starting TRYON Super Admin Panel on http://localhost:3000...
start http://localhost:3000
powershell.exe -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 3000
pause
