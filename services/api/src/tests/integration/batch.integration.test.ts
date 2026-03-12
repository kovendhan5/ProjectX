/**
 * Batch API Integration Tests
 *
 * Tests batch creation and retrieval endpoints.
 * Routes: POST/GET /api/v1/products/:sku/batches, GET /api/v1/batches/:batchNumber
 */

import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../../app';

const prisma = new PrismaClient();

describe('Batch API Integration Tests', () => {
  let productSku: string;

  beforeAll(async () => {
    const sku = `TEST-BATCH-${Date.now()}`;
    const product = await prisma.product.create({
      data: {
        sku,
        name: 'Test Product for Batches',
        manufacturer: 'Test Pharma',
      },
    });
    productSku = product.sku;
  });

  afterAll(async () => {
    await prisma.batch.deleteMany({ where: { product: { sku: productSku } } });
    await prisma.product.delete({ where: { sku: productSku } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/products/:sku/batches', () => {
    it('should create a new batch for a product', async () => {
      const batchData = {
        batchNumber: `BATCH-${Date.now()}`,
        expiryDate: '2026-01-01',
        quantity: 1000,
      };

      const response = await request(app)
        .post(`/api/v1/products/${productSku}/batches`)
        .send(batchData)
        .expect(201);

      expect(response.body).toMatchObject({
        batchNumber: batchData.batchNumber,
        quantity: batchData.quantity,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('blockchainTxId');
      expect(response.body).toHaveProperty('expiryDate');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${productSku}/batches`)
        .send({ batchNumber: 'INCOMPLETE-BATCH' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if product does not exist', async () => {
      await request(app)
        .post('/api/v1/products/NONEXISTENT-SKU/batches')
        .send({ batchNumber: `BATCH-${Date.now()}`, expiryDate: '2026-01-01', quantity: 1000 })
        .expect(404);
    });

    it('should return 400 if quantity is not positive', async () => {
      const response = await request(app)
        .post(`/api/v1/products/${productSku}/batches`)
        .send({ batchNumber: `BATCH-${Date.now()}`, expiryDate: '2026-01-01', quantity: -100 })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/products/:sku/batches', () => {
    beforeAll(async () => {
      const product = await prisma.product.findUnique({ where: { sku: productSku } });
      if (!product) return;

      await prisma.batch.createMany({
        data: [
          { batchNumber: 'BATCH-TEST-001', productId: product.id, expiryDate: new Date('2026-01-01'), quantity: 1000 },
          { batchNumber: 'BATCH-TEST-002', productId: product.id, expiryDate: new Date('2026-02-01'), quantity: 2000 },
        ],
        skipDuplicates: true,
      });
    });

    it('should retrieve all batches for a product', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${productSku}/batches`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).toHaveProperty('batchNumber');
      expect(response.body[0]).toHaveProperty('quantity');
    });

    it('should return empty array if product has no batches', async () => {
      const sku = `TEST-EMPTY-${Date.now()}`;
      await prisma.product.create({ data: { sku, name: 'No Batches', manufacturer: 'Test' } });

      const response = await request(app)
        .get(`/api/v1/products/${sku}/batches`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
      await prisma.product.delete({ where: { sku } });
    });

    it('should return 404 if product does not exist', async () => {
      await request(app).get('/api/v1/products/NONEXISTENT-SKU/batches').expect(404);
    });
  });

  describe('GET /api/v1/batches/:batchNumber', () => {
    let testBatchNumber: string;

    beforeAll(async () => {
      testBatchNumber = `BATCH-GET-${Date.now()}`;
      const product = await prisma.product.findUnique({ where: { sku: productSku } });
      if (!product) return;
      await prisma.batch.create({
        data: { batchNumber: testBatchNumber, productId: product.id, expiryDate: new Date('2026-01-01'), quantity: 500 },
      });
    });

    it('should retrieve a specific batch by batch number', async () => {
      const response = await request(app)
        .get(`/api/v1/batches/${testBatchNumber}`)
        .expect(200);

      expect(response.body).toMatchObject({ batchNumber: testBatchNumber, quantity: 500 });
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('name');
    });

    it('should return 404 if batch does not exist', async () => {
      await request(app).get('/api/v1/batches/NONEXISTENT-BATCH').expect(404);
    });
  });

  describe('Blockchain Integration', () => {
    it('should record blockchainTxId when batch is created', async () => {
      const batchData = { batchNumber: `BLOCKCHAIN-BATCH-${Date.now()}`, expiryDate: '2026-01-01', quantity: 750 };

      const response = await request(app)
        .post(`/api/v1/products/${productSku}/batches`)
        .send(batchData)
        .expect(201);

      expect(response.body.blockchainTxId).toBeTruthy();
      expect(typeof response.body.blockchainTxId).toBe('string');

      await prisma.batch.delete({ where: { batchNumber: batchData.batchNumber } });
    });
  });
});
