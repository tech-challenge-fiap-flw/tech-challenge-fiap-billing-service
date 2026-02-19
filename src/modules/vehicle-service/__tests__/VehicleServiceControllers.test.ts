import { CreateVehicleServiceController } from '../http/controllers/CreateVehicleServiceController';
import { GetVehicleServiceController } from '../http/controllers/GetVehicleServiceController';
import { UpdateVehicleServiceController } from '../http/controllers/UpdateVehicleServiceController';
import { DeleteVehicleServiceController } from '../http/controllers/DeleteVehicleServiceController';
import { ListVehicleServicesController } from '../http/controllers/ListVehicleServicesController';
import { IVehicleServiceService } from '../application/VehicleServiceService';
import { HttpRequest } from '../../../shared/http/Controller';

const mockService: jest.Mocked<IVehicleServiceService> = {
  createVehicleService: jest.fn(),
  updateVehicleService: jest.fn(),
  deleteVehicleService: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
};

describe('CreateVehicleServiceController', () => {
  let controller: CreateVehicleServiceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CreateVehicleServiceController(mockService);
  });

  it('should return 201 with created service', async () => {
    const body = { name: 'Oil Change', price: 150, description: null };
    mockService.createVehicleService.mockResolvedValue({ ...body, id: 1, deletedAt: null });

    const req: HttpRequest = { body, params: {}, query: {}, raw: {} as any };
    const result = await controller.handle(req);

    expect(result.status).toBe(201);
    expect(result.body.id).toBe(1);
  });

  it('should throw on validation error', async () => {
    const req: HttpRequest = { body: {}, params: {}, query: {}, raw: {} as any };
    await expect(controller.handle(req)).rejects.toThrow();
  });
});

describe('GetVehicleServiceController', () => {
  let controller: GetVehicleServiceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new GetVehicleServiceController(mockService);
  });

  it('should return 200 with found service', async () => {
    mockService.findById.mockResolvedValue({ id: 1, name: 'T', price: 10, deletedAt: null });

    const req: HttpRequest = { body: {}, params: { id: '1' }, query: {}, raw: {} as any };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
  });
});

describe('UpdateVehicleServiceController', () => {
  let controller: UpdateVehicleServiceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UpdateVehicleServiceController(mockService);
  });

  it('should return 200 with updated service', async () => {
    mockService.updateVehicleService.mockResolvedValue({ id: 1, name: 'T', price: 200, deletedAt: null });

    const req: HttpRequest = {
      body: { price: 200 },
      params: { id: '1' },
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
  });
});

describe('DeleteVehicleServiceController', () => {
  let controller: DeleteVehicleServiceController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DeleteVehicleServiceController(mockService);
  });

  it('should return 204', async () => {
    mockService.deleteVehicleService.mockResolvedValue();

    const req: HttpRequest = { body: {}, params: { id: '1' }, query: {}, raw: {} as any };
    const result = await controller.handle(req);

    expect(result.status).toBe(204);
  });
});

describe('ListVehicleServicesController', () => {
  let controller: ListVehicleServicesController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ListVehicleServicesController(mockService);
  });

  it('should return 200 with paginated list', async () => {
    mockService.list.mockResolvedValue([]);
    mockService.countAll.mockResolvedValue(0);

    const req: HttpRequest = {
      body: {},
      params: {},
      query: {},
      raw: { query: { page: '1', limit: '10' } } as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty('data');
    expect(result.body).toHaveProperty('meta');
  });
});
