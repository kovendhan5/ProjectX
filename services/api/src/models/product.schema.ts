import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(3),
    name: z.string().min(2),
    description: z.string().optional(),
    manufacturer: z.string().min(2),
  }),
});

export const createBatchSchema = z.object({
  body: z.object({
    batchNumber: z.string().min(3),
    productId: z.string().uuid(),
    manufactureDate: z.string().datetime(),
    expiryDate: z.string().datetime(),
    quantity: z.number().int().positive(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type CreateBatchInput = z.infer<typeof createBatchSchema>['body'];
