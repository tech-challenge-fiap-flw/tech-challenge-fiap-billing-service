import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IVehiclePartService } from '../../application/VehiclePartService';
import { updateVehiclePartSchema } from './schemas';

export class UpdateVehiclePartController implements IController {
  constructor(private readonly service: IVehiclePartService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const parsed = updateVehiclePartSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const updated = await this.service.updateVehiclePart(id, parsed.data as any);

    return {
      status: 200,
      body: updated
    };
  }
}
