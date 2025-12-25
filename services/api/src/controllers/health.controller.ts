import { Request, Response } from 'express';

export const healthCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ProjectX API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
};

export const getApiInfo = (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'ProjectX API',
    version: '1.0.0',
    description: 'Blockchain-backed pharmaceutical supply chain API',
    endpoints: {
      products: {
        'GET /api/v1/products/:sku': 'Get product by SKU',
        'POST /api/v1/products': 'Create new product',
        'POST /api/v1/products/:sku/batches': 'Add batch to product'
      },
      invoices: {
        'POST /api/v1/invoices': 'Create new invoice'
      },
      health: {
        'GET /health': 'Health check endpoint',
        'GET /': 'API information'
      }
    },
    documentation: 'See README.md for detailed API documentation'
  });
};
