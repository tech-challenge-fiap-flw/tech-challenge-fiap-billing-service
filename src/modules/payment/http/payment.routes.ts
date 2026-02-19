import { Router } from 'express';
import { adaptExpress } from '../../../shared/http/Controller';
import { PaymentMySqlRepository } from '../infra/PaymentMySqlRepository';
import { PaymentService } from '../application/PaymentService';
import { SqsPublisher } from '../../../infra/messaging/SqsPublisher';
import { CreatePaymentController } from './controllers/CreatePaymentController';
import { GetPaymentController } from './controllers/GetPaymentController';
import { GetPaymentByBudgetController } from './controllers/GetPaymentByBudgetController';
import { ConfirmPaymentController } from './controllers/ConfirmPaymentController';
import { RejectPaymentController } from './controllers/RejectPaymentController';
import { PaymentWebhookController } from './controllers/PaymentWebhookController';
import { authMiddleware } from '../../auth/AuthMiddleware';
import { requireRole } from '../../auth/RoleMiddleware';

const repository = new PaymentMySqlRepository();
const sqsPublisher = process.env.SQS_QUEUE_URL
  ? new SqsPublisher(process.env.SQS_QUEUE_URL)
  : undefined;

const service = new PaymentService(repository, sqsPublisher);

export const paymentRouter = Router();

paymentRouter.post('/', authMiddleware, requireRole('admin'), adaptExpress(new CreatePaymentController(service)));
paymentRouter.get('/:id', authMiddleware, adaptExpress(new GetPaymentController(service)));
paymentRouter.get('/budget/:budgetId', authMiddleware, adaptExpress(new GetPaymentByBudgetController(service)));
paymentRouter.post('/:id/confirm', authMiddleware, requireRole('admin'), adaptExpress(new ConfirmPaymentController(service)));
paymentRouter.post('/:id/reject', authMiddleware, requireRole('admin'), adaptExpress(new RejectPaymentController(service)));
paymentRouter.post('/webhook', adaptExpress(new PaymentWebhookController(service)));
