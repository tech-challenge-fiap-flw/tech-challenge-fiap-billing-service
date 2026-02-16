import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IVehiclePartService } from '../../application/VehiclePartService';
import { createVehiclePartSchema } from './schemas';

export class CreateVehiclePartController implements IController {
  constructor(private readonly service: IVehiclePartService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createVehiclePartSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const created = await this.service.createVehiclePart(parsed.data as any);

    return {
      status: 201,
      body: created
    };
  }
}
