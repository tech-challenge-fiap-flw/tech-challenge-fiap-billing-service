import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { badRequest } from '../../../../shared/http/HttpError';
import { IVehicleServiceService } from '../../application/VehicleServiceService';
import { createVehicleServiceSchema } from './schemas';

export class CreateVehicleServiceController implements IController {
  constructor(private readonly service: IVehicleServiceService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const parsed = createVehicleServiceSchema.safeParse(req.body);

    if (!parsed.success) {
      throw badRequest('Validation failed', parsed.error.format());
    }

    const created = await this.service.createVehicleService(parsed.data);

    return { status: 201, body: created };
  }
}
