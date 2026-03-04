/**
 * Unit tests for Invoice Controller
 */

import { Request, Response } from 'express';
import { createInvoice, getInvoiceById, getInvoices } from './invoice.controller';

// Mock the database and blockchain service
jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    invoice: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    batch: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../services/blockchain.service', () => ({
  recordTransaction: jest.fn(),
}));

import prisma from '../config/db';
import { recordTransaction } from '../services/blockchain.service';

describe('Invoice Controller', () => {
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

  describe('createInvoice', () => {
    it('should create an invoice successfully', async () => {
      const invoiceData = {
        customerName: 'John Doe',
        items: [
          {
            batchId: 'batch-uuid-123',
            quantity: 10,
            price: 50.0,
          },
        ],
      };

      const mockBatch = {
        id: 'batch-uuid-123',
        batchNumber: 'BATCH001',
        quantity: 100,
      };

      const mockCreatedInvoice = {
        id: 'invoice-uuid-456',
        invoiceNumber: 'INV-123456789',
        customerName: 'John Doe',
        totalAmount: 500,
        createdAt: new Date(),
        items: [
          {
            id: 'item-uuid-789',
            batchId: 'batch-uuid-123',
            quantity: 10,
            price: 50.0,
          },
        ],
      };

      // Mock $transaction to execute the callback
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          batch: {
            findUnique: jest.fn().mockResolvedValue(mockBatch),
            update: jest.fn().mockResolvedValue({ ...mockBatch, quantity: 90 }),
          },
          invoice: {
            create: jest.fn().mockResolvedValue(mockCreatedInvoice),
          },
        });
      });

      (recordTransaction as jest.Mock).mockResolvedValue(undefined);

      mockRequest.body = invoiceData;

      await createInvoice(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceNumber: expect.any(String),
          customerName: 'John Doe',
          totalAmount: 500,
        })
      );
      expect(recordTransaction).toHaveBeenCalled();
    });

    it('should return 400 if batch not found', async () => {
      mockRequest.body = {
        customerName: 'John Doe',
        items: [
          {
            batchId: 'non-existent-uuid',
            quantity: 10,
            price: 50.0,
          },
        ],
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          batch: {
            findUnique: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
          },
          invoice: {
            create: jest.fn(),
          },
        });
      });

      await createInvoice(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('not found'),
        })
      );
    });

    it('should return 400 if insufficient quantity', async () => {
      const mockBatch = {
        id: 'batch-uuid-123',
        batchNumber: 'BATCH001',
        quantity: 5,
      };

      mockRequest.body = {
        customerName: 'John Doe',
        items: [
          {
            batchId: 'batch-uuid-123',
            quantity: 10,
            price: 50.0,
          },
        ],
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          batch: {
            findUnique: jest.fn().mockResolvedValue(mockBatch),
            update: jest.fn(),
          },
          invoice: {
            create: jest.fn(),
          },
        });
      });

      await createInvoice(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Insufficient'),
        })
      );
    });
  });

  describe('getInvoices', () => {
    it('should return all invoices', async () => {
      const mockInvoices = [
        {
          id: 'invoice-uuid-1',
          invoiceNumber: 'INV-001',
          customerName: 'John Doe',
          totalAmount: 500,
          createdAt: new Date(),
          items: [],
        },
        {
          id: 'invoice-uuid-2',
          invoiceNumber: 'INV-002',
          customerName: 'Jane Smith',
          totalAmount: 750,
          createdAt: new Date(),
          items: [],
        },
      ];

      (prisma.invoice.findMany as jest.Mock).mockResolvedValue(mockInvoices);

      await getInvoices(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockInvoices);
      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        include: {
          items: {
            include: {
              batch: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should handle errors when fetching invoices', async () => {
      (prisma.invoice.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getInvoices(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal Server Error',
        })
      );
    });
  });

  describe('getInvoiceById', () => {
    it('should return invoice by ID', async () => {
      const mockInvoice = {
        id: 'invoice-uuid-1',
        invoiceNumber: 'INV-001',
        customerName: 'John Doe',
        totalAmount: 500,
        createdAt: new Date(),
        items: [
          {
            id: 'item-uuid-1',
            batchId: 'batch-uuid-1',
            quantity: 10,
            price: 50.0,
            batch: {
              batchNumber: 'BATCH001',
            },
          },
        ],
      };

      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(mockInvoice);
      mockRequest.params = { id: 'invoice-uuid-1' };

      await getInvoiceById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockInvoice);
      expect(prisma.invoice.findUnique).toHaveBeenCalledWith({
        where: { id: 'invoice-uuid-1' },
        include: {
          items: {
            include: {
              batch: true,
            },
          },
        },
      });
    });

    it('should return 404 if invoice not found', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockResolvedValue(null);
      mockRequest.params = { id: 'non-existent-uuid' };

      await getInvoiceById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('not found'),
        })
      );
    });

    it('should return 400 for invalid ID', async () => {
      mockRequest.params = { id: '' };

      await getInvoiceById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid invoice ID',
        })
      );
    });

    it('should handle errors when fetching invoice', async () => {
      (prisma.invoice.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockRequest.params = { id: 'invoice-uuid-1' };

      await getInvoiceById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal Server Error',
        })
      );
    });
  });
});
