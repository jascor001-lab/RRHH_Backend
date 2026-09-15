@echo off
title RRHH Backend (puerto 4008)
echo.
echo ========================================
echo  RRHH Backend - inicio seguro Windows
echo  Usa ruta sin caracter especial "&"
echo  Puerto: 4008
echo ========================================
echo.

cd /d "%~dp0"
if not exist "package.json" (
  echo ERROR: No se encontro package.json en %CD%
  pause
  exit /b 1
)

if not exist "node_modules\tsc-watch" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo ERROR al instalar dependencias.
    pause
    exit /b 1
  )
)

echo Compilando...
call npm run build
if errorlevel 1 (
  echo ERROR al compilar.
  pause
  exit /b 1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4008 ^| findstr LISTENING') do (
  echo Liberando puerto 4008 (PID %%a)...
  taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Iniciando backend en modo desarrollo (puerto 4008)...
echo Para detener: Ctrl+C
echo.

call npm run start:dev
