/**
 * Blockchain Service Integration Tests
 * 
 * Tests blockchain service integration with the API
 */

import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import app from '../../app';
import { BlockchainService } from '../../services/blockchain.service';

const prisma = new PrismaClient();
const blockchainService = new BlockchainService();

describe('Blockchain Integration Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.invoice.deleteMany();
    await prisma.batch.deleteMany();
    await prisma.product.deleteMany();

    // Create test product and batch
    await prisma.product.create({
      data: {
        id: 'blockchain-test-product',
        name: 'Test Medication',
        manufacturer: 'Test Manufacturer',
        batches: {
          create: {
            id: 'blockchain-test-batch',
            expiryDate: new Date('2025-12-31'),
            quantity: 1000,
            unitPrice: 10.00
          }
        }
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Transaction Recording', () => {
    it('should record invoice creation on blockchain', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Blockchain Test Pharmacy',
          items: [
            {
              batchId: 'blockchain-test-batch',
              quantity: 5
            }
          ]
        })
        .expect(201);

      // Verify blockchain transaction ID exists
      expect(response.body.blockchainTxId).toBeTruthy();
      expect(typeof response.body.blockchainTxId).toBe('string');
    });

    it('should generate unique transaction IDs', async () => {
      const txIds = new Set();

      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/invoices')
          .send({
            pharmacyName: 'Blockchain Test Pharmacy',
            items: [
              {
                batchId: 'blockchain-test-batch',
                quantity: 1
              }
            ]
          })
          .expect(201);

        txIds.add(response.body.blockchainTxId);
      }

      // All transaction IDs should be unique
      expect(txIds.size).toBe(5);
    });

    it('should maintain transaction integrity', async () => {
      const invoice = {
        pharmacyName: 'Integrity Test Pharmacy',
        items: [
          {
            batchId: 'blockchain-test-batch',
            quantity: 3
          }
        ]
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoice)
        .expect(201);

      const txId = response.body.blockchainTxId;
      
      // Verify transaction can be retrieved (mock verification)
      expect(txId).toMatch(/^[a-f0-9]{64}$/); // SHA256 hash format
    });
  });

  describe('Blockchain Service Methods', () => {
    it('should record transactions with valid data', async () => {
      const txData = {
        invoiceId: 'test-invoice-123',
        pharmacyName: 'Test Pharmacy',
        totalAmount: 50.00,
        items: [
          {
            batchId: 'blockchain-test-batch',
            quantity: 5
          }
        ]
      };

      const txId = await blockchainService.recordTransaction(txData);

      expect(txId).toBeTruthy();
      expect(typeof txId).toBe('string');
      expect(txId.length).toBeGreaterThan(0);
    });

    it('should verify recorded transactions', async () => {
      const txData = {
        invoiceId: 'verify-test-invoice',
        pharmacyName: 'Verification Test Pharmacy',
        totalAmount: 75.00,
        items: []
      };

      const txId = await blockchainService.recordTransaction(txData);
      const isValid = await blockchainService.verifyTransaction(txId);

      expect(isValid).toBe(true);
    });

    it('should reject invalid transaction IDs', async () => {
      const isValid = await blockchainService.verifyTransaction('invalid-tx-id');
      expect(isValid).toBe(false);
    });

    it('should handle blockchain service failures gracefully', async () => {
      // Test with invalid data
      await expect(async () => {
        await blockchainService.recordTransaction(null as any);
      }).rejects.toThrow();
    });
  });

  describe('Transaction Immutability', () => {
    it('should maintain immutable transaction records', async () => {
      const response1 = await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Immutability Test Pharmacy',
          items: [
            {
              batchId: 'blockchain-test-batch',
              quantity: 2
            }
          ]
        })
        .expect(201);

      const txId1 = response1.body.blockchainTxId;

      // Create another transaction with identical data
      const response2 = await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Immutability Test Pharmacy',
          items: [
            {
              batchId: 'blockchain-test-batch',
              quantity: 2
            }
          ]
        })
        .expect(201);

      const txId2 = response2.body.blockchainTxId;

      // Different transactions should have different IDs
      expect(txId1).not.toBe(txId2);
    });
  });

  describe('Performance', () => {
    it('should process blockchain transactions efficiently', async () => {
      const start = Date.now();

      await request(app)
        .post('/api/invoices')
        .send({
          pharmacyName: 'Performance Test Pharmacy',
          items: [
            {
              batchId: 'blockchain-test-batch',
              quantity: 1
            }
          ]
        })
        .expect(201);

      const duration = Date.now() - start;

      // Transaction should complete within reasonable time (< 500ms)
      expect(duration).toBeLessThan(500);
    });

    it('should handle concurrent blockchain transactions', async () => {
      const requests = Array(5).fill(null).map((_, index) =>
        request(app)
          .post('/api/invoices')
          .send({
            pharmacyName: `Concurrent Test Pharmacy ${index}`,
            items: [
              {
                batchId: 'blockchain-test-batch',
                quantity: 1
              }
            ]
          })
      );

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.blockchainTxId).toBeTruthy();
      });

      // All transaction IDs should be unique
      const txIds = responses.map(r => r.body.blockchainTxId);
      const uniqueTxIds = new Set(txIds);
      expect(uniqueTxIds.size).toBe(txIds.length);
    });
  });
});
