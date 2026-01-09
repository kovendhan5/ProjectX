/**
 * Validation schemas using Zod for request validation
 */

import { z } from 'zod';

// Product schemas
export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1).max(50),
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    manufacturer: z.string().min(1).max(200),
    category: z.string().min(1).max(100),
    unitPrice: z.number().positive(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    manufacturer: z.string().min(1).max(200).optional(),
    category: z.string().min(1).max(100).optional(),
    unitPrice: z.number().positive().optional(),
  }),
  params: z.object({
    sku: z.string(),
  }),
});

// Batch schemas
export const createBatchSchema = z.object({
  body: z.object({
    batchNumber: z.string().min(1).max(100),
    quantity: z.number().int().positive(),
    manufacturingDate: z.string().datetime().or(z.date()),
    expiryDate: z.string().datetime().or(z.date()),
  }),
  params: z.object({
    sku: z.string(),
  }),
}).refine(
  (data) => {
    const mfgDate = new Date(data.body.manufacturingDate);
    const expDate = new Date(data.body.expiryDate);
    return expDate > mfgDate;
  },
  {
    message: 'Expiry date must be after manufacturing date',
    path: ['body', 'expiryDate'],
  }
);

// Invoice schemas
export const createInvoiceSchema = z.object({
  body: z.object({
    customerEmail: z.string().email(),
    items: z
      .array(
        z.object({
          batchNumber: z.string().min(1),
          quantity: z.number().int().positive(),
        })
      )
      .min(1, 'Invoice must contain at least one item'),
  }),
});

// Generic pagination schema
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
