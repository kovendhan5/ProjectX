.PHONY: install build dev up down logs clean test lint

# Install dependencies for all workspaces
install:
	npm install

# Build all services and clients
build:
	npm run build

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
