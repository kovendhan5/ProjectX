/**
 * Invoice API Integration Tests
 * 
 * Tests the complete flow of invoice creation including:
 * - Database operations
 * - Blockchain integration
 * - API endpoints
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../app';

const prisma = new PrismaClient();

describe('Invoice Integration Tests', () => {
  beforeAll(async () => {
    // Clean database
    await prisma.invoice.deleteMany();
    await prisma.batch.deleteMany();
    await prisma.product.deleteMany();

    // Seed test data
    await prisma.product.create({
      data: {
        id: 'test-product-1',
        name: 'Test Paracetamol',
        manufacturer: 'Test Pharma Ltd',
        batches: {
          create: {
            id: 'test-batch-1',
            expiryDate: new Date('2025-12-31'),
            quantity: 1000,
            unitPrice: 5.99
          }
        }
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/invoices', () => {
    it('should create invoice with valid data', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Test Pharmacy',
          items: [
            {
              batchId: 'test-batch-1',
              quantity: 10
            }
          ]
        })
        .expect(201);

      expect(response.body).toMatchObject({
        pharmacyName: 'Test Pharmacy',
        totalAmount: expect.any(Number),
        blockchainTxId: expect.any(String)
      });

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toMatchObject({
        batchId: 'test-batch-1',
        quantity: 10
      });
    });

    it('should reject invoice with insufficient batch quantity', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Test Pharmacy',
          items: [
            {
              batchId: 'test-batch-1',
              quantity: 10000 // More than available
            }
          ]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invoice with non-existent batch', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Test Pharmacy',
          items: [
            {
              batchId: 'non-existent-batch',
              quantity: 10
            }
          ]
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invoice with missing required fields', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          items: [
            {
              batchId: 'test-batch-1',
              quantity: 10
            }
          ]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should calculate total amount correctly', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Test Pharmacy',
          items: [
            {
              batchId: 'test-batch-1',
              quantity: 5
            }
          ]
        })
        .expect(201);

      // 5 units * $5.99 = $29.95
      expect(response.body.totalAmount).toBeCloseTo(29.95, 2);
    });

    it('should record blockchain transaction', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Test Pharmacy',
          items: [
            {
              batchId: 'test-batch-1',
              quantity: 3
            }
          ]
        })
        .expect(201);

      // Verify blockchain transaction ID exists
      expect(response.body.blockchainTxId).toBeTruthy();
      expect(typeof response.body.blockchainTxId).toBe('string');
      expect(response.body.blockchainTxId.length).toBeGreaterThan(0);
    });

    it('should update batch quantity after invoice creation', async () => {
      // Get initial quantity
      const batchBefore = await prisma.batch.findUnique({
        where: { id: 'test-batch-1' }
      });
      const initialQuantity = batchBefore?.quantity || 0;

      // Create invoice
      await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Test Pharmacy',
          items: [
            {
              batchId: 'test-batch-1',
              quantity: 7
            }
          ]
        })
        .expect(201);

      // Get updated quantity
      const batchAfter = await prisma.batch.findUnique({
        where: { id: 'test-batch-1' }
      });
      const finalQuantity = batchAfter?.quantity || 0;

      expect(finalQuantity).toBe(initialQuantity - 7);
    });
  });

  describe('GET /api/invoices', () => {
    it('should retrieve all invoices', async () => {
      const response = await request(app)
        .get('/api/invoices')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should include invoice items in response', async () => {
      const response = await request(app)
        .get('/api/invoices')
        .expect(200);

      const invoice = response.body[0];
      expect(invoice).toHaveProperty('items');
      expect(Array.isArray(invoice.items)).toBe(true);
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should retrieve specific invoice by ID', async () => {
      // Create test invoice
      const createResponse = await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Test Pharmacy',
          items: [
            {
              batchId: 'test-batch-1',
              quantity: 2
            }
          ]
        })
        .expect(201);

      const invoiceId = createResponse.body.id;

      // Retrieve invoice
      const response = await request(app)
        .get(`/api/invoices/${invoiceId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: invoiceId,
        pharmacyName: 'Test Pharmacy'
      });
    });

    it('should return 404 for non-existent invoice', async () => {
      const response = await request(app)
        .get('/api/invoices/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
