# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Winston logger integration for production-grade logging
- Comprehensive unit tests for Invoice controller
- Comprehensive unit tests for Batch controller
- Structured logging with log levels and file rotation
- Graceful shutdown handlers (SIGTERM, SIGINT)

### Changed
- Replaced console.log with Winston logger throughout API service
- Enhanced error logging with request context
- Improved HTTP request logging via Morgan + Winston

### Fixed
- TypeScript compilation errors in test files
- Missing @types/supertest and @types/jest dependencies

---

## [1.0.0] - 2026-01-05

### Added - Core Platform
- Complete monorepo structure with NPM workspaces
- API service with Express.js and Prisma ORM
- Mock blockchain service with SHA256 hashing
- PostgreSQL database with comprehensive schema
- Docker Compose orchestration with health checks
- CI/CD pipeline with GitHub Actions
- Comprehensive documentation suite (17+ files)
- Development automation with Makefile
- Code quality tools (Prettier, ESLint)
- VS Code workspace configuration

### Added - Pharmacy Portal
- Product scanning by SKU
- Batch information display with blockchain verification
- Invoice creation workflow
- Shopping cart functionality
- Navigation layout component
- Error boundary handling
- Centralized API configuration

### Added - Regulator Portal  
- System dashboard with statistics
- Transaction log viewer
- Entity verification tool
- Error boundary handling
- Blockchain verification interface

### Added - Operations & Deployment
- Deployment checklist (DEPLOYMENT_CHECKLIST.md)
- Operations runbook (RUNBOOK.md)
- Health check scripts
- Database backup/restore scripts
- Environment templates for all services
- Production Docker Compose configuration
- Real-time system status display

### Added - Infrastructure
- Health checks for all services
- Environment variable templates
- Development automation (Makefile)
- Code formatting (Prettier)
- VS Code workspace configuration
- Integration tests setup

### Documentation
- Quick Start Guide
- API Reference
- Deployment Guide
- Testing Guide
- Security Policy
- Contributing Guidelines

## [Unreleased]

### Planned
- JWT authentication
- API rate limiting
- Redis caching
- Comprehensive test coverage
- Real blockchain implementation (Hyperledger Fabric)

## [1.0.0] - 2025-12-30

### Added
- Initial MVP release
- Monorepo structure with NPM workspaces
- Express API with TypeScript
- PostgreSQL database with Prisma ORM
- Product and Batch management endpoints
- Invoice generation with inventory deduction
- Mock blockchain service with SHA256 hashing
- Blockchain transaction anchoring
- Pharmacy Portal (Next.js)
  - Product scanning by SKU
  - Batch viewing with expiry dates
  - Invoice creation interface
  - Navigation header
  - Error boundaries
- Regulator Portal (Next.js)
  - Dashboard with statistics
  - Transaction history viewer
  - Entity verification tool
  - Error boundaries
- Docker Compose orchestration
- Database seeding script
- Health check endpoints
- Error handling middleware
- Environment variable templates
- CI/CD pipeline (GitHub Actions)
- Comprehensive documentation
  - Quick Start Guide
  - API Reference
  - Deployment Guide
  - Testing Guide
  - Security Policy
  - Contributing Guidelines
- Development tooling
  - Makefile for automation
  - Prettier configuration
  - VS Code workspace settings
  - ESLint configuration
- Security features
  - Input validation with Zod
  - CORS configuration
  - Helmet security headers
  - SQL injection protection (Prisma)

### Security
- Documented security considerations in SECURITY.md
- Added security best practices documentation
- Implemented input validation on all endpoints

## [0.1.0] - 2025-12-01

### Added
- Initial project scaffolding
- Basic repository structure
- Documentation templates
- Architecture decision records (ADR) structure

---

## Version History

- **1.0.0** (2025-12-30): Production-ready MVP with full feature set
- **0.1.0** (2025-12-01): Initial setup and scaffolding

## Migration Guide

### From 0.1.0 to 1.0.0

This is the first production release. To set up from scratch:

1. Install dependencies: `npm install`
2. Setup database: `make migrate && make seed`
3. Start services: `make dev`

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

## Breaking Changes

None yet. This is the initial stable release.

## Deprecations

None.

## Contributors

See the [Contributors](https://github.com/yourorg/projectx/graphs/contributors) page for a full list.
