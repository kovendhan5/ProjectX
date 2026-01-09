/**
 * Unit tests for Batch Controller
 */

import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { createBatch, getBatchByNumber, getBatchesByProduct } from './batch.controller';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    batch: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('Batch Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createBatch', () => {
    it('should create a batch successfully', async () => {
      const batchData = {
        batchNumber: 'BATCH001',
        quantity: 1000,
        manufacturingDate: '2026-01-01',
        expiryDate: '2028-01-01',
      };

      const mockProduct = {
        id: 1,
        sku: 'MED001',
        name: 'Medicine A',
      };

      const mockCreatedBatch = {
        id: 1,
        batchNumber: 'BATCH001',
        productId: 1,
        quantity: 1000,
        manufacturingDate: new Date('2026-01-01'),
        expiryDate: new Date('2028-01-01'),
        status: 'ACTIVE',
        blockchainHash: 'hash123',
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.batch.create as jest.Mock).mockResolvedValue(mockCreatedBatch);

      mockRequest.params = { sku: 'MED001' };
      mockRequest.body = batchData;

      await createBatch(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          batchNumber: 'BATCH001',
          quantity: 1000,
          status: 'ACTIVE',
        })
      );
    });

    it('should return 404 if product does not exist', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { sku: 'NONEXISTENT' };
      mockRequest.body = {
        batchNumber: 'BATCH001',
        quantity: 1000,
        manufacturingDate: '2026-01-01',
        expiryDate: '2028-01-01',
      };

      await createBatch(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Product not found'),
        })
      );
    });
  });

  describe('getBatchesByProduct', () => {
    it('should return all batches for a product', async () => {
      const mockBatches = [
        {
          id: 1,
          batchNumber: 'BATCH001',
          quantity: 1000,
          status: 'ACTIVE',
        },
        {
          id: 2,
          batchNumber: 'BATCH002',
          quantity: 500,
          status: 'ACTIVE',
        },
      ];

      const mockProduct = { id: 1, sku: 'MED001' };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.batch.findMany as jest.Mock).mockResolvedValue(mockBatches);

      mockRequest.params = { sku: 'MED001' };

      await getBatchesByProduct(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(mockBatches);
      expect(prisma.batch.findMany).toHaveBeenCalledWith({
        where: { productId: 1 },
        include: expect.any(Object),
      });
    });
  });

  describe('getBatchByNumber', () => {
    it('should return batch by batch number', async () => {
      const mockBatch = {
        id: 1,
        batchNumber: 'BATCH001',
        quantity: 1000,
        status: 'ACTIVE',
        product: {
          sku: 'MED001',
          name: 'Medicine A',
        },
      };

      (prisma.batch.findUnique as jest.Mock).mockResolvedValue(mockBatch);
      mockRequest.params = { batchNumber: 'BATCH001' };

      await getBatchByNumber(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(mockBatch);
    });

    it('should return 404 if batch not found', async () => {
      (prisma.batch.findUnique as jest.Mock).mockResolvedValue(null);
      mockRequest.params = { batchNumber: 'NONEXISTENT' };

      await getBatchByNumber(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('not found'),
        })
      );
    });
  });
});
