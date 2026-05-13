@echo off
cd /d "%~dp0"

:: Verificar si Node.js esta instalado
where node >nul 2>&1
if errorlevel 1 (
    echo Node.js no encontrado. Instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

:: Verificar si ya hay un servidor corriendo en el puerto 4000
netstat -ano | findstr ":4000 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    :: Ya esta corriendo, solo abrir el browser
    start "" "http://localhost:4000"
    exit /b 0
)

:: Instalar dependencias si faltan
if not exist "node_modules" (
    npm install --silent
)

:: Arrancar servidor en segundo plano
start "D-CLOCK Panel" /B node server.js

:: Esperar a que el servidor arranque
timeout /t 2 /nobreak >nul

:: Abrir browser
start "" "http://localhost:4000"
