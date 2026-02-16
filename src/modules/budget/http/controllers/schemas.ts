import { z } from 'zod';

export const createSchema = z.object({
  description: z.string().min(5),
  ownerId: z.number().int(),
  diagnosisId: z.number().int(),
  vehicleParts: z.array(
    z.object({
      vehiclePartId: z.number().int(),
      quantity: z.number().int().min(1)
    })
  ),
  vehicleServicesIds: z.array(z.number().int()).optional()
})

export const decideBudgetSchema = z.object({
  accept: z.boolean()
});
