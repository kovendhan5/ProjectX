import { Request, Response } from 'express';
import prisma from '../config/db';
import { createProduct, getProductBySku } from './product.controller';

// Mock Prisma client
jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Mock blockchain service
jest.mock('../services/blockchain.service', () => ({
  recordTransaction: jest.fn().mockResolvedValue({ txId: 'mock-tx-id' }),
}));

describe('Product Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });

    mockRequest = {};
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };

    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const productData = {
        sku: 'TEST-001',
        name: 'Test Product',
        manufacturer: 'Test Corp',
        description: 'A test product',
      };

      mockRequest.body = productData;

      const mockProduct = {
        id: 'test-uuid',
        ...productData,
        blockchainTxId: 'mock-tx-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      await createProduct(mockRequest as Request, mockResponse as Response);

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sku: productData.sku,
          name: productData.name,
          manufacturer: productData.manufacturer,
        }),
      });
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          sku: productData.sku,
        })
      );
    });

    it('should handle validation errors', async () => {
      mockRequest.body = { sku: 'TEST-001' }; // Missing required fields

      await createProduct(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe('getProductBySku', () => {
    it('should return product with batches', async () => {
      mockRequest.params = { sku: 'TEST-001' };

      const mockProduct = {
        id: 'test-uuid',
        sku: 'TEST-001',
        name: 'Test Product',
        manufacturer: 'Test Corp',
        description: 'A test product',
        blockchainTxId: 'tx-123',
        batches: [
          {
            id: 'batch-uuid',
            batchNumber: 'B-001',
            quantity: 100,
            expiryDate: new Date('2026-12-31'),
            status: 'ACTIVE',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      await getProductBySku(mockRequest as Request, mockResponse as Response);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { sku: 'TEST-001' },
        include: { batches: true },
      });
      expect(responseJson).toHaveBeenCalledWith(mockProduct);
    });

    it('should return 404 for non-existent product', async () => {
      mockRequest.params = { sku: 'NONEXISTENT' };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      await getProductBySku(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Product not found' })
      );
    });
  });
});
