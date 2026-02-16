import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { BudgetVehiclePartMySqlRepository } from '../infra/BudgetVehiclePartMySqlRepository';
import { BudgetVehiclePartService } from '../application/BudgetVehiclePartService';
import { CreateBudgetVehiclePartController } from './controllers/CreateBudgetVehiclePartController';
import { requireRole } from '../../../modules/auth/RoleMiddleware';

const repo = new BudgetVehiclePartMySqlRepository();
const service = new BudgetVehiclePartService(repo);
export const budgetVehiclePartRouter = Router();

budgetVehiclePartRouter.post('/', authMiddleware, requireRole('admin'), adaptExpress(new CreateBudgetVehiclePartController(service)));
