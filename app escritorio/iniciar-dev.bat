@echo off
title D-CLOCK Desktop - Desarrollo
cd /d "%~dp0"

:: Instalar dependencias si no existen
if not exist "%~dp0node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 ( echo Error al instalar. & pause & exit /b 1 )
)

:: Iniciar app en modo desarrollo
echo Iniciando D-CLOCK Desktop...
npm start
