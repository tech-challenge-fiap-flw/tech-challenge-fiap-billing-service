
import { NotFoundServerException } from '../../../shared/application/ServerException';
import { PaymentEntity, PaymentStatus } from '../domain/Payment';
import { IPaymentRepository } from '../domain/IPaymentRepository';
import { SqsPublisher } from '../../../infra/messaging/SqsPublisher';
import { EventTypes } from '../../../shared/events/EventTypes';
import { logger } from '../../../utils/logger';

import { MercadoPagoConfig, Payment } from 'mercadopago';

export type CreatePaymentInput = {
  budgetId: number;
  amount: number;
  method?: string;
  payerEmail?: string;
};

export type PaymentOutput = ReturnType<PaymentEntity['toJSON']>;

export interface IPaymentService {
  createPayment(input: CreatePaymentInput): Promise<PaymentOutput>;
  findById(id: number): Promise<PaymentOutput>;
  findByBudgetId(budgetId: number): Promise<PaymentOutput>;
  processWebhook(externalId: string, status: string): Promise<PaymentOutput>;
  confirmPayment(id: number): Promise<PaymentOutput>;
  rejectPayment(id: number): Promise<PaymentOutput>;
}

export class PaymentService implements IPaymentService {
  private mpConfig: MercadoPagoConfig;
  private mpPayment: Payment;

  constructor(
    private readonly repo: IPaymentRepository,
    private readonly sqsPublisher: SqsPublisher,
  ) {
    this.mpConfig = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });
    this.mpPayment = new Payment(this.mpConfig);
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentOutput> {
    const existing = await this.repo.findByBudgetId(input.budgetId);
    if (existing && existing.status === 'pending') {
      return existing.toJSON();
    }

    let mpResult;
    try {
      mpResult = await this.mpPayment.create({
        body: {
          transaction_amount: input.amount,
          payment_method_id: input.method || 'pix',
          payer: {
            email: input.payerEmail || 'comprador@email.com',
          },
          description: `Pagamento orçamento #${input.budgetId}`,
          notification_url: process.env.MERCADOPAGO_WEBHOOK_URL || '',
        }
      });
    } catch (err) {
      logger.error({ err }, 'Erro ao criar pagamento no MercadoPago');
      throw new Error('Erro ao criar pagamento no MercadoPago');
    }

    const externalId = mpResult && mpResult.id ? String(mpResult.id) : undefined;

    const entity = PaymentEntity.create({
      budgetId: input.budgetId,
      amount: input.amount,
      method: input.method,
      payerEmail: input.payerEmail,
      externalId,
    });

    const created = await this.repo.create(entity);

    logger.info({ paymentId: created.id, mpId: externalId }, `Payment created for budget ${input.budgetId}`);

    return created.toJSON();
  }

  async findById(id: number): Promise<PaymentOutput> {
    const found = await this.repo.findById(id);

    if (!found) {
      throw new NotFoundServerException('Payment not found');
    }

    return found.toJSON();
  }

  async findByBudgetId(budgetId: number): Promise<PaymentOutput> {
    const found = await this.repo.findByBudgetId(budgetId);

    if (!found) {
      throw new NotFoundServerException('Payment not found for this budget');
    }

    return found.toJSON();
  }

  async processWebhook(externalId: string, status: string): Promise<PaymentOutput> {
    const payment = await this.repo.findByExternalId(externalId);

    if (!payment) {
      throw new NotFoundServerException('Payment not found for external ID');
    }

    const mappedStatus = this.mapExternalStatus(status);

    const updated = await this.repo.updateStatus(payment.id, mappedStatus);

    if (!updated) {
      throw new NotFoundServerException('Payment not found after update');
    }

    if (mappedStatus === 'approved') {
      await this.publishPaymentConfirmed(updated);
    } else if (mappedStatus === 'rejected') {
      await this.publishPaymentFailed(updated);
    }

    logger.info(`Payment ${payment.id} status updated to ${mappedStatus} via webhook`);

    return updated.toJSON();
  }

  async confirmPayment(id: number): Promise<PaymentOutput> {
    const payment = await this.repo.findById(id);

    if (!payment) {
      throw new NotFoundServerException('Payment not found');
    }

    const updated = await this.repo.updateStatus(id, 'approved');

    if (!updated) {
      throw new NotFoundServerException('Payment not found after update');
    }

    await this.publishPaymentConfirmed(updated);

    logger.info(`Payment ${id} confirmed manually`);

    return updated.toJSON();
  }

  async rejectPayment(id: number): Promise<PaymentOutput> {
    const payment = await this.repo.findById(id);

    if (!payment) {
      throw new NotFoundServerException('Payment not found');
    }

    const updated = await this.repo.updateStatus(id, 'rejected');

    if (!updated) {
      throw new NotFoundServerException('Payment not found after update');
    }

    await this.publishPaymentFailed(updated);

    logger.info(`Payment ${id} rejected`);

    return updated.toJSON();
  }

  private mapExternalStatus(externalStatus: string): PaymentStatus {
    const map: Record<string, PaymentStatus> = {
      approved: 'approved',
      rejected: 'rejected',
      cancelled: 'cancelled',
      refunded: 'refunded',
      in_process: 'pending',
      pending: 'pending',
    };

    return map[externalStatus] || 'pending';
  }

  private async publishPaymentConfirmed(payment: PaymentEntity): Promise<void> {
    try {
      await this.sqsPublisher.publish({
        eventType: EventTypes.PAYMENT_CONFIRMED,
        correlationId: String(payment.id),
        payload: {
          paymentId: payment.id,
          budgetId: payment.budgetId,
          status: 'approved',
          confirmedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to publish PAYMENT_CONFIRMED event');
    }
  }

  private async publishPaymentFailed(payment: PaymentEntity): Promise<void> {
    try {
      await this.sqsPublisher.publish({
        eventType: EventTypes.PAYMENT_FAILED,
        correlationId: String(payment.id),
        payload: {
          paymentId: payment.id,
          budgetId: payment.budgetId,
          status: payment.status,
          failedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to publish PAYMENT_FAILED event');
    }
  }
}
