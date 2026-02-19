import { CreateBudgetVehicleServiceController } from '../http/controllers/CreateBudgetVehicleServiceController';
import { UpdateBudgetVehicleServiceController } from '../http/controllers/UpdateBudgetVehicleServiceController';
import { GetBudgetVehicleServiceController } from '../http/controllers/GetBudgetVehicleServiceController';
import { DeleteBudgetVehicleServiceController } from '../http/controllers/DeleteBudgetVehicleServiceController';
import { IBudgetVehicleServiceService } from '../application/BudgetVehicleServiceService';
import { HttpRequest } from '../../../shared/http/Controller';

const mockService: jest.Mocked<IBudgetVehicleServiceService> = {
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
};

describe('CreateBudgetVehicleServiceController', () => {
  let controller: CreateBudgetVehicleServiceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CreateBudgetVehicleServiceController(mockService);
  });

  it('should return 201', async () => {
    mockService.create.mockResolvedValue({
      id: 1, budgetId: 10, vehicleServiceId: 5, price: 200,
    } as any);

    const req: HttpRequest = {
      body: { budgetId: 10, vehicleServiceId: 5, price: 200 },
      params: {},
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(201);
  });

  it('should throw on validation error', async () => {
    const req: HttpRequest = { body: {}, params: {}, query: {}, raw: {} as any };
    await expect(controller.handle(req)).rejects.toThrow();
  });
});

describe('UpdateBudgetVehicleServiceController', () => {
  let controller: UpdateBudgetVehicleServiceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UpdateBudgetVehicleServiceController(mockService);
  });

  it('should return 200 with updated item', async () => {
    mockService.update.mockResolvedValue({
      id: 1, budgetId: 10, vehicleServiceId: 5, price: 300,
    } as any);

    const req: HttpRequest = {
      body: { price: 300 },
      params: { id: '1' },
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
  });
});

describe('GetBudgetVehicleServiceController', () => {
  let controller: GetBudgetVehicleServiceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new GetBudgetVehicleServiceController(mockService);
  });

  it('should return 200', async () => {
    mockService.findById.mockResolvedValue({
      id: 1, budgetId: 10, vehicleServiceId: 5, price: 200,
    } as any);

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

describe('DeleteBudgetVehicleServiceController', () => {
  let controller: DeleteBudgetVehicleServiceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DeleteBudgetVehicleServiceController(mockService);
  });

  it('should return 204', async () => {
    mockService.delete.mockResolvedValue();

    const req: HttpRequest = {
      body: {},
      params: { id: '1' },
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(204);
  });
});
