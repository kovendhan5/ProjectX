#!/bin/bash

# Setup script for Linux/Mac
# Prepares the development environment for first-time use

set -e  # Exit on any error

echo "========================================"
echo "ProjectX Environment Setup"
echo "========================================"
echo ""

# Check if .env files exist, if not copy from examples
echo "[1/5] Setting up environment files..."

if [ ! -f "services/api/.env" ]; then
    echo "Creating services/api/.env from example..."
    cp "services/api/.env.example" "services/api/.env"
fi

if [ ! -f "services/blockchain/.env" ]; then
    echo "Creating services/blockchain/.env from example..."
    cp "services/blockchain/.env.example" "services/blockchain/.env"
fi

if [ ! -f "clients/pharmacy-portal/.env.local" ]; then
    echo "Creating clients/pharmacy-portal/.env.local from example..."
    cp "clients/pharmacy-portal/.env.example" "clients/pharmacy-portal/.env.local"
fi

if [ ! -f "clients/regulator-portal/.env.local" ]; then
    echo "Creating clients/regulator-portal/.env.local from example..."
    cp "clients/regulator-portal/.env.example" "clients/regulator-portal/.env.local"
fi

echo ""
echo "[2/5] Installing dependencies..."
npm install

echo ""
echo "[3/5] Starting PostgreSQL..."
cd infrastructure
docker-compose up -d postgres
cd ..

echo ""
echo "[4/5] Waiting for PostgreSQL to be ready..."
sleep 10

echo ""
echo "[5/5] Running database migrations and seed..."
cd services/api
npx prisma migrate dev --name init
npx prisma generate
npm run seed
cd ../..

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start all services, run:"
echo "  make dev"
echo ""
echo "Or start individual services:"
echo "  npm run dev:api"
echo "  npm run dev:blockchain"
echo "  npm run dev:pharmacy"
echo "  npm run dev:regulator"
echo ""
