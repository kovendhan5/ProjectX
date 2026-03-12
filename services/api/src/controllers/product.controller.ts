import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import prisma from '../config/db';
import logger from '../config/logger';
import { CreateBatchForProductInput, CreateProductInput } from '../models/product.schema';
import { recordTransaction } from '../services/blockchain.service';

export const createProduct = async (req: Request<{}, {}, CreateProductInput>, res: Response) => {
  try {
    const { sku, name, description, manufacturer } = req.body;

    if (!sku || !name || !manufacturer) {
      return res.status(400).json({ error: 'sku, name, and manufacturer are required' });
    }

    const existingProduct = await prisma.product.findUnique({ where: { sku } });
    if (existingProduct) {
      return res.status(409).json({ error: 'Product with this SKU already exists' });
    }

    const blockchainTxId = randomUUID();
    const product = await prisma.product.create({
      data: { sku, name, description, manufacturer, blockchainTxId },
    });

    // Non-blocking blockchain anchor
    recordTransaction({
      type: 'PRODUCT_REGISTRATION',
      txId: blockchainTxId,
      productId: product.id,
      sku: product.sku,
      manufacturer: product.manufacturer,
      timestamp: new Date().toISOString(),
    });

    return res.status(201).json(product);
  } catch (error) {
    logger.error({ error }, 'Error creating product');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { batches: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(products);
  } catch (error) {
    logger.error({ error }, 'Error fetching products');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const product = await prisma.product.findUnique({
      where: { sku },
      include: { batches: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error) {
    logger.error({ error }, 'Error fetching product');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

/** POST /api/v1/products/:sku/batches */
export const createBatchForProduct = async (
  req: Request<{ sku: string }, {}, CreateBatchForProductInput>,
  res: Response
) => {
  try {
    const { sku } = req.params;
    const { batchNumber, manufactureDate, expiryDate, quantity } = req.body;

    const product = await prisma.product.findUnique({ where: { sku } });
    if (!product) {
      return res.status(404).json({ error: `Product with SKU '${sku}' not found` });
    }

    const existingBatch = await prisma.batch.findUnique({ where: { batchNumber } });
    if (existingBatch) {
      return res.status(409).json({ error: 'Batch number already exists' });
    }

    const blockchainTxId = randomUUID();
    const batch = await prisma.batch.create({
      data: {
        batchNumber,
        productId: product.id,
        manufactureDate: manufactureDate ? new Date(manufactureDate) : new Date(),
        expiryDate: new Date(expiryDate),
        quantity,
        blockchainTxId,
      },
    });

    // Non-blocking blockchain anchor
    recordTransaction({
      type: 'BATCH_CREATION',
      txId: blockchainTxId,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      productId: batch.productId,
      productSku: sku,
      quantity: batch.quantity,
      expiryDate: batch.expiryDate,
      timestamp: new Date().toISOString(),
    });

    return res.status(201).json(batch);
  } catch (error) {
    logger.error({ error }, 'Error creating batch');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

/** GET /api/v1/products/:sku/batches */
export const getBatchesForProduct = async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const product = await prisma.product.findUnique({ where: { sku } });
    if (!product) {
      return res.status(404).json({ error: `Product with SKU '${sku}' not found` });
    }

    const batches = await prisma.batch.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(batches);
  } catch (error) {
    logger.error({ error }, 'Error fetching batches');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

/** GET /api/v1/batches/:batchNumber */
export const getBatchByNumber = async (req: Request, res: Response) => {
  try {
    const { batchNumber } = req.params;
    const batch = await prisma.batch.findUnique({
      where: { batchNumber },
      include: { product: true },
    });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    return res.status(200).json(batch);
  } catch (error) {
    logger.error({ error }, 'Error fetching batch');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
