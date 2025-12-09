import { Request, Response } from 'express';
import prisma from '../config/db';
import { CreateBatchInput, CreateProductInput } from '../models/product.schema';

export const createProduct = async (req: Request<{}, {}, CreateProductInput>, res: Response) => {
  try {
    const { sku, name, description, manufacturer } = req.body;
    
    const existingProduct = await prisma.product.findUnique({ where: { sku } });
    if (existingProduct) {
      return res.status(409).json({ error: 'Product with this SKU already exists' });
    }

    const product = await prisma.product.create({
      data: { sku, name, description, manufacturer },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { batches: true },
    });
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createBatch = async (req: Request<{}, {}, CreateBatchInput>, res: Response) => {
  try {
    const { batchNumber, productId, manufactureDate, expiryDate, quantity } = req.body;

    const existingBatch = await prisma.batch.findUnique({ where: { batchNumber } });
    if (existingBatch) {
      return res.status(409).json({ error: 'Batch with this number already exists' });
    }

    const batch = await prisma.batch.create({
      data: {
        batchNumber,
        productId,
        manufactureDate: new Date(manufactureDate),
        expiryDate: new Date(expiryDate),
        quantity,
      },
    });

    return res.status(201).json(batch);
  } catch (error) {
    console.error('Error creating batch:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
