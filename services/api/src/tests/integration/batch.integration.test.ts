import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { app } from '../../app';

const prisma = new PrismaClient();

describe('Batch API Integration Tests', () => {
  let productSKU: string;

  beforeAll(async () => {
    // Create a test product first
    const product = await prisma.product.create({
      data: {
        sku: `TEST-BATCH-${Date.now()}`,
        name: 'Test Product for Batches',
        manufacturer: 'Test Pharma',
        activeIngredient: 'Test Ingredient',
        strength: '100mg',
        dosageForm: 'tablet',
      },
    });
    productSKU = product.sku;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.batch.deleteMany({ where: { productSKU } });
    await prisma.product.delete({ where: { sku: productSKU } });
    await prisma.$disconnect();
  });

  describe('POST /api/products/:sku/batches', () => {
    it('should create a new batch for a product', async () => {
      const batchData = {
        batchNumber: `BATCH-${Date.now()}`,
        manufacturingDate: new Date('2024-01-01').toISOString(),
        expiryDate: new Date('2026-01-01').toISOString(),
        quantity: 1000,
        storageConditions: 'Store in cool, dry place',
      };

      const response = await request(app)
        .post(`/api/products/${productSKU}/batches`)
        .send(batchData)
        .expect(201);

      expect(response.body).toMatchObject({
        batchNumber: batchData.batchNumber,
        productSKU: productSKU,
        quantity: batchData.quantity,
        storageConditions: batchData.storageConditions,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('blockchainHash');
      expect(new Date(response.body.manufacturingDate).toISOString()).toBe(
        batchData.manufacturingDate
      );
      expect(new Date(response.body.expiryDate).toISOString()).toBe(
        batchData.expiryDate
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post(`/api/products/${productSKU}/batches`)
        .send({
          batchNumber: 'INCOMPLETE-BATCH',
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 if product does not exist', async () => {
      const batchData = {
        batchNumber: `BATCH-${Date.now()}`,
        manufacturingDate: new Date('2024-01-01').toISOString(),
        expiryDate: new Date('2026-01-01').toISOString(),
        quantity: 1000,
      };

      await request(app)
        .post('/api/products/NONEXISTENT-SKU/batches')
        .send(batchData)
        .expect(404);
    });

    it('should return 400 if expiry date is before manufacturing date', async () => {
      const batchData = {
        batchNumber: `BATCH-${Date.now()}`,
        manufacturingDate: new Date('2026-01-01').toISOString(),
        expiryDate: new Date('2024-01-01').toISOString(), // Invalid
        quantity: 1000,
      };

      const response = await request(app)
        .post(`/api/products/${productSKU}/batches`)
        .send(batchData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 if quantity is not positive', async () => {
      const batchData = {
        batchNumber: `BATCH-${Date.now()}`,
        manufacturingDate: new Date('2024-01-01').toISOString(),
        expiryDate: new Date('2026-01-01').toISOString(),
        quantity: -100, // Invalid
      };

      const response = await request(app)
        .post(`/api/products/${productSKU}/batches`)
        .send(batchData)
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
            batchNumber: 'BATCH-TEST-001',
            productSKU,
            manufacturingDate: new Date('2024-01-01'),
            expiryDate: new Date('2026-01-01'),
            quantity: 1000,
            blockchainHash: 'hash1',
          },
          {
            batchNumber: 'BATCH-TEST-002',
            productSKU,
            manufacturingDate: new Date('2024-02-01'),
            expiryDate: new Date('2026-02-01'),
            quantity: 2000,
            blockchainHash: 'hash2',
          },
        ],
      });
    });

    it('should retrieve all batches for a product', async () => {
      const response = await request(app)
        .get(`/api/products/${productSKU}/batches`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).toHaveProperty('batchNumber');
      expect(response.body[0]).toHaveProperty('quantity');
      expect(response.body[0]).toHaveProperty('blockchainHash');
    });

    it('should return empty array if product has no batches', async () => {
      const newProduct = await prisma.product.create({
        data: {
          sku: `TEST-EMPTY-${Date.now()}`,
          name: 'Product Without Batches',
          manufacturer: 'Test Pharma',
          activeIngredient: 'Test',
          strength: '50mg',
          dosageForm: 'tablet',
        },
      });

      const response = await request(app)
        .get(`/api/products/${newProduct.sku}/batches`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      // Clean up
      await prisma.product.delete({ where: { sku: newProduct.sku } });
    });

    it('should return 404 if product does not exist', async () => {
      await request(app)
        .get('/api/products/NONEXISTENT-SKU/batches')
        .expect(404);
    });
  });

  describe('GET /api/batches/:batchNumber', () => {
    let testBatchNumber: string;

    beforeAll(async () => {
      // Create a test batch
      testBatchNumber = `BATCH-GET-${Date.now()}`;
      await prisma.batch.create({
        data: {
          batchNumber: testBatchNumber,
          productSKU,
          manufacturingDate: new Date('2024-01-01'),
          expiryDate: new Date('2026-01-01'),
          quantity: 500,
          blockchainHash: 'test-hash',
          storageConditions: 'Cool and dry',
        },
      });
    });

    it('should retrieve a specific batch by batch number', async () => {
      const response = await request(app)
        .get(`/api/batches/${testBatchNumber}`)
        .expect(200);

      expect(response.body).toMatchObject({
        batchNumber: testBatchNumber,
        productSKU,
        quantity: 500,
        storageConditions: 'Cool and dry',
      });
      expect(response.body).toHaveProperty('product');
      expect(response.body.product).toHaveProperty('name');
    });

    it('should return 404 if batch does not exist', async () => {
      await request(app)
        .get('/api/batches/NONEXISTENT-BATCH')
        .expect(404);
    });
  });

  describe('Blockchain Integration', () => {
    it('should record batch on blockchain when created', async () => {
      const batchData = {
        batchNumber: `BLOCKCHAIN-BATCH-${Date.now()}`,
        manufacturingDate: new Date('2024-01-01').toISOString(),
        expiryDate: new Date('2026-01-01').toISOString(),
        quantity: 750,
      };

      const response = await request(app)
        .post(`/api/products/${productSKU}/batches`)
        .send(batchData)
        .expect(201);

      // Verify blockchain hash is present
      expect(response.body.blockchainHash).toBeTruthy();
      expect(typeof response.body.blockchainHash).toBe('string');
      expect(response.body.blockchainHash.length).toBeGreaterThan(0);

      // Clean up
      await prisma.batch.delete({
        where: { batchNumber: batchData.batchNumber },
      });
    });
  });
});
