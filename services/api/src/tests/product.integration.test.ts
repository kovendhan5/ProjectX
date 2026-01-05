import request from 'supertest';
import app from '../app';
import prisma from '../config/db';

describe('Product API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.invoice.deleteMany();
    await prisma.batch.deleteMany();
    await prisma.product.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const productData = {
        sku: 'TEST-001',
        name: 'Test Product',
        manufacturer: 'Test Corp',
        description: 'Test description',
      };

      const response = await request(app)
        .post('/api/v1/products')
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.sku).toBe('TEST-001');
      expect(response.body.name).toBe('Test Product');
      expect(response.body).toHaveProperty('blockchainTxId');
    });

    it('should return 400 for duplicate SKU', async () => {
      const productData = {
        sku: 'TEST-001',
        name: 'Duplicate Product',
        manufacturer: 'Test Corp',
      };

      const response = await request(app)
        .post('/api/v1/products')
        .send(productData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Incomplete Product' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/products/:sku', () => {
    it('should retrieve product by SKU', async () => {
      const response = await request(app)
        .get('/api/v1/products/TEST-001')
        .expect(200);

      expect(response.body.sku).toBe('TEST-001');
      expect(response.body).toHaveProperty('batches');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/v1/products/NON-EXISTENT')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/products/:sku/batches', () => {
    it('should add batch to product', async () => {
      const batchData = {
        batchNumber: 'B-TEST-001',
        expiryDate: '2026-12-31',
        quantity: 100,
      };

      const response = await request(app)
        .post('/api/v1/products/TEST-001/batches')
        .send(batchData)
        .expect(201);

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
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
