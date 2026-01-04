#!/bin/bash

# Production Deployment Script
# This script automates the deployment process for ProjectX

set -e  # Exit on any error

echo "=========================================="
echo "ProjectX Production Deployment"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f "infrastructure/.env" ]; then
    echo -e "${RED}Error: infrastructure/.env file not found${NC}"
    echo "Please create it from infrastructure/.env.prod.example"
    exit 1
fi

# Load environment variables
source infrastructure/.env

echo -e "${YELLOW}Step 1/7: Validating environment...${NC}"
node scripts/validate-env.js
if [ $? -ne 0 ]; then
    echo -e "${RED}Environment validation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Environment validated${NC}"
echo ""

echo -e "${YELLOW}Step 2/7: Building Docker images...${NC}"
cd infrastructure
docker-compose -f docker-compose.prod.yml build --no-cache
cd ..
echo -e "${GREEN}✓ Docker images built${NC}"
echo ""

echo -e "${YELLOW}Step 3/7: Stopping existing containers...${NC}"
cd infrastructure
docker-compose -f docker-compose.prod.yml down
cd ..
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

echo -e "${YELLOW}Step 4/7: Starting PostgreSQL...${NC}"
cd infrastructure
docker-compose -f docker-compose.prod.yml up -d postgres
cd ..
echo "Waiting for PostgreSQL to be ready..."
sleep 15
echo -e "${GREEN}✓ PostgreSQL started${NC}"
echo ""

echo -e "${YELLOW}Step 5/7: Running database migrations...${NC}"
cd services/api
npx prisma migrate deploy
npx prisma generate
cd ../..
echo -e "${GREEN}✓ Migrations applied${NC}"
echo ""

echo -e "${YELLOW}Step 6/7: Starting all services...${NC}"
cd infrastructure
docker-compose -f docker-compose.prod.yml up -d
cd ..
echo "Waiting for services to start..."
sleep 30
echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo -e "${YELLOW}Step 7/7: Running health checks...${NC}"
bash scripts/health-check.sh
echo -e "${GREEN}✓ Health checks passed${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Services are now running:"
echo "  API: http://localhost:3001"
echo "  Blockchain: http://localhost:3003"
echo "  Pharmacy Portal: http://localhost:3002"
echo "  Regulator Portal: http://localhost:3004"
echo ""
echo "View logs:"
echo "  docker-compose -f infrastructure/docker-compose.prod.yml logs -f"
echo ""
echo "Stop services:"
echo "  docker-compose -f infrastructure/docker-compose.prod.yml down"
echo ""
