import { z } from 'zod';

export const createPaymentSchema = z.object({
  budgetId: z.number().int(),
  amount: z.number().positive(),
  method: z.string().optional(),
  payerEmail: z.string().email().optional(),
});

export const webhookSchema = z.object({
  externalId: z.string(),
  status: z.string(),
});

export const confirmPaymentSchema = z.object({
  id: z.number().int(),
});
