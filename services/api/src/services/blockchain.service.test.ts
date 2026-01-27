/**
 * Unit tests for Blockchain Service
 */

import axios from 'axios';
import { recordTransaction, verifyTransaction } from './blockchain.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Blockchain Service', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error during tests
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('recordTransaction', () => {
    it('should record transaction successfully', async () => {
      const transactionData = {
        type: 'INVOICE_GENERATION',
        invoiceId: 1,
        invoiceNumber: 'INV-001',
        totalAmount: 500,
        timestamp: new Date().toISOString(),
      };

      const mockResponse = {
        data: {
          success: true,
          hash: 'abc123def456',
          txId: 'tx-001',
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await recordTransaction(transactionData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/record'),
        transactionData
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle errors gracefully', async () => {
      const transactionData = {
        type: 'BATCH_CREATION',
        batchId: 1,
      };

      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      const result = await recordTransaction(transactionData);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error recording transaction to blockchain:',
        error
      );
    });

    it('should use default blockchain URL if env not set', async () => {
      const originalUrl = process.env.BLOCKCHAIN_SERVICE_URL;
      delete process.env.BLOCKCHAIN_SERVICE_URL;

      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      await recordTransaction({ test: 'data' });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('http://blockchain:3003'),
        expect.any(Object)
      );

      if (originalUrl) {
        process.env.BLOCKCHAIN_SERVICE_URL = originalUrl;
      }
    });

    it('should use custom blockchain URL from env', async () => {
      const originalUrl = process.env.BLOCKCHAIN_SERVICE_URL;
      process.env.BLOCKCHAIN_SERVICE_URL = 'http://custom-blockchain:4000';

      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      await recordTransaction({ test: 'data' });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('http://custom-blockchain:4000'),
        expect.any(Object)
      );

      if (originalUrl) {
        process.env.BLOCKCHAIN_SERVICE_URL = originalUrl;
      } else {
        delete process.env.BLOCKCHAIN_SERVICE_URL;
      }
    });
  });

  describe('verifyTransaction', () => {
    it('should verify transaction successfully', async () => {
      const hash = 'abc123def456';
      const mockResponse = {
        data: {
          valid: true,
          transaction: {
            hash,
            type: 'INVOICE_GENERATION',
            timestamp: '2026-01-27T10:00:00Z',
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await verifyTransaction(hash);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/api/v1/verify/${hash}`)
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle verification errors gracefully', async () => {
      const hash = 'invalid-hash';
      const error = new Error('Transaction not found');

      mockedAxios.get.mockRejectedValue(error);

      const result = await verifyTransaction(hash);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error verifying transaction on blockchain:',
        error
      );
    });

    it('should return null for non-existent transaction', async () => {
      const hash = 'nonexistent';

      mockedAxios.get.mockRejectedValue(new Error('404 Not Found'));

      const result = await verifyTransaction(hash);

      expect(result).toBeNull();
    });
  });
});
