@echo off
cd /d "%~dp0"

:: Intentar agregar ruta comun de Node.js al PATH por si acaso
set "PATH=%PATH%;%ProgramFiles%\nodejs;%APPDATA%\npm"

:: Verificar Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo  Node.js no encontrado.
    echo  Ejecutando instalador automatico...
    echo.
    call "%~dp0instalar.bat"
    exit /b
)

:: Si no hay node_modules, instalar dependencias
if not exist "%~dp0node_modules" (
    npm install --silent
)

:: Verificar si el servidor ya esta corriendo en puerto 4000
netstat -ano | findstr ":4000 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    start "" "http://localhost:4000"
    exit /b 0
)

:: Arrancar servidor en segundo plano
start "D-CLOCK Panel Server" /B node "%~dp0server.js"

:: Esperar a que arranque
timeout /t 2 /nobreak >nul

:: Abrir browser
start "" "http://localhost:4000"
