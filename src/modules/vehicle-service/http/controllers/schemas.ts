import { z } from 'zod';

export const createVehicleServiceSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().nullable(),
});

export const updateVehicleServiceSchema = createVehicleServiceSchema.partial();

export type CreateVehicleServiceInput = z.infer<typeof createVehicleServiceSchema>;
export type UpdateVehicleServiceInput = z.infer<typeof updateVehicleServiceSchema>;
