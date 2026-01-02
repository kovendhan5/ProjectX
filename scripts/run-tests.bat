@echo off
REM Run all tests with coverage reporting (Windows)

setlocal

echo Running ProjectX Test Suite
echo ================================
echo.

REM Check if we're in the project root
if not exist "package.json" (
    echo Error: Must run from project root directory
    pause
    exit /b 1
)

REM Set test environment
set NODE_ENV=test

echo Backend Services
echo -------------------

REM Test API Service
if exist "services\api" (
    echo Testing API Service...
    cd services\api
    call npm test -- --coverage --maxWorkers=50%%
    if %errorlevel%==0 (
        echo API Service tests completed
    ) else (
        echo API Service tests failed
    )
    cd ..\..
    echo.
)

REM Test Blockchain Service
if exist "services\blockchain" (
    echo Testing Blockchain Service...
    cd services\blockchain
    call npm test -- --coverage --maxWorkers=50%%
    if %errorlevel%==0 (
        echo Blockchain Service tests completed
    ) else (
        echo Blockchain Service tests failed
    )
    cd ..\..
    echo.
)

echo Frontend Applications
echo ------------------------

REM Test Pharmacy Portal
if exist "clients\pharmacy-portal" (
    echo Testing Pharmacy Portal...
    cd clients\pharmacy-portal
    call npm test -- --coverage --maxWorkers=50%%
    if %errorlevel%==0 (
        echo Pharmacy Portal tests completed
    ) else (
        echo Pharmacy Portal tests failed
    )
    cd ..\..
    echo.
)

REM Test Regulator Portal
if exist "clients\regulator-portal" (
    echo Testing Regulator Portal...
    cd clients\regulator-portal
    call npm test -- --coverage --maxWorkers=50%%
    if %errorlevel%==0 (
        echo Regulator Portal tests completed
    ) else (
        echo Regulator Portal tests failed
    )
    cd ..\..
    echo.
)

echo.
echo Test suite completed!
echo.
echo Coverage reports available in:
echo    - services\api\coverage\
echo    - services\blockchain\coverage\
echo.
echo View HTML reports:
echo    start services\api\coverage\lcov-report\index.html

pause
