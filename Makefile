.PHONY: install build dev up down logs clean test lint migrate generate seed setup

# Complete setup (first time)
setup:
	@echo "🚀 Setting up ProjectX..."
	npm install
	cd infrastructure && docker-compose up -d postgres
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	timeout /t 10
	cd services/api && npx prisma migrate dev --name init && npx prisma generate && npm run seed
	@echo "✅ Setup complete! Run 'make dev' to start all services."

# Install dependencies for all workspaces
install:
	npm install

# Build all services and clients
build:
	npm run build

# Start all services in development mode
dev:
	@echo "Starting all services..."
	@echo "API will be at http://localhost:3001"
	@echo "Pharmacy Portal at http://localhost:3002"
	@echo "Blockchain at http://localhost:3003"
	@echo "Regulator Portal at http://localhost:3004"
	@echo ""
	@echo "Press Ctrl+C to stop"
	start cmd /k "cd services/api && npm run dev"
	start cmd /k "cd services/blockchain && npm run dev"
	start cmd /k "cd clients/pharmacy-portal && npm run dev"
	start cmd /k "cd clients/regulator-portal && npm run dev"

# Start development environment (Docker Compose)
up:
	docker-compose -f infrastructure/docker-compose.yml up -d --build

# Stop development environment
down:
	docker-compose -f infrastructure/docker-compose.yml down

# View logs
logs:
	docker-compose -f infrastructure/docker-compose.yml logs -f

# Clean artifacts
clean:
	npm run clean
	docker-compose -f infrastructure/docker-compose.yml down -v

# Run tests across the monorepo
test:
	npm run test

# Lint code
lint:
	npm run lint

# Database Migrations
migrate:
	cd services/api && npm run migrate:dev

# Generate Prisma Client
generate:
	cd services/api && npm run generate

# Seed database with sample data
seed:
	cd services/api && npm run seed
