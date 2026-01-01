#!/bin/bash

# Utility script to reset the development environment

set -e

echo "🔄 Resetting ProjectX development environment..."

# Stop all services
echo "📦 Stopping Docker services..."
cd infrastructure
docker-compose down -v

# Clean node modules
echo "🧹 Cleaning node_modules..."
cd ..
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
find . -name "dist" -type d -prune -exec rm -rf '{}' +
find . -name ".next" -type d -prune -exec rm -rf '{}' +

# Reinstall dependencies
echo "📥 Installing dependencies..."
npm install

# Start PostgreSQL
echo "🐘 Starting PostgreSQL..."
cd infrastructure
docker-compose up -d postgres

# Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Setup database
echo "🗄️ Setting up database..."
cd ../services/api
npx prisma migrate dev --name init
npx prisma generate
npm run seed

echo "✅ Environment reset complete!"
echo ""
echo "To start development, run: make dev"
