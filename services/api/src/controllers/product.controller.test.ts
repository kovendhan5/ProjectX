import { Request, Response } from 'express';
import prisma from '../config/db';
import { createBatch, createProduct, getProduct, getProducts } from './product.controller';

// Mock Prisma client
jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    batch: {
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

      await getProduct(mockRequest as Request, mockResponse as Response);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { sku: 'TEST-001' },
        include: { batches: true },
      });
      expect(responseJson).toHaveBeenCalledWith(mockProduct);
    });

    it('should return 404 for non-existent product', async () => {
      mockRequest.params = { sku: 'NONEXISTENT' };

      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      await getProduct(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Product not found' })
      );
    });
  });

  describe('getProducts', () => {
    it('should return all products with batches', async () => {
      const mockProducts = [
        {
          id: 'uuid-1',
          sku: 'PROD-001',
          name: 'Product 1',
          manufacturer: 'Manufacturer A',
          batches: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-2',
          sku: 'PROD-002',
          name: 'Product 2',
          manufacturer: 'Manufacturer B',
          batches: [
            {
              id: 'batch-1',
              batchNumber: 'B-001',
              quantity: 50,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        include: { batches: true },
      });
      expect(responseJson).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle errors when fetching products', async () => {
      (prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getProducts(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });

  describe('createBatch', () => {
    it('should create a batch successfully', async () => {
      const batchData = {
        batchNumber: 'BATCH-001',
        productId: 'product-uuid',
        manufactureDate: '2026-01-01',
        expiryDate: '2027-01-01',
        quantity: 100,
      };

      mockRequest.body = batchData;

      const mockBatch = {
        id: 'batch-uuid',
        ...batchData,
        manufactureDate: new Date(batchData.manufactureDate),
        expiryDate: new Date(batchData.expiryDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.batch.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.batch.create as jest.Mock).mockResolvedValue(mockBatch);

      await createBatch(mockRequest as Request, mockResponse as Response);

      expect(prisma.batch.findUnique).toHaveBeenCalledWith({
        where: { batchNumber: batchData.batchNumber },
      });
      expect(prisma.batch.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          batchNumber: batchData.batchNumber,
          quantity: batchData.quantity,
        }),
      });
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(mockBatch);
    });

    it('should return 409 if batch already exists', async () => {
      const batchData = {
        batchNumber: 'BATCH-001',
        productId: 'product-uuid',
        manufactureDate: '2026-01-01',
        expiryDate: '2027-01-01',
        quantity: 100,
      };

      mockRequest.body = batchData;

      const existingBatch = {
        id: 'existing-uuid',
        batchNumber: 'BATCH-001',
        productId: 'product-uuid',
      };

      (prisma.batch.findUnique as jest.Mock).mockResolvedValue(existingBatch);

      await createBatch(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(409);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Batch with this number already exists',
        })
      );
    });

    it('should handle errors when creating batch', async () => {
      const batchData = {
        batchNumber: 'BATCH-001',
        productId: 'product-uuid',
        manufactureDate: '2026-01-01',
        expiryDate: '2027-01-01',
        quantity: 100,
      };

      mockRequest.body = batchData;

      (prisma.batch.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.batch.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await createBatch(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
    });
  });
});
