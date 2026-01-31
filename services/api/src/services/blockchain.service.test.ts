/**
 * Unit tests for Blockchain Service
 */

import axios from 'axios';
import { recordTransaction, verifyTransaction } from './blockchain.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Blockchain Service', () => {
  const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://blockchain:3003';

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('recordTransaction', () => {
    it('should successfully record a transaction', async () => {
      const transactionData = {
        type: 'INVOICE_GENERATION',
        invoiceId: 1,
        amount: 500,
        timestamp: new Date().toISOString(),
      };

      const mockResponse = {
        data: {
          txId: 'tx-12345',
          hash: 'hash-67890',
          success: true,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await recordTransaction(transactionData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BLOCKCHAIN_SERVICE_URL}/api/v1/record`,
        transactionData
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors and return null', async () => {
      const transactionData = {
        type: 'INVOICE_GENERATION',
        invoiceId: 1,
        amount: 500,
      };

      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      const result = await recordTransaction(transactionData);

      expect(console.error).toHaveBeenCalledWith(
        'Error recording transaction to blockchain:',
        error
      );
      expect(result).toBeNull();
    });

    it('should handle batch creation transactions', async () => {
      const transactionData = {
        type: 'BATCH_CREATION',
        batchId: 1,
        batchNumber: 'BATCH-001',
        productId: 10,
        quantity: 100,
      };

      const mockResponse = {
        data: {
          txId: 'tx-batch-001',
          success: true,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await recordTransaction(transactionData);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout errors gracefully', async () => {
      const transactionData = { type: 'TEST' };
      const timeoutError = { code: 'ECONNABORTED', message: 'timeout' };

      mockedAxios.post.mockRejectedValue(timeoutError);

      const result = await recordTransaction(transactionData);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('verifyTransaction', () => {
    it('should successfully verify a transaction', async () => {
      const hash = 'valid-hash-123';
      const mockResponse = {
        data: {
          hash,
          valid: true,
          transaction: {
            type: 'INVOICE_GENERATION',
            invoiceId: 1,
            timestamp: '2026-01-31T00:00:00Z',
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await verifyTransaction(hash);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BLOCKCHAIN_SERVICE_URL}/api/v1/verify/${hash}`
      );
      expect(result).toEqual(mockResponse.data);
      expect(result.valid).toBe(true);
    });

    it('should return null for invalid hash', async () => {
      const hash = 'invalid-hash';
      const error = new Error('Hash not found');

      mockedAxios.get.mockRejectedValue(error);

      const result = await verifyTransaction(hash);

      expect(console.error).toHaveBeenCalledWith(
        'Error verifying transaction on blockchain:',
        error
      );
      expect(result).toBeNull();
    });

    it('should handle network errors during verification', async () => {
      const hash = 'some-hash';
      const networkError = { code: 'ENOTFOUND', message: 'Service not available' };

      mockedAxios.get.mockRejectedValue(networkError);

      const result = await verifyTransaction(hash);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error verifying transaction on blockchain:',
        networkError
      );
    });

    it('should handle service unavailable errors', async () => {
      const hash = 'test-hash';
      const error = {
        response: {
          status: 503,
          data: { error: 'Service Unavailable' },
        },
      };

      mockedAxios.get.mockRejectedValue(error);

      const result = await verifyTransaction(hash);

      expect(result).toBeNull();
    });

    it('should verify transactions with complex data', async () => {
      const hash = 'complex-hash';
      const mockResponse = {
        data: {
          hash,
          valid: true,
          transaction: {
            type: 'INVOICE_GENERATION',
            invoiceId: 100,
            items: [
              { batchId: 1, qty: 10 },
              { batchId: 2, qty: 5 },
            ],
            totalAmount: 1500,
          },
          blockHeight: 42,
          previousHash: 'prev-hash-123',
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await verifyTransaction(hash);

      expect(result).toEqual(mockResponse.data);
      expect(result.transaction.items).toHaveLength(2);
    });
  });

  describe('Environment Configuration', () => {
    it('should use default URL when env variable is not set', async () => {
      const originalEnv = process.env.BLOCKCHAIN_SERVICE_URL;
      delete process.env.BLOCKCHAIN_SERVICE_URL;

      const transactionData = { type: 'TEST' };
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      await recordTransaction(transactionData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://blockchain:3003/api/v1/record',
        transactionData
      );

      process.env.BLOCKCHAIN_SERVICE_URL = originalEnv;
    });

    it('should use custom URL from environment variable', async () => {
      const originalEnv = process.env.BLOCKCHAIN_SERVICE_URL;
      process.env.BLOCKCHAIN_SERVICE_URL = 'http://custom-blockchain:8080';

      const transactionData = { type: 'TEST' };
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      await recordTransaction(transactionData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://custom-blockchain:8080/api/v1/record',
        transactionData
      );

      process.env.BLOCKCHAIN_SERVICE_URL = originalEnv;
    });
  });
});
