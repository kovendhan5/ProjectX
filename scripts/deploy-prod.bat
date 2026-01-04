@echo off
REM Production Deployment Script for Windows

echo ==========================================
echo ProjectX Production Deployment
echo ==========================================
echo.

REM Check if .env file exists
if not exist "infrastructure\.env" (
    echo Error: infrastructure\.env file not found
    echo Please create it from infrastructure\.env.prod.example
    exit /b 1
)

echo Step 1/7: Validating environment...
node scripts\validate-env.js
if %ERRORLEVEL% neq 0 (
    echo Environment validation failed
    exit /b 1
)
echo [OK] Environment validated
echo.

echo Step 2/7: Building Docker images...
cd infrastructure
docker-compose -f docker-compose.prod.yml build --no-cache
cd ..
echo [OK] Docker images built
echo.

echo Step 3/7: Stopping existing containers...
cd infrastructure
docker-compose -f docker-compose.prod.yml down
cd ..
echo [OK] Containers stopped
echo.

echo Step 4/7: Starting PostgreSQL...
cd infrastructure
docker-compose -f docker-compose.prod.yml up -d postgres
cd ..
echo Waiting for PostgreSQL to be ready...
timeout /t 15 /nobreak
echo [OK] PostgreSQL started
echo.

echo Step 5/7: Running database migrations...
cd services\api
call npx prisma migrate deploy
call npx prisma generate
cd ..\..
echo [OK] Migrations applied
echo.

echo Step 6/7: Starting all services...
cd infrastructure
docker-compose -f docker-compose.prod.yml up -d
cd ..
echo Waiting for services to start...
timeout /t 30 /nobreak
echo [OK] Services started
echo.

echo Step 7/7: Running health checks...
call scripts\health-check.bat
echo [OK] Health checks passed
echo.

echo ==========================================
echo Deployment Complete!
echo ==========================================
echo.
echo Services are now running:
echo   API: http://localhost:3001
echo   Blockchain: http://localhost:3003
echo   Pharmacy Portal: http://localhost:3002
echo   Regulator Portal: http://localhost:3004
echo.
echo View logs:
echo   docker-compose -f infrastructure\docker-compose.prod.yml logs -f
echo.
echo Stop services:
echo   docker-compose -f infrastructure\docker-compose.prod.yml down
echo.
