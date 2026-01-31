# Testing Guide

## Overview

ProjectX uses a multi-layered testing strategy to ensure reliability and correctness.

## Test Types

### 1. Unit Tests
Test individual functions and components in isolation.

**Location**: `*.test.ts` or `*.spec.ts` files next to source code

**Example**:
```typescript
// services/api/src/services/blockchain.service.test.ts
import { recordTransaction } from './blockchain.service';

describe('BlockchainService', () => {
  it('should record a transaction', async () => {
    const result = await recordTransaction({ type: 'TEST', data: {} });
    expect(result).toHaveProperty('txId');
  });
});
```

### 2. Integration Tests
Test interactions between components and external services.

**Example**: Testing API endpoints with database
```typescript
// services/api/src/controllers/product.controller.test.ts
describe('Product Controller', () => {
  beforeAll(async () => {
    // Setup test database
  });

  it('should create a product', async () => {
    const response = await request(app)
      .post('/api/v1/products')
      .send({
        sku: 'TEST-001',
        name: 'Test Product',
        manufacturer: 'Test Corp'
      });
    
    expect(response.status).toBe(201);
  });
});
```

### 3. End-to-End Tests
Test complete user workflows across services.

**Example**: Invoice creation workflow
```typescript
describe('Invoice Workflow', () => {
  it('should create invoice and update inventory', async () => {
    // 1. Create product
    // 2. Add batch
    // 3. Create invoice
    // 4. Verify inventory decreased
    // 5. Verify blockchain transaction
  });
});
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Service
```bash
cd services/api
npm test
```

### Watch Mode
```bash
npm test -- --watch
```

### With Coverage
```bash
npm test -- --coverage
```

## Testing Tools

- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for API tests
- **@testing-library/react**: React component testing
- **Prisma Test Environment**: Isolated database for tests

## Test Database

Use a separate test database to avoid polluting development data:

```env
# .env.test
DATABASE_URL=postgresql://user:password@localhost:5432/projectx_test
```

Run migrations for test DB:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/projectx_test npx prisma migrate deploy
```

## Writing Good Tests

### Best Practices

1. **Descriptive Names**
   ```typescript
   it('should return 400 when SKU is missing')
   ```

2. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should create invoice', async () => {
     // Arrange
     const invoiceData = { ... };
     
     // Act
     const result = await createInvoice(invoiceData);
     
     // Assert
     expect(result.invoiceNumber).toBeDefined();
   });
   ```

3. **Test One Thing**
   - Each test should verify one behavior
   - Keep tests focused and simple

4. **Mock External Dependencies**
   ```typescript
   jest.mock('./blockchain.service');
   ```

5. **Clean Up After Tests**
   ```typescript
   afterEach(async () => {
     await prisma.product.deleteMany();
   });
   ```

## Continuous Integration

Tests run automatically on:
- Every push to main/develop
- Every pull request
- Pre-commit hooks (optional)

See `.github/workflows/ci.yml` for CI configuration.

## Test Coverage Goals

- **Minimum**: 70% coverage
- **Target**: 80% coverage
- **Critical Paths**: 100% coverage (invoicing, blockchain)

## Manual Testing

### API Testing with cURL

```bash
# Health check
curl http://localhost:3001/health

# Create product
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"sku":"TEST-001","name":"Test Product","manufacturer":"Test Corp"}'

# Get product
curl http://localhost:3001/api/v1/products/TEST-001
```

### Frontend Testing

1. Start all services: `make dev`
2. Navigate through user flows:
   - Product scanning
   - Invoice creation
   - Regulator verification

## Troubleshooting

### Tests Fail Locally But Pass in CI
- Check Node.js version matches
- Ensure database migrations are applied
- Clear node_modules and reinstall

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env.test
- Ensure test database exists

### Timeout Errors
- Increase Jest timeout: `jest.setTimeout(10000)`
- Check for hanging promises
- Verify mocks are properly configured

## Future Enhancements

- [ ] Performance testing with k6 or Artillery
- [ ] Load testing for API endpoints
- [ ] Visual regression testing for UIs
- [ ] Contract testing for microservices
- [ ] Chaos engineering experiments
