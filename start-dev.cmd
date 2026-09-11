@echo off
REM Arranca el backend evitando el error del caracter & en la ruta.
cd /d "%~dp0"
call npm run start:dev
