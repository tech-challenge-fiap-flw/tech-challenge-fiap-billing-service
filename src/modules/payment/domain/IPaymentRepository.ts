import { PaymentEntity, PaymentId, PaymentStatus } from './Payment';

export interface IPaymentRepository {
  create(payment: PaymentEntity): Promise<PaymentEntity>;
  findById(id: PaymentId): Promise<PaymentEntity | null>;
  findByBudgetId(budgetId: number): Promise<PaymentEntity | null>;
  findByExternalId(externalId: string): Promise<PaymentEntity | null>;
  updateStatus(id: PaymentId, status: PaymentStatus): Promise<PaymentEntity | null>;
}
