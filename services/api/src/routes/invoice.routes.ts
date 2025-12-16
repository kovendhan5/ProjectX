import { Router } from 'express';
import { createInvoice } from '../controllers/invoice.controller';
import validate from '../middleware/validateResource';
import { createInvoiceSchema } from '../models/invoice.schema';

const router = Router();

router.post('/invoices', validate(createInvoiceSchema), createInvoice);

export default router;
