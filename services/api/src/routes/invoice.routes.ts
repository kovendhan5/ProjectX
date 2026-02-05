import { Router } from 'express';
import { createInvoice, getInvoices, getInvoiceById } from '../controllers/invoice.controller';
import validate from '../middleware/validateResource';
import { createInvoiceSchema } from '../models/invoice.schema';

const router = Router();

router.post('/invoices', validate(createInvoiceSchema), createInvoice);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoiceById);

export default router;
