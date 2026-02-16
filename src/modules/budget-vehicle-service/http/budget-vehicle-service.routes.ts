import { Router } from 'express';
import { adaptExpress } from '../../../shared/http/Controller';
import { BudgetVehicleServiceMySqlRepository } from '../infra/BudgetVehicleServiceMySqlRepository';
import { BudgetVehicleServiceService } from '../application/BudgetVehicleServiceService';
import { CreateBudgetVehicleServiceController } from './controllers/CreateBudgetVehicleServiceController';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { UpdateBudgetVehicleServiceController } from './controllers/UpdateBudgetVehicleServiceController';
import { GetBudgetVehicleServiceController } from './controllers/GetBudgetVehicleServiceController';
import { DeleteBudgetVehicleServiceController } from './controllers/DeleteBudgetVehicleServiceController';
import { requireRole } from '../../auth/RoleMiddleware';

const repository = new BudgetVehicleServiceMySqlRepository();
const service = new BudgetVehicleServiceService(repository);

export const budgetVehicleServiceRouter = Router();

budgetVehicleServiceRouter.post('/', authMiddleware, requireRole('admin'), adaptExpress(new CreateBudgetVehicleServiceController(service)));
budgetVehicleServiceRouter.put('/:id', authMiddleware, requireRole('admin'), adaptExpress(new UpdateBudgetVehicleServiceController(service)));
budgetVehicleServiceRouter.delete('/:id', authMiddleware, requireRole('admin'), adaptExpress(new DeleteBudgetVehicleServiceController(service)));
budgetVehicleServiceRouter.get('/:id', authMiddleware, requireRole('admin'), adaptExpress(new GetBudgetVehicleServiceController(service)));
