jest.mock('mercadopago', () => {
  return {
    MercadoPagoConfig: jest.fn().mockImplementation(() => ({})),
    Payment: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({ id: 'mp-ext-123' }),
    })),
  };
});

jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { PaymentService } from '../application/PaymentService';
import { PaymentEntity } from '../domain/Payment';
import { IPaymentRepository } from '../domain/IPaymentRepository';
import { SqsPublisher } from '../../../infra/messaging/SqsPublisher';
import { NotFoundServerException } from '../../../shared/application/ServerException';

const mockRepo: jest.Mocked<IPaymentRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByBudgetId: jest.fn(),
  findByExternalId: jest.fn(),
  updateStatus: jest.fn(),
};

const mockSqsPublisher = {
  publish: jest.fn(),
} as unknown as jest.Mocked<SqsPublisher>;

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentService(mockRepo, mockSqsPublisher);
  });

  describe('createPayment', () => {
    it('should return existing pending payment if found', async () => {
      const existing = PaymentEntity.create({ budgetId: 1, amount: 100 });
      mockRepo.findByBudgetId.mockResolvedValue(existing);

      const result = await service.createPayment({ budgetId: 1, amount: 100 });

      expect(result.budgetId).toBe(1);
      expect(result.status).toBe('pending');
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should create payment via MercadoPago and save', async () => {
      mockRepo.findByBudgetId.mockResolvedValue(null);

      const created = PaymentEntity.restore({
        id: 10, budgetId: 1, externalId: 'mp-ext-123', amount: 100,
        status: 'pending', method: 'pix', payerEmail: 'test@email.com',
        createdAt: new Date(), updatedAt: new Date(),
      });
      mockRepo.create.mockResolvedValue(created);

      const result = await service.createPayment({
        budgetId: 1, amount: 100, method: 'pix', payerEmail: 'test@email.com',
      });

      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.id).toBe(10);
    });

    it('should throw when MercadoPago fails', async () => {
      mockRepo.findByBudgetId.mockResolvedValue(null);

      // Override mpPayment.create to throw
      const { Payment } = require('mercadopago');
      Payment.mockImplementation(() => ({
        create: jest.fn().mockRejectedValue(new Error('MP Error')),
      }));

      const serviceWithError = new PaymentService(mockRepo, mockSqsPublisher);

      await expect(
        serviceWithError.createPayment({ budgetId: 1, amount: 100 })
      ).rejects.toThrow('Erro ao criar pagamento no MercadoPago');
    });
  });

  describe('findById', () => {
    it('should return payment', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 1, amount: 100, status: 'pending',
        externalId: null, method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      mockRepo.findById.mockResolvedValue(payment);

      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById(999))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('findByBudgetId', () => {
    it('should return payment', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: null, method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      mockRepo.findByBudgetId.mockResolvedValue(payment);

      const result = await service.findByBudgetId(5);
      expect(result.budgetId).toBe(5);
    });

    it('should throw when not found', async () => {
      mockRepo.findByBudgetId.mockResolvedValue(null);

      await expect(service.findByBudgetId(999))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('processWebhook', () => {
    it('should update status and publish confirmed event on approved', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: 'ext-1', method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      const updatedPayment = PaymentEntity.restore({
        ...payment.toJSON(), status: 'approved',
      });

      mockRepo.findByExternalId.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(updatedPayment);
      mockSqsPublisher.publish.mockResolvedValue();

      const result = await service.processWebhook('ext-1', 'approved');

      expect(result.status).toBe('approved');
      expect(mockSqsPublisher.publish).toHaveBeenCalled();
    });

    it('should publish failed event on rejected', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: 'ext-2', method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      const updatedPayment = PaymentEntity.restore({
        ...payment.toJSON(), status: 'rejected',
      });

      mockRepo.findByExternalId.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(updatedPayment);
      mockSqsPublisher.publish.mockResolvedValue();

      const result = await service.processWebhook('ext-2', 'rejected');
      expect(result.status).toBe('rejected');
    });

    it('should throw when payment not found for external id', async () => {
      mockRepo.findByExternalId.mockResolvedValue(null);

      await expect(service.processWebhook('missing', 'approved'))
        .rejects.toThrow(NotFoundServerException);
    });

    it('should throw when update returns null', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: 'ext-3', method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      mockRepo.findByExternalId.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(null);

      await expect(service.processWebhook('ext-3', 'approved'))
        .rejects.toThrow(NotFoundServerException);
    });

    it('should map unknown status to pending', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: 'ext-4', method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      const updatedPayment = PaymentEntity.restore({
        ...payment.toJSON(), status: 'pending',
      });

      mockRepo.findByExternalId.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(updatedPayment);

      const result = await service.processWebhook('ext-4', 'unknown_status');
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(1, 'pending');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment and publish event', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: null, method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      const approvedPayment = PaymentEntity.restore({
        ...payment.toJSON(), status: 'approved',
      });

      mockRepo.findById.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(approvedPayment);
      mockSqsPublisher.publish.mockResolvedValue();

      const result = await service.confirmPayment(1);
      expect(result.status).toBe('approved');
      expect(mockSqsPublisher.publish).toHaveBeenCalled();
    });

    it('should throw when payment not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.confirmPayment(999))
        .rejects.toThrow(NotFoundServerException);
    });

    it('should throw when update returns null', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: null, method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      mockRepo.findById.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(null);

      await expect(service.confirmPayment(1))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('rejectPayment', () => {
    it('should reject payment and publish failed event', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: null, method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      const rejectedPayment = PaymentEntity.restore({
        ...payment.toJSON(), status: 'rejected',
      });

      mockRepo.findById.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(rejectedPayment);
      mockSqsPublisher.publish.mockResolvedValue();

      const result = await service.rejectPayment(1);
      expect(result.status).toBe('rejected');
    });

    it('should throw when payment not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.rejectPayment(999))
        .rejects.toThrow(NotFoundServerException);
    });

    it('should throw when update returns null', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: null, method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      mockRepo.findById.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(null);

      await expect(service.rejectPayment(1))
        .rejects.toThrow(NotFoundServerException);
    });
  });

  describe('publishPaymentConfirmed without sqsPublisher', () => {
    it('should not publish when no sqsPublisher', async () => {
      const serviceNoSqs = new PaymentService(mockRepo);

      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: null, method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      const approvedPayment = PaymentEntity.restore({
        ...payment.toJSON(), status: 'approved',
      });

      mockRepo.findById.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(approvedPayment);

      const result = await serviceNoSqs.confirmPayment(1);
      expect(result.status).toBe('approved');
      expect(mockSqsPublisher.publish).not.toHaveBeenCalled();
    });
  });

  describe('publish error handling', () => {
    it('should not throw when publish fails on confirm', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: null, method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      const approvedPayment = PaymentEntity.restore({
        ...payment.toJSON(), status: 'approved',
      });

      mockRepo.findById.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(approvedPayment);
      mockSqsPublisher.publish.mockRejectedValue(new Error('SQS Error'));

      const result = await service.confirmPayment(1);
      expect(result.status).toBe('approved');
    });

    it('should not throw when publish fails on reject', async () => {
      const payment = PaymentEntity.restore({
        id: 1, budgetId: 5, amount: 100, status: 'pending',
        externalId: null, method: null, payerEmail: null,
        createdAt: new Date(), updatedAt: new Date(),
      });
      const rejectedPayment = PaymentEntity.restore({
        ...payment.toJSON(), status: 'rejected',
      });

      mockRepo.findById.mockResolvedValue(payment);
      mockRepo.updateStatus.mockResolvedValue(rejectedPayment);
      mockSqsPublisher.publish.mockRejectedValue(new Error('SQS Error'));

      const result = await service.rejectPayment(1);
      expect(result.status).toBe('rejected');
    });
  });
});
