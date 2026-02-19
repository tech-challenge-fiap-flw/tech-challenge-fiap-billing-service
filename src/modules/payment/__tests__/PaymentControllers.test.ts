import { CreatePaymentController } from '../http/controllers/CreatePaymentController';
import { GetPaymentController } from '../http/controllers/GetPaymentController';
import { GetPaymentByBudgetController } from '../http/controllers/GetPaymentByBudgetController';
import { PaymentWebhookController } from '../http/controllers/PaymentWebhookController';
import { ConfirmPaymentController } from '../http/controllers/ConfirmPaymentController';
import { RejectPaymentController } from '../http/controllers/RejectPaymentController';
import { IPaymentService } from '../application/PaymentService';
import { HttpRequest } from '../../../shared/http/Controller';

const mockService: jest.Mocked<IPaymentService> = {
  createPayment: jest.fn(),
  findById: jest.fn(),
  findByBudgetId: jest.fn(),
  processWebhook: jest.fn(),
  confirmPayment: jest.fn(),
  rejectPayment: jest.fn(),
};

describe('CreatePaymentController', () => {
  let controller: CreatePaymentController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CreatePaymentController(mockService);
  });

  it('should return 201 with created payment', async () => {
    mockService.createPayment.mockResolvedValue({
      id: 1, budgetId: 5, amount: 100, status: 'pending',
      externalId: null, method: null, payerEmail: null,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const req: HttpRequest = {
      body: { budgetId: 5, amount: 100 },
      params: {},
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(201);
    expect(result.body.id).toBe(1);
  });

  it('should throw on validation error', async () => {
    const req: HttpRequest = { body: {}, params: {}, query: {}, raw: {} as any };
    await expect(controller.handle(req)).rejects.toThrow();
  });
});

describe('GetPaymentController', () => {
  let controller: GetPaymentController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new GetPaymentController(mockService);
  });

  it('should return 200 with payment', async () => {
    mockService.findById.mockResolvedValue({
      id: 1, budgetId: 5, amount: 100, status: 'pending',
      externalId: null, method: null, payerEmail: null,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const req: HttpRequest = {
      body: {},
      params: { id: '1' },
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
  });
});

describe('GetPaymentByBudgetController', () => {
  let controller: GetPaymentByBudgetController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new GetPaymentByBudgetController(mockService);
  });

  it('should return 200 with payment', async () => {
    mockService.findByBudgetId.mockResolvedValue({
      id: 1, budgetId: 5, amount: 100, status: 'pending',
      externalId: null, method: null, payerEmail: null,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const req: HttpRequest = {
      body: {},
      params: { budgetId: '5' },
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
  });
});

describe('PaymentWebhookController', () => {
  let controller: PaymentWebhookController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PaymentWebhookController(mockService);
  });

  it('should return 200 with processed webhook', async () => {
    mockService.processWebhook.mockResolvedValue({
      id: 1, budgetId: 5, amount: 100, status: 'approved',
      externalId: 'ext-1', method: null, payerEmail: null,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const req: HttpRequest = {
      body: { externalId: 'ext-1', status: 'approved' },
      params: {},
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
  });

  it('should throw on invalid webhook payload', async () => {
    const req: HttpRequest = { body: {}, params: {}, query: {}, raw: {} as any };
    await expect(controller.handle(req)).rejects.toThrow();
  });
});

describe('ConfirmPaymentController', () => {
  let controller: ConfirmPaymentController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ConfirmPaymentController(mockService);
  });

  it('should return 200 with confirmed payment', async () => {
    mockService.confirmPayment.mockResolvedValue({
      id: 1, budgetId: 5, amount: 100, status: 'approved',
      externalId: null, method: null, payerEmail: null,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const req: HttpRequest = {
      body: {},
      params: { id: '1' },
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
  });
});

describe('RejectPaymentController', () => {
  let controller: RejectPaymentController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new RejectPaymentController(mockService);
  });

  it('should return 200 with rejected payment', async () => {
    mockService.rejectPayment.mockResolvedValue({
      id: 1, budgetId: 5, amount: 100, status: 'rejected',
      externalId: null, method: null, payerEmail: null,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const req: HttpRequest = {
      body: {},
      params: { id: '1' },
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
  });
});
