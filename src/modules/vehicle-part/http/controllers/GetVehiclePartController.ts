import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { notFound } from '../../../../shared/http/HttpError';
import { IVehiclePartService } from '../../application/VehiclePartService';

export class GetVehiclePartController implements IController {
  constructor(private readonly service: IVehiclePartService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);
    const found = await this.service.findById(id);

    if (!found) {
      throw notFound('Vehicle part not found');
    }

    return {
      status: 200,
      body: found
    };
  }
}
