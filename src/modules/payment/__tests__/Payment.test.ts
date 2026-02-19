import { PaymentEntity } from '../domain/Payment';

describe('PaymentEntity', () => {
  describe('create', () => {
    it('should create with default status pending', () => {
      const payment = PaymentEntity.create({
        budgetId: 1,
        amount: 500,
      });

      const json = payment.toJSON();
      expect(json.id).toBe(0);
      expect(json.budgetId).toBe(1);
      expect(json.amount).toBe(500);
      expect(json.status).toBe('pending');
      expect(json.externalId).toBeNull();
      expect(json.method).toBeNull();
      expect(json.payerEmail).toBeNull();
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });

    it('should create with provided optional fields', () => {
      const payment = PaymentEntity.create({
        budgetId: 2,
        amount: 1000,
        externalId: 'ext-123',
        method: 'pix',
        payerEmail: 'test@email.com',
        status: 'approved',
      });

      const json = payment.toJSON();
      expect(json.externalId).toBe('ext-123');
      expect(json.method).toBe('pix');
      expect(json.payerEmail).toBe('test@email.com');
      expect(json.status).toBe('approved');
    });
  });

  describe('restore', () => {
    it('should restore from full props', () => {
      const now = new Date();
      const payment = PaymentEntity.restore({
        id: 10,
        budgetId: 3,
        externalId: 'ext-456',
        amount: 750,
        status: 'pending',
        method: 'credit_card',
        payerEmail: 'user@test.com',
        createdAt: now,
        updatedAt: now,
      });

      expect(payment.id).toBe(10);
      expect(payment.budgetId).toBe(3);
      expect(payment.status).toBe('pending');
    });
  });

  describe('approve', () => {
    it('should change status to approved', () => {
      const payment = PaymentEntity.create({
        budgetId: 1,
        amount: 100,
      });

      payment.approve();
      expect(payment.status).toBe('approved');
    });
  });

  describe('reject', () => {
    it('should change status to rejected', () => {
      const payment = PaymentEntity.create({
        budgetId: 1,
        amount: 100,
      });

      payment.reject();
      expect(payment.status).toBe('rejected');
    });
  });

  describe('cancel', () => {
    it('should change status to cancelled', () => {
      const payment = PaymentEntity.create({
        budgetId: 1,
        amount: 100,
      });

      payment.cancel();
      expect(payment.status).toBe('cancelled');
    });
  });

  describe('refund', () => {
    it('should change status to refunded', () => {
      const payment = PaymentEntity.create({
        budgetId: 1,
        amount: 100,
      });

      payment.refund();
      expect(payment.status).toBe('refunded');
    });
  });

  describe('toJSON', () => {
    it('should return a copy', () => {
      const payment = PaymentEntity.create({
        budgetId: 1,
        amount: 100,
      });

      const a = payment.toJSON();
      const b = payment.toJSON();
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });
});
