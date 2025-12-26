# Pharmacy Portal

Frontend application for pharmacists to scan products, verify provenance, and generate invoices.

## Features

- **Product Scanning**: Verify product authenticity by SKU lookup
- **Batch Management**: View available batches with expiry dates and stock levels
- **Invoice Generation**: Create invoices with automatic inventory deduction and blockchain anchoring
- **Blockchain Verification**: All operations are cryptographically secured on the ledger

## Tech Stack

- **Framework**: Next.js 13 (Pages Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Pages

### Home (`/`)
Landing page with quick access to main features.

### Scan Product (`/scan`)
Search for products by SKU and view product details, batches, and blockchain status.

### Create Invoice (`/invoice`)
Multi-step invoice creation: search products → add to cart → generate invoice.

## Getting Started

```bash
npm install
npm run dev
```

Portal runs at http://localhost:3002

See [QUICKSTART.md](../../QUICKSTART.md) for full setup instructions.
