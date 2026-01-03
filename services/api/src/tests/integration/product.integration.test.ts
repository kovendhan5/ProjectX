import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../app';

const prisma = new PrismaClient();

describe('Product API Integration Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.batch.deleteMany({});
    await prisma.product.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send({
          sku: 'TEST-001',
          name: 'Test Product',
          manufacturer: 'Test Corp',
          description: 'Test description',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.sku).toBe('TEST-001');
      expect(response.body).toHaveProperty('blockchainTxId');
    });

    it('should return 400 for duplicate SKU', async () => {
      await request(app).post('/api/v1/products').send({
        sku: 'TEST-002',
        name: 'Test Product 2',
        manufacturer: 'Test Corp',
      });

      const response = await request(app)
        .post('/api/v1/products')
        .send({
          sku: 'TEST-002',
          name: 'Test Product 2',
          manufacturer: 'Test Corp',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send({
          name: 'Test Product',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/products/:sku', () => {
    beforeAll(async () => {
      await request(app).post('/api/v1/products').send({
        sku: 'TEST-GET-001',
        name: 'Test Get Product',
        manufacturer: 'Test Corp',
      });
    });

    it('should get product by SKU', async () => {
      const response = await request(app).get('/api/v1/products/TEST-GET-001');

      expect(response.status).toBe(200);
      expect(response.body.sku).toBe('TEST-GET-001');
      expect(response.body).toHaveProperty('batches');
      expect(Array.isArray(response.body.batches)).toBe(true);
    });

    it('should return 404 for non-existent SKU', async () => {
      const response = await request(app).get('/api/v1/products/NON-EXISTENT');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/products/:sku/batches', () => {
    beforeAll(async () => {
      await request(app).post('/api/v1/products').send({
        sku: 'TEST-BATCH-001',
        name: 'Test Batch Product',
        manufacturer: 'Test Corp',
      });
    });

    it('should add batch to product', async () => {
      const response = await request(app)
        .post('/api/v1/products/TEST-BATCH-001/batches')
        .send({
          batchNumber: 'B-TEST-001',
          expiryDate: '2026-12-31',
          quantity: 100,
        });

      expect(response.status).toBe(201);
      expect(response.body.batchNumber).toBe('B-TEST-001');
      expect(response.body.quantity).toBe(100);
      expect(response.body).toHaveProperty('blockchainTxId');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .post('/api/v1/products/NON-EXISTENT/batches')
        .send({
          batchNumber: 'B-TEST-002',
          expiryDate: '2026-12-31',
          quantity: 100,
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid expiry date', async () => {
      const response = await request(app)
        .post('/api/v1/products/TEST-BATCH-001/batches')
        .send({
          batchNumber: 'B-TEST-003',
          expiryDate: 'invalid-date',
          quantity: 100,
        });

      expect(response.status).toBe(400);
    });
  });
});
