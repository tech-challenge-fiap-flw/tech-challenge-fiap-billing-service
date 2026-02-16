import 'dotenv/config';
import express from 'express';
import { budgetRouter } from './modules/budget/http/budget.routes';
import { vehiclePartRouter } from './modules/vehicle-part/http/vehicle-part.routes';
import { vehicleServiceRouter } from './modules/vehicle-service/http/vehicle-service.routes';
import { budgetVehiclePartRouter } from './modules/budget-vehicle-part/http/budget-vehicle-part.routes';
import { budgetVehicleServiceRouter } from './modules/budget-vehicle-service/http/budget-vehicle-service.routes';
import { paymentRouter } from './modules/payment/http/payment.routes';
import { authRouter } from './modules/auth/auth.routes';
import { BillingEventConsumer } from './infra/messaging/BillingEventConsumer';
import { logger } from './utils/logger';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'billing-service' });
});

app.use('/auth', authRouter);
app.use('/budgets', budgetRouter);
app.use('/vehicle-parts', vehiclePartRouter);
app.use('/vehicle-services', vehicleServiceRouter);
app.use('/budget-vehicle-parts', budgetVehiclePartRouter);
app.use('/budget-vehicle-services', budgetVehicleServiceRouter);
app.use('/payments', paymentRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    details: err.details || undefined,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`Billing Service running on port ${PORT}`);

  if (process.env.SQS_QUEUE_URL) {
    const consumer = new BillingEventConsumer(process.env.SQS_QUEUE_URL);
    consumer.start();
    logger.info('SQS consumer started');
  }
});

export default app;
