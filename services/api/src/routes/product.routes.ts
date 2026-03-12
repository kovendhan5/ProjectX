import { Router } from 'express';
import {
  createBatchForProduct,
  createProduct,
  getBatchByNumber,
  getBatchesForProduct,
  getProduct,
  getProducts,
} from '../controllers/product.controller';
import { writeLimiter } from '../middleware/rateLimiter';
import validate from '../middleware/validateResource';
import { createBatchForProductSchema, createProductSchema } from '../models/product.schema';

const router = Router();

// Product routes
router.post('/products', writeLimiter, validate(createProductSchema), createProduct);
router.get('/products', getProducts);
router.get('/products/:sku', getProduct);

// Batch routes (by product SKU — preferred)
router.post('/products/:sku/batches', writeLimiter, validate(createBatchForProductSchema), createBatchForProduct);
router.get('/products/:sku/batches', getBatchesForProduct);
router.get('/batches/:batchNumber', getBatchByNumber);

export default router;

