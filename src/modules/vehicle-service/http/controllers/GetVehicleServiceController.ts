import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { notFound } from '../../../../shared/http/HttpError';
import { IVehicleServiceService } from '../../application/VehicleServiceService';

export class GetVehicleServiceController implements IController {
  constructor(private readonly service: IVehicleServiceService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    const found = await this.service.findById(id);

    if (!found) {
      throw notFound('Vehicle service not found');
    }

    return {
      status: 200,
      body: found
    };
  }
}
