import { z } from 'zod';

export const createVehicleServiceSchema = z.object({
  budgetId: z.number(),
  vehicleServiceId: z.number(),
  price: z.number().positive().optional()
});

export const updateVehicleServiceSchema = createVehicleServiceSchema.partial();
