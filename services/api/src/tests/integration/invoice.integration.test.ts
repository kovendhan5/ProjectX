/**
 * Invoice API Integration Tests
 *
 * Tests the complete flow of invoice creation including:
 * - Database operations
 * - Blockchain integration
 * - API endpoints
 */

import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../../app';

const prisma = new PrismaClient();

describe('Invoice Integration Tests', () => {
  let testBatchId: string;
  const ITEM_PRICE = 5.99;

  beforeAll(async () => {
    // Clean database
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.batch.deleteMany({});
    await prisma.product.deleteMany({});

    // Seed test data
    const product = await prisma.product.create({
      data: {
        sku: 'INV-TEST-SKU-001',
        name: 'Test Paracetamol',
        manufacturer: 'Test Pharma Ltd',
      },
    });

    const batch = await prisma.batch.create({
      data: {
        batchNumber: 'INV-BATCH-001',
        productId: product.id,
        expiryDate: new Date('2027-12-31'),
        quantity: 10000,
      },
    });
    testBatchId = batch.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/invoices', () => {
    it('should create invoice with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/invoices')
        .send({
          customerName: 'Test Pharmacy',
          items: [{ batchId: testBatchId, quantity: 10, price: ITEM_PRICE }],
        })
        .expect(201);

      expect(response.body).toMatchObject({
        customerName: 'Test Pharmacy',
        totalAmount: expect.any(Number),
        blockchainTxId: expect.any(String),
      });

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toMatchObject({
        batchId: testBatchId,
        quantity: 10,
      });
    });

    it('should reject invoice with insufficient batch quantity', async () => {
      const response = await request(app)
        .post('/api/v1/invoices')
        .send({
          customerName: 'Test Pharmacy',
          items: [{ batchId: testBatchId, quantity: 99999, price: ITEM_PRICE }],
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invoice with non-existent batch', async () => {
      const response = await request(app)
        .post('/api/v1/invoices')
        .send({
          customerName: 'Test Pharmacy',
          items: [{ batchId: 'non-existent-batch-id', quantity: 10, price: ITEM_PRICE }],
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invoice with missing items', async () => {
      const response = await request(app)
        .post('/api/v1/invoices')
        .send({ customerName: 'Test Pharmacy', items: [] })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should calculate total amount correctly', async () => {
      const qty = 5;
      const price = ITEM_PRICE;

      const response = await request(app)
        .post('/api/v1/invoices')
        .send({
          customerName: 'Test Pharmacy',
          items: [{ batchId: testBatchId, quantity: qty, price }],
        })
        .expect(201);

      expect(response.body.totalAmount).toBeCloseTo(qty * price, 2);
    });

    it('should record blockchain transaction', async () => {
      const response = await request(app)
        .post('/api/v1/invoices')
        .send({
          customerName: 'Test Pharmacy',
          items: [{ batchId: testBatchId, quantity: 3, price: ITEM_PRICE }],
        })
        .expect(201);

      expect(response.body.blockchainTxId).toBeTruthy();
      expect(typeof response.body.blockchainTxId).toBe('string');
      expect(response.body.blockchainTxId.length).toBeGreaterThan(0);
    });

    it('should update batch quantity after invoice creation', async () => {
      const batchBefore = await prisma.batch.findUnique({ where: { id: testBatchId } });
      const initialQuantity = batchBefore?.quantity || 0;

      await request(app)
        .post('/api/v1/invoices')
        .send({
          customerName: 'Test Pharmacy',
          items: [{ batchId: testBatchId, quantity: 7, price: ITEM_PRICE }],
        })
        .expect(201);

      const batchAfter = await prisma.batch.findUnique({ where: { id: testBatchId } });
      expect(batchAfter?.quantity).toBe(initialQuantity - 7);
    });
  });

  describe('GET /api/v1/invoices', () => {
    it('should retrieve all invoices', async () => {
      const response = await request(app).get('/api/v1/invoices').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should include invoice items in response', async () => {
      const response = await request(app).get('/api/v1/invoices').expect(200);

      const invoice = response.body[0];
      expect(invoice).toHaveProperty('items');
      expect(Array.isArray(invoice.items)).toBe(true);
    });
  });

  describe('GET /api/v1/invoices/:id', () => {
    it('should retrieve specific invoice by ID', async () => {
      const createResponse = await request(app)
        .post('/api/v1/invoices')
        .send({
          customerName: 'Test Pharmacy',
          items: [{ batchId: testBatchId, quantity: 2, price: ITEM_PRICE }],
        })
        .expect(201);

      const invoiceId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: invoiceId,
        customerName: 'Test Pharmacy',
      });
    });

    it('should return 404 for non-existent invoice', async () => {
      const response = await request(app)
        .get('/api/v1/invoices/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
