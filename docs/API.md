# API Documentation

## Base URL

```
Development: http://localhost:3001
Production: https://api.yourdomain.com
```

## Authentication

> **Note**: MVP does not include authentication. Implement JWT or OAuth2 before production deployment.

## Response Format

### Success Response
```json
{
  "id": "uuid",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## Endpoints

### Health Check

#### GET /health

Check API health status.

**Response**:
```json
{
  "status": "healthy",
  "service": "ProjectX API",
  "timestamp": "2025-12-30T10:00:00.000Z",
  "uptime": 12345.67,
  "environment": "development"
}
```

---

### API Information

#### GET /

Get API information and available endpoints.

**Response**:
```json
{
  "name": "ProjectX API",
  "version": "1.0.0",
  "description": "Blockchain-backed pharmaceutical supply chain API",
  "endpoints": { ... }
}
```

---

### Products

#### GET /api/v1/products/:sku

Get product details by SKU, including all batches.

**Parameters**:
- `sku` (path, required): Product SKU identifier

**Example Request**:
```bash
curl http://localhost:3001/api/v1/products/PARACET-500
```

**Success Response (200)**:
```json
{
  "id": "uuid",
  "sku": "PARACET-500",
  "name": "Paracetamol 500mg",
  "manufacturer": "PharmaCorp Ltd.",
  "description": "Pain relief and fever reducer",
  "blockchainTxId": "tx_prod_001",
  "createdAt": "2025-12-01T00:00:00.000Z",
  "updatedAt": "2025-12-01T00:00:00.000Z",
  "batches": [
    {
      "id": "uuid",
      "batchNumber": "B-2023-001",
      "expiryDate": "2025-12-31T00:00:00.000Z",
      "quantity": 500,
      "status": "ACTIVE",
      "blockchainTxId": "tx_batch_001",
      "createdAt": "2025-12-01T00:00:00.000Z",
      "updatedAt": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

**Error Response (404)**:
```json
{
  "error": "Product not found"
}
```

---

#### POST /api/v1/products

Create a new product.

**Request Body**:
```json
{
  "sku": "AMOX-250",
  "name": "Amoxicillin 250mg",
  "manufacturer": "MediLabs Inc.",
  "description": "Antibiotic for bacterial infections"
}
```

**Validation Rules**:
- `sku`: Required, string, unique
- `name`: Required, string, min 3 characters
- `manufacturer`: Required, string
- `description`: Optional, string

**Success Response (201)**:
```json
{
  "id": "uuid",
  "sku": "AMOX-250",
  "name": "Amoxicillin 250mg",
  "manufacturer": "MediLabs Inc.",
  "description": "Antibiotic for bacterial infections",
  "blockchainTxId": "tx_hash",
  "createdAt": "2025-12-30T10:00:00.000Z",
  "updatedAt": "2025-12-30T10:00:00.000Z"
}
```

**Error Response (400)**:
```json
{
  "error": "Validation failed: SKU already exists"
}
```

---

### Batches

#### POST /api/v1/products/:sku/batches

Add a new batch to an existing product.

**Parameters**:
- `sku` (path, required): Product SKU

**Request Body**:
```json
{
  "batchNumber": "B-2023-002",
  "expiryDate": "2026-06-30",
  "quantity": 300
}
```

**Validation Rules**:
- `batchNumber`: Required, string, unique
- `expiryDate`: Required, ISO 8601 date string
- `quantity`: Required, positive integer

**Success Response (201)**:
```json
{
  "id": "uuid",
  "batchNumber": "B-2023-002",
  "expiryDate": "2026-06-30T00:00:00.000Z",
  "quantity": 300,
  "status": "ACTIVE",
  "productId": "uuid",
  "blockchainTxId": "tx_hash",
  "createdAt": "2025-12-30T10:00:00.000Z",
  "updatedAt": "2025-12-30T10:00:00.000Z"
}
```

**Error Responses**:
- **404**: Product not found
- **400**: Validation failed or batch number already exists

---

### Invoices

#### POST /api/v1/invoices

Create a new invoice. This endpoint:
1. Validates batch stock availability
2. Creates invoice record
3. Deducts quantities from batches
4. Anchors transaction to blockchain

**Request Body**:
```json
{
  "customerName": "John Doe",
  "items": [
    {
      "batchId": "batch-uuid-1",
      "quantity": 10,
      "price": 15.50
    },
    {
      "batchId": "batch-uuid-2",
      "quantity": 5,
      "price": 12.00
    }
  ]
}
```

**Validation Rules**:
- `customerName`: Optional, string
- `items`: Required, array with at least 1 item
- `items[].batchId`: Required, valid UUID
- `items[].quantity`: Required, positive integer
- `items[].price`: Required, positive number

**Success Response (201)**:
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-2025-12345",
  "customerName": "John Doe",
  "totalAmount": 215.00,
  "blockchainTxId": "tx_hash",
  "createdAt": "2025-12-30T10:00:00.000Z",
  "items": [
    {
      "id": "uuid",
      "batchId": "batch-uuid-1",
      "quantity": 10,
      "price": 15.50,
      "batch": {
        "batchNumber": "B-2023-001",
        "product": {
          "name": "Paracetamol 500mg"
        }
      }
    }
  ]
}
```

**Error Responses**:
- **400**: Validation failed
- **400**: Insufficient stock in batch
- **404**: Batch not found
- **500**: Transaction failed (inventory not updated)

---

## Blockchain Integration

All create/update operations automatically record transactions on the blockchain service.

### Blockchain Transaction Format

```json
{
  "type": "PRODUCT_REGISTERED | BATCH_CREATED | INVOICE_CREATED",
  "entityId": "uuid",
  "timestamp": "2025-12-30T10:00:00.000Z",
  "data": { ... }
}
```

### Verifying Transactions

Use the blockchain service API:

```bash
GET http://localhost:3003/api/blockchain/verify/{txId}
```

---

## Rate Limiting

> **Note**: Not implemented in MVP. Recommended for production:
> - 100 requests per minute per IP
> - 1000 requests per hour per IP

---

## Pagination

> **Note**: Not implemented in MVP. For large datasets, implement pagination with:
> - `?page=1&limit=20` query parameters
> - Response includes `totalCount`, `page`, `totalPages`

---

## Filtering & Sorting

> **Note**: Not implemented in MVP. Future enhancements:
> - Filter products by manufacturer
> - Filter batches by status, expiry date
> - Sort by various fields

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Examples

### Complete Product Registration Flow

```bash
# 1. Create product
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "ASPIRIN-100",
    "name": "Aspirin 100mg",
    "manufacturer": "HealthCorp",
    "description": "Pain reliever"
  }'

# 2. Add batch
curl -X POST http://localhost:3001/api/v1/products/ASPIRIN-100/batches \
  -H "Content-Type: application/json" \
  -d '{
    "batchNumber": "B-2025-999",
    "expiryDate": "2026-12-31",
    "quantity": 1000
  }'

# 3. Verify product
curl http://localhost:3001/api/v1/products/ASPIRIN-100
```

### Invoice Creation Flow

```bash
# 1. Get product and batch IDs
curl http://localhost:3001/api/v1/products/ASPIRIN-100

# 2. Create invoice with batch ID from step 1
curl -X POST http://localhost:3001/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Jane Smith",
    "items": [
      {
        "batchId": "batch-id-from-step-1",
        "quantity": 50,
        "price": 5.00
      }
    ]
  }'

# 3. Verify batch quantity was reduced
curl http://localhost:3001/api/v1/products/ASPIRIN-100
```

---

## Postman Collection

Import the API into Postman for easy testing:

```json
{
  "info": {
    "name": "ProjectX API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001"
    }
  ]
}
```

---

## WebSocket Support

> **Future Enhancement**: Real-time updates for:
> - Inventory changes
> - New invoices
> - Blockchain confirmations

---

## Versioning

API uses URL versioning (`/api/v1/`). Future versions will be released as `/api/v2/`, etc.

---

## Support

For API support: api-support@projectx.example.com
