@echo off
cd /d "%~dp0"

echo Nettoyage et installation des dependances...
if exist "node_modules\" rmdir /s /q "node_modules"
if exist "package-lock.json" del /q "package-lock.json"

call npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation des dependances.
    pause
    exit /b %errorlevel%
)

echo Demarrage du projet...
call npx vite
pause
