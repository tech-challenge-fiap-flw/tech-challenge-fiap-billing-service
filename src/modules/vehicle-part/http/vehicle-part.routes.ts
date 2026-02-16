import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { VehiclePartMySqlRepository } from '../infra/VehiclePartMySqlRepository';
import { VehiclePartService } from '../application/VehiclePartService';
import { CreateVehiclePartController } from './controllers/CreateVehiclePartController';
import { GetVehiclePartController } from './controllers/GetVehiclePartController';
import { UpdateVehiclePartController } from './controllers/UpdateVehiclePartController';
import { DeleteVehiclePartController } from './controllers/DeleteVehiclePartController';
import { ListVehiclePartsController } from './controllers/ListVehiclePartsController';
import { requireRole } from '../../../modules/auth/RoleMiddleware';

const repository = new VehiclePartMySqlRepository();
const service = new VehiclePartService(repository);

export const vehiclePartRouter = Router();

vehiclePartRouter.post('/', authMiddleware, requireRole('admin'), adaptExpress(new CreateVehiclePartController(service)));
vehiclePartRouter.get('/:id', authMiddleware, requireRole('admin'), adaptExpress(new GetVehiclePartController(service)));
vehiclePartRouter.put('/:id', authMiddleware, requireRole('admin'), adaptExpress(new UpdateVehiclePartController(service)));
vehiclePartRouter.delete('/:id', authMiddleware, requireRole('admin'), adaptExpress(new DeleteVehiclePartController(service)));
vehiclePartRouter.get('/', authMiddleware, requireRole('admin'), adaptExpress(new ListVehiclePartsController(service)));
