import { z } from 'zod';

/** Accepts any parseable date string: '2026-12-31' or ISO datetime */
const flexibleDate = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' });

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(3),
    name: z.string().min(2),
    description: z.string().optional(),
    manufacturer: z.string().min(2),
  }),
});

/** Legacy: create batch by productId in body */
export const createBatchSchema = z.object({
  body: z.object({
    batchNumber: z.string().min(3),
    productId: z.string().uuid(),
    manufactureDate: flexibleDate.optional(),
    expiryDate: flexibleDate,
    quantity: z.number().int().positive(),
  }),
});

/** Preferred: create batch for a product identified by URL :sku param */
export const createBatchForProductSchema = z.object({
  params: z.object({
    sku: z.string().min(1),
  }),
  body: z.object({
    batchNumber: z.string().min(3),
    manufactureDate: flexibleDate.optional(),
    expiryDate: flexibleDate,
    quantity: z.number().int().positive(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type CreateBatchInput = z.infer<typeof createBatchSchema>['body'];
export type CreateBatchForProductInput = z.infer<typeof createBatchForProductSchema>['body'];
