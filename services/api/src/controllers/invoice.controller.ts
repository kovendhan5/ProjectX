import { Request, Response } from 'express';
import prisma from '../config/db';
import { CreateInvoiceInput } from '../models/invoice.schema';
import { recordTransaction } from '../services/blockchain.service';

export const createInvoice = async (req: Request<{}, {}, CreateInvoiceInput>, res: Response) => {
  try {
    const { customerName, items } = req.body;

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const invoiceNumber = `INV-${Date.now()}`; // Simple ID generation

    // Database Transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Verify and Update Batches
      for (const item of items) {
        const batch = await tx.batch.findUnique({ where: { id: item.batchId } });

        if (!batch) {
          throw new Error(`Batch ${item.batchId} not found`);
        }

        if (batch.quantity < item.quantity) {
          throw new Error(`Insufficient quantity for batch ${batch.batchNumber}`);
        }

        await tx.batch.update({
          where: { id: item.batchId },
          data: { quantity: batch.quantity - item.quantity },
        });
      }

      // 2. Create Invoice
      return tx.invoice.create({
        data: {
          invoiceNumber,
          customerName,
          totalAmount,
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

    // 3. Anchor to Blockchain
    await recordTransaction({
      type: 'INVOICE_GENERATION',
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      items: invoice.items.map((i) => ({ batchId: i.batchId, qty: i.quantity })),
      timestamp: new Date().toISOString(),
    });

    return res.status(201).json(invoice);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    if (error.message.includes('Insufficient') || error.message.includes('not found')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
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

    return res.json(invoices);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            batch: true,
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json(invoice);
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
