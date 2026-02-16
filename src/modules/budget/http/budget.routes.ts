import { Router } from 'express';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { adaptExpress } from '../../../shared/http/Controller';
import { BudgetMySqlRepository } from '../infra/BudgetMySqlRepository';
import { BudgetService } from '../application/BudgetService';
import { BudgetVehiclePartMySqlRepository } from '../../budget-vehicle-part/infra/BudgetVehiclePartMySqlRepository';
import { BudgetVehiclePartService } from '../../budget-vehicle-part/application/BudgetVehiclePartService';
import { BudgetVehicleServiceMySqlRepository } from '../../budget-vehicle-service/infra/BudgetVehicleServiceMySqlRepository';
import { BudgetVehicleServiceService } from '../../budget-vehicle-service/application/BudgetVehicleServiceService';
import { VehiclePartMySqlRepository } from '../../vehicle-part/infra/VehiclePartMySqlRepository';
import { VehiclePartService } from '../../vehicle-part/application/VehiclePartService';
import { VehicleServiceMySqlRepository } from '../../vehicle-service/infra/VehicleServiceMySqlRepository';
import { VehicleServiceService } from '../../vehicle-service/application/VehicleServiceService';
import { CreateBudgetController } from './controllers/CreateBudgetController';
import { FindBudgetController } from './controllers/FindBudgetController';
import { requireRole } from '../../../modules/auth/RoleMiddleware';
import { SqsPublisher } from '../../../infra/messaging/SqsPublisher';

const budgetRepo = new BudgetMySqlRepository();

const vehiclePartRepo = new VehiclePartMySqlRepository();
const vehiclePartService = new VehiclePartService(vehiclePartRepo);

const budgetVehiclePartRepo = new BudgetVehiclePartMySqlRepository();
const budgetVehiclePartService = new BudgetVehiclePartService(budgetVehiclePartRepo);

const vehicleServiceRepo = new VehicleServiceMySqlRepository();
const vehicleServiceService = new VehicleServiceService(vehicleServiceRepo);

const budgetVehicleServiceRepo = new BudgetVehicleServiceMySqlRepository();
const budgetVehicleServiceService = new BudgetVehicleServiceService(budgetVehicleServiceRepo);

const sqsPublisher = process.env.SQS_QUEUE_URL
  ? new SqsPublisher(process.env.SQS_QUEUE_URL)
  : undefined;

const budgetService = new BudgetService(
  budgetRepo,
  vehiclePartService,
  budgetVehiclePartService,
  vehicleServiceService,
  budgetVehicleServiceService,
  sqsPublisher,
);

export const budgetRouter = Router();

budgetRouter.post('/', authMiddleware, requireRole('admin'), adaptExpress(new CreateBudgetController(budgetService)));
budgetRouter.get('/:id', authMiddleware, adaptExpress(new FindBudgetController(budgetService)));
