import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller';
import { IVehiclePartService } from '../../application/VehiclePartService';

export class DeleteVehiclePartController implements IController {
  constructor(private readonly service: IVehiclePartService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id);

    await this.service.deleteVehiclePart(id);

    return {
      status: 204
    };
  }
}
