import { z } from 'zod';

export const createVehiclePartSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(10),
  quantity: z.number(),
  price: z.number(),
});

export const updateVehiclePartSchema = createVehiclePartSchema.partial();

export type CreateVehiclePartInput = z.infer<typeof createVehiclePartSchema>;
export type UpdateVehiclePartInput = z.infer<typeof updateVehiclePartSchema>;
