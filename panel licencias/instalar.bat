@echo off
title D-CLOCK - Instalador
color 0F
echo.
echo  ==========================================
echo   D-CLOCK Panel de Licencias - Instalador
echo  ==========================================
echo.

:: Verificar si ya esta instalado Node.js
where node >nul 2>&1
if not errorlevel 1 (
    echo  [OK] Node.js ya esta instalado.
    node -v
    goto :instalar_deps
)

echo  Node.js no encontrado. Instalando automaticamente...
echo.

:: Intentar con winget primero (Windows 10 1809+)
where winget >nul 2>&1
if not errorlevel 1 (
    echo  Instalando Node.js con winget...
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    if not errorlevel 1 goto :reload_path
)

:: Si winget no funciono, descargar el instalador directamente
echo  Descargando instalador de Node.js LTS...
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi' -OutFile '%TEMP%\node-installer.msi' }"
if errorlevel 1 (
    echo.
    echo  Error al descargar. Por favor instala manualmente desde:
    echo  https://nodejs.org/en/download
    pause
    exit /b 1
)
echo  Instalando Node.js...
msiexec /i "%TEMP%\node-installer.msi" /quiet /norestart
del "%TEMP%\node-installer.msi" >nul 2>&1

:reload_path
:: Recargar PATH para encontrar node recien instalado
set "PATH=%PATH%;%ProgramFiles%\nodejs;%APPDATA%\npm"
call refreshenv >nul 2>&1

:: Verificar que instalo correctamente
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo  IMPORTANTE: Node.js fue instalado pero necesitas
    echo  CERRAR esta ventana y volver a ejecutar el instalador.
    echo.
    pause
    exit /b 0
)
echo  [OK] Node.js instalado correctamente.

:instalar_deps
echo.
echo  Instalando dependencias del panel...
cd /d "%~dp0"
npm install
if errorlevel 1 (
    echo  Error al instalar dependencias.
    pause
    exit /b 1
)

echo.
echo  ==========================================
echo   Instalacion completada exitosamente!
echo  ==========================================
echo.
echo  Ahora puedes usar el icono "D-CLOCK Panel"
echo  en tu escritorio para abrir el panel.
echo.
echo  Si no tienes el icono, ejecuta:
echo  crear-acceso-directo.ps1
echo.
pause
