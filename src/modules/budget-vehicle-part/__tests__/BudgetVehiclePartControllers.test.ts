import { CreateBudgetVehiclePartController } from '../http/controllers/CreateBudgetVehiclePartController';
import { IBudgetVehiclePartService } from '../application/BudgetVehiclePartService';
import { HttpRequest } from '../../../shared/http/Controller';

const mockService: jest.Mocked<IBudgetVehiclePartService> = {
  createMany: jest.fn(),
  listByBudget: jest.fn(),
  updateMany: jest.fn(),
  removeMany: jest.fn(),
};

describe('CreateBudgetVehiclePartController', () => {
  let controller: CreateBudgetVehiclePartController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CreateBudgetVehiclePartController(mockService);
  });

  it('should return 201 with created items', async () => {
    mockService.createMany.mockResolvedValue([
      { id: 1, budgetId: 10, vehiclePartId: 100, quantity: 2 },
    ]);

    const req: HttpRequest = {
      body: {
        budgetId: 10,
        parts: [{ vehiclePartId: 100, quantity: 2 }],
      },
      params: {},
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(201);
    expect(result.body).toHaveLength(1);
  });

  it('should throw on validation error', async () => {
    const req: HttpRequest = { body: {}, params: {}, query: {}, raw: {} as any };
    await expect(controller.handle(req)).rejects.toThrow();
  });
});
