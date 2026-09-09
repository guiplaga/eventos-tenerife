@echo off
set "PATH=C:\Users\guill\AppData\Local\Author Software\nvm\.nodejs;%PATH%"
cd /d "%~dp0"
call npx expo start --web --port 8081
