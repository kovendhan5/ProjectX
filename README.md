# ProjectX Trusted Pharma Billing Network

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

- Product requirements live in [docs/PRD.md](docs/PRD.md).
- Architectural plans and diagrams live in [docs/architecture/](docs/architecture/) (see context, component, and data-flow guides).
- Release milestones and backlog scaffolding are curated in [docs/roadmap.md](docs/roadmap.md).
- Testing guide in [docs/TESTING.md](docs/TESTING.md).
- Security policy in [SECURITY.md](SECURITY.md).
- Service- and portal-specific notes reside in their respective subdirectories.

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
