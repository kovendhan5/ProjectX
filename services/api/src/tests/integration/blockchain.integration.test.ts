/**
 * Blockchain Service Integration Tests
 *
 * Tests blockchain service integration with the API.
 * Verifies blockchainTxId is present on invoice responses and that
 * BlockchainService methods work as expected.
 */

import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../../app';
import { BlockchainService } from '../../services/blockchain.service';

const prisma = new PrismaClient();
const blockchainService = new BlockchainService();

describe('Blockchain Integration Tests', () => {
  let testProductId: string;
  let testBatchId: string;

  beforeAll(async () => {
    // Clean up and seed minimal test data
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.batch.deleteMany({});
    await prisma.product.deleteMany({});

    const product = await prisma.product.create({
      data: {
        sku: 'BLOCKCHAIN-TEST-SKU',
        name: 'Test Medication',
        manufacturer: 'Test Manufacturer',
      },
    });
    testProductId = product.id;

    const batch = await prisma.batch.create({
      data: {
        batchNumber: 'BC-BATCH-001',
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

  describe('Transaction Recording via Invoice API', () => {
    it('should record invoice creation with blockchainTxId', async () => {
      const response = await request(app)
        .post('/api/v1/invoices')
        .send({
          customerName: 'Blockchain Test Pharmacy',
          items: [{ batchId: testBatchId, quantity: 5, price: 10.00 }],
        })
        .expect(201);

      expect(response.body.blockchainTxId).toBeTruthy();
      expect(typeof response.body.blockchainTxId).toBe('string');
      expect(response.body.blockchainTxId.length).toBeGreaterThan(0);
    });

    it('should generate unique transaction IDs per invoice', async () => {
      const txIds = new Set<string>();

      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/v1/invoices')
          .send({
            customerName: 'Uniqueness Test Pharmacy',
            items: [{ batchId: testBatchId, quantity: 1, price: 5.00 }],
          })
          .expect(201);
        txIds.add(response.body.blockchainTxId);
      }

      expect(txIds.size).toBe(3);
    });

    it('should maintain UUID format for transaction IDs', async () => {
      const response = await request(app)
        .post('/api/v1/invoices')
        .send({
          customerName: 'Format Test Pharmacy',
          items: [{ batchId: testBatchId, quantity: 1, price: 5.00 }],
        })
        .expect(201);

      // UUID v4 format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(response.body.blockchainTxId).toMatch(uuidRegex);
    });
  });

  describe('BlockchainService Methods', () => {
    it('should record transactions with valid data', async () => {
      const txData = {
        invoiceId: 'test-invoice-123',
        customerName: 'Test Pharmacy',
        totalAmount: 50.00,
        items: [{ batchId: testBatchId, quantity: 5 }],
      };

      const txId = await blockchainService.recordTransaction(txData);

      expect(txId).toBeTruthy();
      expect(typeof txId).toBe('string');
      expect((txId as string).length).toBeGreaterThan(0);
    });

    it('should verify recorded transactions', async () => {
      const txData = {
        invoiceId: 'verify-test-invoice',
        customerName: 'Verification Test Pharmacy',
        totalAmount: 75.00,
        items: [],
      };

      const txId = await blockchainService.recordTransaction(txData);
      const isValid = await blockchainService.verifyTransaction(txId as string);

      expect(isValid).toBe(true);
    });

    it('should return false for invalid transaction IDs', async () => {
      const isValid = await blockchainService.verifyTransaction('invalid-tx-id');
      expect(isValid).toBe(false);
    });

    it('should handle null input gracefully', async () => {
      await expect(blockchainService.recordTransaction(null as any)).rejects.toThrow();
    });
  });

  describe('Transaction Immutability', () => {
    it('should assign different IDs to identical transactions', async () => {
      const payload = {
        customerName: 'Immutability Test Pharmacy',
        items: [{ batchId: testBatchId, quantity: 2, price: 10.00 }],
      };

      const response1 = await request(app).post('/api/v1/invoices').send(payload).expect(201);
      const response2 = await request(app).post('/api/v1/invoices').send(payload).expect(201);

      expect(response1.body.blockchainTxId).not.toBe(response2.body.blockchainTxId);
    });
  });
});
