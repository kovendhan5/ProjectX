# ProjectX Trusted Pharma Billing Network

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](package.json)
[![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](infrastructure/docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Overview

- Blockchain-backed traceability platform that links pharmaceutical producers, distributors, pharmacies, regulators, and consumers.
- Ensures every product and invoice carries verifiable provenance through tamper-evident QR codes anchored on a permissioned ledger.
- Delivers trusted collaboration, regulatory transparency, and consumer safety insights at the point of sale.

## Key Capabilities

- Product onboarding with immutable batch lineage and secure label generation.
- Custody tracking across supply chain hops with anomaly detection.
- Compliant billing that embeds government-validated QR references.
- Regulator dashboards for license enforcement and recall execution.
- Consumer access to authenticity checks, advisories, and feedback loops.

## Architecture Pillars

- Consortium blockchain network for provenance guarantees and auditability.
- API services exposing onboarding, billing, and compliance features.
- Persona-specific portals for pharmacies, regulators, and producers.
- Infrastructure-as-code and DevSecOps automation for predictable operations.

## Repository Structure

```
docs/
  PRD.md
  architecture/
clients/
  pharmacy-portal/
  regulator-portal/
services/
  api/
  blockchain/
infrastructure/
scripts/
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Services**:
   ```bash
   cd infrastructure
   docker-compose up --build
   ```

3. **Access Portals**:
   - **API**: http://localhost:3001
   - **Pharmacy Portal**: http://localhost:3002
   - **Blockchain Service**: http://localhost:3003
   - **Regulator Portal**: http://localhost:3004

4. **Database Setup**:
   ```bash
   # From services/api directory
   npx prisma migrate dev
   npx prisma db seed
   ```

### Development Workflow
- Populate sample data sets (products, batches, licenses) to validate flows.
- Prototype QR scanning experience across pharmacy and consumer touchpoints.
- Test invoice generation and blockchain anchoring end-to-end.

## Documentation

> 📑 **Complete Documentation Index**: [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Navigation guide for all 31 documentation files

### Getting Started
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md) - Get up and running in minutes
- **Project Summary**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Comprehensive overview
- **API Reference**: [docs/API.md](docs/API.md) - Complete API documentation
- **Testing**: [docs/TESTING.md](docs/TESTING.md) - Testing strategy and examples

### Architecture & Design
- **Architecture**: [docs/architecture/](docs/architecture/) - System design and diagrams
- **Product Requirements**: [docs/PRD.md](docs/PRD.md) - Product specifications
- **Roadmap**: [docs/roadmap.md](docs/roadmap.md) - Future development plans

### Operations & Deployment
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production deployment guide
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Pre-deployment verification
- **Operations Runbook**: [RUNBOOK.md](RUNBOOK.md) - Maintenance and troubleshooting procedures
- **Security**: [SECURITY.md](SECURITY.md) - Security policy and best practices

### Status & Metrics
- **Status Report**: [STATUS_REPORT.md](STATUS_REPORT.md) - Complete system status
- **Metrics Dashboard**: [METRICS.md](METRICS.md) - Project metrics and KPIs
- **Changelog**: [CHANGELOG.md](CHANGELOG.md) - Release history

### Contributing
- **Contributing Guidelines**: [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- **Developer TODO**: [TODO.md](TODO.md) - Planned features and enhancements

## Roadmap Highlights

- Phase 1: Producer onboarding, blockchain MVP, basic custody tracking.
- Phase 2: Government integrations, consumer portal, advanced analytics.
- Phase 3: Scale-out, ERP/POS adapters, hardened operations.

## Contributing

- Open an issue describing scope and assumptions before large changes.
- Keep documentation current with implementation milestones.
- Follow secure coding, testing, and deployment guidelines defined per service.
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for branching, testing, and security expectations.

## Quick Commands

```bash
# First-time setup
make setup

# Start all services
make dev

# Run tests
make test

# Database operations
make migrate
make seed
```

For detailed instructions, see [QUICKSTART.md](QUICKSTART.md).
