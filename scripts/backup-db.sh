#!/bin/bash
# Database Backup Script
# Creates a timestamped backup of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/projectx_backup_$TIMESTAMP.sql"

# Database configuration from environment
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-projectx}"
DB_USER="${DB_USER:-postgres}"

echo "🗄️  Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if Docker is running and database container exists
if command -v docker &> /dev/null; then
    if docker ps -q -f name=postgres &> /dev/null; then
        echo "📦 Using Docker container for backup..."
        docker exec postgres pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
    else
        echo "🔌 Using local PostgreSQL for backup..."
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
    fi
else
    echo "🔌 Using local PostgreSQL for backup..."
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
fi

# Compress backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"

COMPRESSED_FILE="$BACKUP_FILE.gz"
FILE_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)

echo "✅ Backup completed successfully!"
echo "📁 File: $COMPRESSED_FILE"
echo "📊 Size: $FILE_SIZE"

# Clean up old backups (keep last 7 days)
echo "🧹 Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "projectx_backup_*.sql.gz" -mtime +7 -delete

echo "✨ Done!"
