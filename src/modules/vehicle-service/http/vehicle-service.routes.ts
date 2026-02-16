import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { VehicleServiceMySqlRepository } from '../infra/VehicleServiceMySqlRepository';
import { VehicleServiceService } from '../application/VehicleServiceService';
import { CreateVehicleServiceController } from './controllers/CreateVehicleServiceController';
import { GetVehicleServiceController } from './controllers/GetVehicleServiceController';
import { UpdateVehicleServiceController } from './controllers/UpdateVehicleServiceController';
import { DeleteVehicleServiceController } from './controllers/DeleteVehicleServiceController';
import { ListVehicleServicesController } from './controllers/ListVehicleServicesController';
import { requireRole } from '../../../modules/auth/RoleMiddleware';

const repo = new VehicleServiceMySqlRepository();
const service = new VehicleServiceService(repo);

export const vehicleServiceRouter = Router();

vehicleServiceRouter.post('/', authMiddleware, requireRole('admin'), adaptExpress(new CreateVehicleServiceController(service)));
vehicleServiceRouter.get('/:id', authMiddleware, adaptExpress(new GetVehicleServiceController(service)));
vehicleServiceRouter.put('/:id', authMiddleware, requireRole('admin'), adaptExpress(new UpdateVehicleServiceController(service)));
vehicleServiceRouter.delete('/:id', authMiddleware, requireRole('admin'), adaptExpress(new DeleteVehicleServiceController(service)));
vehicleServiceRouter.get('/', authMiddleware, adaptExpress(new ListVehicleServicesController(service)));
