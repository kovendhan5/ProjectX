import { Request, Response } from 'express';

export const healthCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
};

export const getApiInfo = (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'ProjectX API',
    version: '1.0.0',
    description: 'Blockchain-backed pharmaceutical supply chain API',
    endpoints: {
      auth: {
        'POST /api/v1/auth/login': 'Obtain JWT token',
        'GET /api/v1/auth/me': 'Get current user',
      },
      products: {
        'GET /api/v1/products': 'List all products',
        'POST /api/v1/products': 'Create new product',
        'GET /api/v1/products/:sku': 'Get product by SKU',
        'POST /api/v1/products/:sku/batches': 'Add batch to product',
        'GET /api/v1/products/:sku/batches': 'List batches for product',
        'GET /api/v1/batches/:batchNumber': 'Get batch by number',
      },
      invoices: {
        'POST /api/v1/invoices': 'Create new invoice',
        'GET /api/v1/invoices': 'List invoices',
        'GET /api/v1/invoices/:id': 'Get invoice by ID',
      },
      health: {
        'GET /health': 'Health check',
        'GET /': 'API information',
      },
    },
  });
};
