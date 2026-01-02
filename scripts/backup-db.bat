@echo off
REM Database Backup Script (Windows)
REM Creates a timestamped backup of the PostgreSQL database

setlocal enabledelayedexpansion

REM Configuration
set BACKUP_DIR=.\backups
set TIMESTAMP=%date:~-4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\projectx_backup_%TIMESTAMP%.sql

REM Database configuration
if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=5432
if not defined DB_NAME set DB_NAME=projectx
if not defined DB_USER set DB_USER=postgres

echo Starting database backup...

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Check if Docker is available
docker ps -q -f name=postgres >nul 2>&1
if %errorlevel%==0 (
    echo Using Docker container for backup...
    docker exec postgres pg_dump -U %DB_USER% %DB_NAME% > "%BACKUP_FILE%"
) else (
    echo Using local PostgreSQL for backup...
    pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME% > "%BACKUP_FILE%"
)

if %errorlevel%==0 (
    echo Backup completed successfully!
    echo File: %BACKUP_FILE%
    
    REM Optional: Compress with 7zip if available
    where 7z >nul 2>&1
    if %errorlevel%==0 (
        echo Compressing backup...
        7z a "%BACKUP_FILE%.7z" "%BACKUP_FILE%" -mx9
        del "%BACKUP_FILE%"
        echo Compressed file: %BACKUP_FILE%.7z
    )
    
    echo Done!
) else (
    echo Backup failed!
    pause
    exit /b 1
)

pause
