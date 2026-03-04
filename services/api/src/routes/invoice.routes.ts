import { Router } from 'express';
import { createInvoice, getInvoiceById, getInvoices } from '../controllers/invoice.controller';
import { writeLimiter } from '../middleware/rateLimiter';
import validate from '../middleware/validateResource';
import { createInvoiceSchema } from '../models/invoice.schema';

const router = Router();

router.post('/invoices', writeLimiter, validate(createInvoiceSchema), createInvoice);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);

export default router;

