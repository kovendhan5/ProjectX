@echo off
REM Utility script to reset the development environment on Windows

echo Resetting ProjectX development environment...

REM Stop all services
echo Stopping Docker services...
cd infrastructure
docker-compose down -v
cd ..

REM Clean build artifacts
echo Cleaning build artifacts...
for /d /r . %%d in (node_modules) do @if exist "%%d" rd /s /q "%%d"
for /d /r . %%d in (dist) do @if exist "%%d" rd /s /q "%%d"
for /d /r . %%d in (.next) do @if exist "%%d" rd /s /q "%%d"

REM Reinstall dependencies
echo Installing dependencies...
call npm install

REM Start PostgreSQL
echo Starting PostgreSQL...
cd infrastructure
docker-compose up -d postgres
cd ..

REM Wait for PostgreSQL
echo Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul

REM Setup database
echo Setting up database...
cd services\api
call npx prisma migrate dev --name init
call npx prisma generate
call npm run seed
cd ..\..

echo.
echo Environment reset complete!
echo.
echo To start development, run: make dev
pause
