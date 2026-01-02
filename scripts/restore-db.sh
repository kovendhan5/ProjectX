#!/bin/bash
# Database Restore Script
# Restores database from a backup file

set -e

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "❌ Error: Backup file not specified"
    echo ""
    echo "Usage: $0 <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh backups/*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-projectx}"
DB_USER="${DB_USER:-postgres}"

echo "⚠️  WARNING: This will overwrite the current database!"
echo "📁 Backup file: $BACKUP_FILE"
echo "🗄️  Database: $DB_NAME"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo "🗄️  Starting database restore..."

# Decompress if needed
TEMP_FILE="$BACKUP_FILE"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "📦 Decompressing backup..."
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
fi

# Drop existing database and recreate
echo "🗑️  Dropping existing database..."
if command -v docker &> /dev/null && docker ps -q -f name=postgres &> /dev/null; then
    docker exec postgres psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
    docker exec postgres psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"
    echo "📥 Restoring from backup..."
    cat "$TEMP_FILE" | docker exec -i postgres psql -U "$DB_USER" "$DB_NAME"
else
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"
    echo "📥 Restoring from backup..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" < "$TEMP_FILE"
fi

# Clean up temporary file if we decompressed
if [[ "$BACKUP_FILE" == *.gz ]] && [ -f "$TEMP_FILE" ]; then
    rm "$TEMP_FILE"
fi

echo "✅ Database restore completed successfully!"
echo "🔄 Running migrations..."
cd services/api && npx prisma migrate deploy && cd ../..

echo "✨ Done!"
