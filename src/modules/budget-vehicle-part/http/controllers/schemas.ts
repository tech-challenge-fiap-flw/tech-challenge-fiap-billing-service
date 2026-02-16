import { z } from 'zod'

export const createSchema = z.object({
  budgetId: z.number().int(),
  parts: z.array(
    z.object({
      vehiclePartId: z.number().int(),
      quantity: z.number().int().min(1)
    })
  ).min(1)
})

export const updateSchema = createSchema.partial();
