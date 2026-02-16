import { IController, HttpRequest, HttpResponse } from '../../../../shared/http/Controller'
import { IVehicleServiceService } from '../../application/VehicleServiceService'

export class DeleteVehicleServiceController implements IController {
  constructor(private readonly service: IVehicleServiceService) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const id = Number(req.params.id)

    await this.service.deleteVehicleService(id)

    return {
      status: 204
    }
  }
}
