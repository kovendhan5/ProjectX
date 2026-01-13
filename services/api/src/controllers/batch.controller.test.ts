import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../../app';

const prisma = new PrismaClient();

describe('Batch Controller', () => {
  let testProductSku: string;
  let testProductId: number;

  beforeAll(async () => {
    // Create test product
    const product = await prisma.product.create({
      data: {
        sku: `TEST-BATCH-PROD-${Date.now()}`,
        name: 'Test Product for Batches',
        description: 'Product for batch controller tests',
        manufacturer: 'Test Manufacturer',
        category: 'Medication',
        unitPrice: 45.99,
      },
    });
    testProductSku = product.sku;
    testProductId = product.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.batch.deleteMany({ where: { productId: testProductId } });
    await prisma.product.delete({ where: { id: testProductId } });
    await prisma.$disconnect();
  });

  describe('POST /api/products/:sku/batches', () => {
    it('should create a new batch successfully', async () => {
      const response = await request(app)
        .post(`/api/products/${testProductSku}/batches`)
        .send({
          batchNumber: `BATCH-TEST-${Date.now()}`,
          quantity: 200,
          manufacturingDate: '2025-06-01',
          expiryDate: '2027-06-01',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('batchNumber');
      expect(response.body).toHaveProperty('blockchainHash');
      expect(response.body.quantity).toBe(200);
      expect(response.body.status).toBe('AVAILABLE');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post(`/api/products/${testProductSku}/batches`)
        .send({
          batchNumber: `BATCH-INCOMPLETE-${Date.now()}`,
          // Missing quantity, dates
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 if product does not exist', async () => {
      await request(app)
        .post('/api/products/NON-EXISTENT-SKU/batches')
        .send({
          batchNumber: `BATCH-${Date.now()}`,
          quantity: 100,
          manufacturingDate: '2025-01-01',
          expiryDate: '2027-01-01',
        })
        .expect(404);
    });

    it('should return 400 if expiry date is before manufacturing date', async () => {
      const response = await request(app)
        .post(`/api/products/${testProductSku}/batches`)
        .send({
          batchNumber: `BATCH-INVALID-${Date.now()}`,
          quantity: 50,
          manufacturingDate: '2026-01-01',
          expiryDate: '2025-01-01', // Before manufacturing
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 if quantity is not positive', async () => {
      const response = await request(app)
        .post(`/api/products/${testProductSku}/batches`)
        .send({
          batchNumber: `BATCH-ZERO-${Date.now()}`,
          quantity: 0,
          manufacturingDate: '2025-01-01',
          expiryDate: '2027-01-01',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/products/:sku/batches', () => {
    beforeAll(async () => {
      // Create test batches
      await prisma.batch.createMany({
        data: [
          {
            batchNumber: `GET-BATCH-1-${Date.now()}`,
            productId: testProductId,
            quantity: 100,
            manufacturingDate: new Date('2025-01-01'),
            expiryDate: new Date('2027-01-01'),
            status: 'AVAILABLE',
            blockchainHash: 'hash-1',
          },
          {
            batchNumber: `GET-BATCH-2-${Date.now()}`,
            productId: testProductId,
            quantity: 150,
            manufacturingDate: new Date('2025-02-01'),
            expiryDate: new Date('2027-02-01'),
            status: 'AVAILABLE',
            blockchainHash: 'hash-2',
          },
        ],
      });
    });

    it('should retrieve all batches for a product', async () => {
      const response = await request(app)
        .get(`/api/products/${testProductSku}/batches`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).toHaveProperty('batchNumber');
      expect(response.body[0]).toHaveProperty('quantity');
      expect(response.body[0]).toHaveProperty('blockchainHash');
    });

    it('should return 404 if product does not exist', async () => {
      await request(app)
        .get('/api/products/NON-EXISTENT/batches')
        .expect(404);
    });
  });

  describe('GET /api/batches/:batchNumber', () => {
    let testBatchNumber: string;

    beforeAll(async () => {
      const batch = await prisma.batch.create({
        data: {
          batchNumber: `DETAIL-BATCH-${Date.now()}`,
          productId: testProductId,
          quantity: 75,
          manufacturingDate: new Date('2025-03-01'),
          expiryDate: new Date('2027-03-01'),
          status: 'AVAILABLE',
          blockchainHash: 'detail-hash',
        },
      });
      testBatchNumber = batch.batchNumber;
    });

    it('should retrieve batch by batch number', async () => {
      const response = await request(app)
        .get(`/api/batches/${testBatchNumber}`)
        .expect(200);

      expect(response.body.batchNumber).toBe(testBatchNumber);
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('name');
      expect(response.body.product.sku).toBe(testProductSku);
    });

    it('should return 404 if batch does not exist', async () => {
      await request(app)
        .get('/api/batches/NON-EXISTENT-BATCH')
        .expect(404);
    });
  });
});
