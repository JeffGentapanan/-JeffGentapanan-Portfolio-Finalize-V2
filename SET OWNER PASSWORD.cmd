@echo off
setlocal
cd /d "%~dp0"
node server\setup-owner.mjs
pause
