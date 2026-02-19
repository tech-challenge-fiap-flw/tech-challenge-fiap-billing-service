import { CreateBudgetController } from '../http/controllers/CreateBudgetController';
import { FindBudgetController } from '../http/controllers/FindBudgetController';
import { IBudgetService } from '../application/BudgetService';
import { HttpRequest } from '../../../shared/http/Controller';

const mockService: jest.Mocked<IBudgetService> = {
  create: jest.fn(),
  findById: jest.fn(),
};

describe('CreateBudgetController', () => {
  let controller: CreateBudgetController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CreateBudgetController(mockService);
  });

  it('should return 201 with created budget', async () => {
    const body = {
      description: 'Test budget description',
      ownerId: 1,
      diagnosisId: 10,
      vehicleParts: [{ vehiclePartId: 1, quantity: 2 }],
    };

    mockService.create.mockResolvedValue({
      id: 1, description: body.description, ownerId: 1, diagnosisId: 10,
      total: 100, creationDate: new Date(), deletedAt: null,
    } as any);

    const req: HttpRequest = { body, params: {}, query: {}, raw: {} as any };
    const result = await controller.handle(req);

    expect(result.status).toBe(201);
    expect(result.body.id).toBe(1);
  });

  it('should throw on validation error', async () => {
    const req: HttpRequest = {
      body: { description: '' },
      params: {},
      query: {},
      raw: {} as any,
    };

    await expect(controller.handle(req)).rejects.toThrow();
  });
});

describe('FindBudgetController', () => {
  let controller: FindBudgetController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new FindBudgetController(mockService);
  });

  it('should return 200 with budget', async () => {
    mockService.findById.mockResolvedValue({
      id: 1, description: 'Test', ownerId: 1, diagnosisId: 1,
      total: 100, creationDate: new Date(), deletedAt: null,
    } as any);

    const req: HttpRequest = {
      body: {},
      params: { id: 1 },
      query: {},
      user: { sub: 1, email: 'test@test.com', type: 'admin' },
      raw: {} as any,
    };

    const result = await controller.handle(req);
    expect(result.status).toBe(200);
    expect(result.body.id).toBe(1);
  });

  it('should throw when user is not set', async () => {
    const req: HttpRequest = {
      body: {},
      params: { id: 1 },
      query: {},
      raw: {} as any,
    };

    await expect(controller.handle(req)).rejects.toThrow();
  });
});
