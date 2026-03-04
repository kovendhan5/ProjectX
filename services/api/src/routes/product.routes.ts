import { Router } from 'express';
import { createBatch, createProduct, getProduct, getProducts } from '../controllers/product.controller';
import { writeLimiter } from '../middleware/rateLimiter';
import validate from '../middleware/validateResource';
import { createBatchSchema, createProductSchema } from '../models/product.schema';

const router = Router();

router.post('/products', writeLimiter, validate(createProductSchema), createProduct);
router.get('/products', getProducts);
router.get('/products/:sku', getProduct);
router.post('/batches', writeLimiter, validate(createBatchSchema), createBatch);

export default router;

