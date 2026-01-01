@echo off
REM Environment Variables Validation Script (Windows)
REM Checks that all required environment variables are set

echo Validating environment variables...
echo.

set HAS_ERRORS=0

REM Function to check environment variable
call :check_var "DATABASE_URL" required
call :check_var "API_PORT" optional
call :check_var "NODE_ENV" optional
call :check_var "BLOCKCHAIN_URL" optional
call :check_var "NEXT_PUBLIC_API_URL" optional

echo.
echo === Checking Environment Files ===

if exist ".env" (
    echo [OK] .env exists
) else (
    echo [ERROR] .env not found
    set HAS_ERRORS=1
)

echo.
if %HAS_ERRORS%==0 (
    echo [SUCCESS] All required environment variables are configured!
    exit /b 0
) else (
    echo [FAILED] Environment validation failed. Please set the missing variables.
    echo.
    echo For development, copy .env.example to .env:
    echo    copy .env.example .env
    echo.
    echo For production, copy infrastructure/.env.production.example:
    echo    copy infrastructure\.env.production.example infrastructure\.env.production
    pause
    exit /b 1
)

:check_var
setlocal
set VAR_NAME=%~1
set IS_OPTIONAL=%~2
call set VAR_VALUE=%%%VAR_NAME%%%

if "%VAR_VALUE%"=="" (
    if "%IS_OPTIONAL%"=="optional" (
        echo [WARNING] %VAR_NAME% ^(optional, using default^)
    ) else (
        echo [ERROR] %VAR_NAME% is required but not set
        endlocal
        set HAS_ERRORS=1
        exit /b 1
    )
) else (
    echo [OK] %VAR_NAME%
)
endlocal
exit /b 0
