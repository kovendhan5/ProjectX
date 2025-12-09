import { Router } from 'express';
import { createBatch, createProduct, getProducts } from '../controllers/product.controller';
import validate from '../middleware/validateResource';
import { createBatchSchema, createProductSchema } from '../models/product.schema';

const router = Router();

router.post('/products', validate(createProductSchema), createProduct);
router.get('/products', getProducts);
router.post('/batches', validate(createBatchSchema), createBatch);

export default router;
