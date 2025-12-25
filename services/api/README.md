# API Service

Core API service for ProjectX pharmaceutical supply chain platform.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL via Prisma ORM
- **Validation**: Zod
- **Language**: TypeScript

## API Endpoints

### Health & Info
- `GET /` - API information and available endpoints
- `GET /health` - Health check

### Products
- `GET /api/v1/products/:sku` - Get product details by SKU including all batches
- `POST /api/v1/products` - Create a new product
  ```json
  {
    "sku": "PARACET-500",
    "name": "Paracetamol 500mg",
    "manufacturer": "PharmaCorp Ltd.",
    "description": "Pain relief"
  }
  ```

### Batches
- `POST /api/v1/products/:sku/batches` - Add a batch to a product
  ```json
  {
    "batchNumber": "B-2023-001",
    "expiryDate": "2025-12-31",
    "quantity": 500
  }
  ```

### Invoices
- `POST /api/v1/invoices` - Create an invoice (deducts inventory and anchors to blockchain)
  ```json
  {
    "customerName": "John Doe",
    "items": [
      {
        "batchId": "uuid-here",
        "quantity": 10,
        "price": 15.50
      }
    ]
  }
  ```

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/projectx
BLOCKCHAIN_SERVICE_URL=http://localhost:3003
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
npx prisma migrate dev
npx prisma generate
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```

Server will run at http://localhost:3001

## Database Schema

See [prisma/schema.prisma](./prisma/schema.prisma) for the complete schema.

### Models
- **Product**: SKU, name, manufacturer, description
- **Batch**: Batch number, expiry date, quantity, status
- **Invoice**: Invoice number, customer name, total amount
- **InvoiceItem**: Links invoices to batches with quantity and price

## Integration

### Blockchain Service
The API automatically anchors product registrations, batch creations, and invoices to the blockchain service at `http://localhost:3003`.

### Database Transactions
Invoice creation uses Prisma transactions to ensure:
1. Stock availability is verified
2. Inventory is decremented
3. Invoice record is created
4. Blockchain anchoring is attempted

If any step fails, the entire transaction is rolled back.

## Development Scripts

- `npm run dev` - Start with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled code
- `npm run migrate:dev` - Run migrations
- `npm run seed` - Seed sample data
- `npm run generate` - Generate Prisma client
