@echo off
REM Environment Setup Script for Windows

echo ========================================
echo ProjectX Environment Setup
echo ========================================
echo.

REM Check if .env files exist, if not copy from examples
echo [1/5] Setting up environment files...

if not exist "services\api\.env" (
    echo Creating services\api\.env from example...
    copy "services\api\.env.example" "services\api\.env"
)

if not exist "services\blockchain\.env" (
    echo Creating services\blockchain\.env from example...
    copy "services\blockchain\.env.example" "services\blockchain\.env"
)

if not exist "clients\pharmacy-portal\.env.local" (
    echo Creating clients\pharmacy-portal\.env.local from example...
    copy "clients\pharmacy-portal\.env.example" "clients\pharmacy-portal\.env.local"
)

if not exist "clients\regulator-portal\.env.local" (
    echo Creating clients\regulator-portal\.env.local from example...
    copy "clients\regulator-portal\.env.example" "clients\regulator-portal\.env.local"
)

echo.
echo [2/5] Installing dependencies...
call npm install

echo.
echo [3/5] Starting PostgreSQL...
cd infrastructure
call docker-compose up -d postgres
cd ..

echo.
echo [4/5] Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak

echo.
echo [5/5] Running database migrations and seed...
cd services\api
call npx prisma migrate dev --name init
call npx prisma generate
call npm run seed
cd ..\..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start all services, run:
echo   make dev
echo.
echo Or start individual services:
echo   npm run dev:api
echo   npm run dev:blockchain
echo   npm run dev:pharmacy
echo   npm run dev:regulator
echo.
