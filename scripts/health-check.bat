@echo off
REM Health Check Script for Windows

echo Checking service health...
echo.

REM API Service
echo [1/5] Checking API Service (http://localhost:3001/health)...
curl -s -o nul -w "%%{http_code}" http://localhost:3001/health > temp.txt
set /p API_STATUS=<temp.txt
del temp.txt

if "%API_STATUS%"=="200" (
    echo [OK] API Service is healthy
) else (
    echo [FAIL] API Service is not responding ^(Status: %API_STATUS%^)
)
echo.

REM Blockchain Service
echo [2/5] Checking Blockchain Service (http://localhost:3003/health)...
curl -s -o nul -w "%%{http_code}" http://localhost:3003/health > temp.txt
set /p BLOCKCHAIN_STATUS=<temp.txt
del temp.txt

if "%BLOCKCHAIN_STATUS%"=="200" (
    echo [OK] Blockchain Service is healthy
) else (
    echo [FAIL] Blockchain Service is not responding ^(Status: %BLOCKCHAIN_STATUS%^)
)
echo.

REM Pharmacy Portal
echo [3/5] Checking Pharmacy Portal (http://localhost:3002)...
curl -s -o nul -w "%%{http_code}" http://localhost:3002 > temp.txt
set /p PHARMACY_STATUS=<temp.txt
del temp.txt

if "%PHARMACY_STATUS%"=="200" (
    echo [OK] Pharmacy Portal is healthy
) else (
    echo [FAIL] Pharmacy Portal is not responding ^(Status: %PHARMACY_STATUS%^)
)
echo.

REM Regulator Portal
echo [4/5] Checking Regulator Portal (http://localhost:3004)...
curl -s -o nul -w "%%{http_code}" http://localhost:3004 > temp.txt
set /p REGULATOR_STATUS=<temp.txt
del temp.txt

if "%REGULATOR_STATUS%"=="200" (
    echo [OK] Regulator Portal is healthy
) else (
    echo [FAIL] Regulator Portal is not responding ^(Status: %REGULATOR_STATUS%^)
)
echo.

REM PostgreSQL
echo [5/5] Checking PostgreSQL (port 5432)...
netstat -an | findstr "5432" > nul
if %ERRORLEVEL%==0 (
    echo [OK] PostgreSQL is running
) else (
    echo [FAIL] PostgreSQL is not running
)
echo.

echo ========================================
echo Health Check Complete
echo ========================================
