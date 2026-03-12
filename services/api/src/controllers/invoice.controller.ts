import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import prisma from '../config/db';
import logger from '../config/logger';
import { CreateInvoiceInput } from '../models/invoice.schema';
import { recordTransaction } from '../services/blockchain.service';

export const createInvoice = async (req: Request<{}, {}, CreateInvoiceInput>, res: Response) => {
  try {
    const { customerName, items } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const invoiceNumber = `INV-${Date.now()}`;
    const blockchainTxId = randomUUID();

    const invoice = await prisma.$transaction(async (tx: any) => {
      for (const item of items) {
        const batch = await tx.batch.findUnique({ where: { id: item.batchId } });
        if (!batch) throw new Error(`Batch ${item.batchId} not found`);
        if (batch.quantity < item.quantity)
          throw new Error(`Insufficient quantity for batch ${batch.batchNumber}`);
        await tx.batch.update({
          where: { id: item.batchId },
          data: { quantity: batch.quantity - item.quantity },
        });
      }
      return tx.invoice.create({
        data: {
          invoiceNumber,
          customerName,
          totalAmount,
          blockchainTxId,
          items: {
            create: items.map((item) => ({
              batchId: item.batchId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });
    });

    recordTransaction({
      type: 'INVOICE_GENERATION',
      txId: blockchainTxId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      items: invoice.items.map((i: any) => ({ batchId: i.batchId, qty: i.quantity })),
      timestamp: new Date().toISOString(),
    });

    return res.status(201).json(invoice);
  } catch (error: any) {
    logger.error({ error }, 'Error creating invoice');
    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message?.includes('Insufficient')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getInvoices = async (_req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { items: { include: { batch: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(invoices);
  } catch (error: any) {
    logger.error({ error }, 'Error fetching invoices');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Invalid invoice ID' });

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: { include: { batch: true } } },
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    return res.json(invoice);
  } catch (error: any) {
    logger.error({ error }, 'Error fetching invoice');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
