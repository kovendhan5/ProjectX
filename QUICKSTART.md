# 🚀 ProjectX - Quick Start Guide

This guide will get you up and running with the complete ProjectX system in minutes.

## Prerequisites
- Node.js 18+ installed
- Docker Desktop installed and running
- Terminal/PowerShell access

## Step 1: Clone & Install

```bash
cd k:\Devops\ProjectX
npm install
```

## Step 2: Start Infrastructure

```bash
cd infrastructure
docker-compose up -d postgres
```

Wait ~10 seconds for PostgreSQL to initialize.

## Step 3: Setup Database

```bash
cd ../services/api
npx prisma migrate dev --name init
npx prisma generate
npm run seed
```

## Step 4: Start All Services

Open **4 separate terminals**:

### Terminal 1 - API Service
```bash
cd k:\Devops\ProjectX\services\api
npm run dev
```
✅ API running at http://localhost:3001

### Terminal 2 - Blockchain Service
```bash
cd k:\Devops\ProjectX\services\blockchain
npm run dev
```
✅ Blockchain running at http://localhost:3003

### Terminal 3 - Pharmacy Portal
```bash
cd k:\Devops\ProjectX\clients\pharmacy-portal
npm run dev
```
✅ Pharmacy Portal at http://localhost:3002

### Terminal 4 - Regulator Portal
```bash
cd k:\Devops\ProjectX\clients\regulator-portal
npm run dev
```
✅ Regulator Portal at http://localhost:3004

## Step 5: Test the System

### Test 1: Scan Product (Pharmacy Portal)
1. Go to http://localhost:3002
2. Click **"Scan Product"**
3. Enter SKU: `PARACET-500`
4. See product details and batches ✅

### Test 2: Create Invoice (Pharmacy Portal)
1. Go to http://localhost:3002
2. Click **"Create Invoice"**
3. Search for SKU: `PARACET-500`
4. Select a batch and add to cart
5. Click **"Generate Invoice"**
6. Invoice created and anchored to blockchain ✅

### Test 3: Verify on Ledger (Regulator Portal)
1. Go to http://localhost:3004
2. Click **"Open Verification Tool"**
3. Enter SKU: `PARACET-500`
4. See verification status ✅

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
├──────────────────────┬──────────────────────────────────┤
│  Pharmacy Portal     │    Regulator Portal              │
│  (Next.js - :3002)   │    (Next.js - :3004)             │
└──────────┬───────────┴──────────────┬───────────────────┘
           │                          │
           └──────────┬───────────────┘
                      │
         ┌────────────▼────────────┐
         │   API Gateway (:3001)   │
         │   (Express + Prisma)    │
         └────────┬────────┬───────┘
                  │        │
         ┌────────▼───┐ ┌─▼────────────────┐
         │ PostgreSQL │ │ Blockchain (:3003)│
         │   :5432    │ │ (Mock Ledger)    │
         └────────────┘ └──────────────────┘
```

## Sample Data

After seeding, you'll have:

### Products
- **PARACET-500**: Paracetamol 500mg (PharmaCorp)
- **AMOX-250**: Amoxicillin 250mg (MediLabs)

### Batches
- **B-2023-001**: 500 units (Paracetamol)
- **B-2023-002**: 300 units (Paracetamol)
- **B-2023-003**: 200 units (Amoxicillin)

### Invoice
- **INV-2023-001**: Sample invoice with 2 items

## Troubleshooting

### Port Already in Use
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

### Database Connection Failed
```bash
docker-compose down
docker-compose up -d postgres
# Wait 10 seconds, then retry migration
```

### Module Not Found
```bash
cd k:\Devops\ProjectX
npm install
```

## Next Steps

- [ ] Explore the API endpoints at http://localhost:3001/api/v1
- [ ] Create custom products and batches
- [ ] Test multi-batch invoices
- [ ] Review blockchain transactions
- [ ] Implement authentication (Phase 2)

---

**Need Help?** Check `/docs` for detailed architecture and PRD documents.
