import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    customerName: z.string().optional(),
    items: z
      .array(
        z.object({
          batchId: z.string(),
          quantity: z.number().int().positive(),
          price: z.number().positive(),
        })
      )
      .min(1, 'Invoice must contain at least one item'),
  }),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>['body'];
