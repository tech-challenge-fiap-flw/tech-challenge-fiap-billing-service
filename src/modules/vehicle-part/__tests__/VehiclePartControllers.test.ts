import { CreateVehiclePartController } from '../http/controllers/CreateVehiclePartController';
import { GetVehiclePartController } from '../http/controllers/GetVehiclePartController';
import { UpdateVehiclePartController } from '../http/controllers/UpdateVehiclePartController';
import { DeleteVehiclePartController } from '../http/controllers/DeleteVehiclePartController';
import { ListVehiclePartsController } from '../http/controllers/ListVehiclePartsController';
import { IVehiclePartService } from '../application/VehiclePartService';
import { HttpRequest } from '../../../shared/http/Controller';

const mockService: jest.Mocked<IVehiclePartService> = {
  createVehiclePart: jest.fn(),
  updateVehiclePart: jest.fn(),
  deleteVehiclePart: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
};

describe('CreateVehiclePartController', () => {
  let controller: CreateVehiclePartController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CreateVehiclePartController(mockService);
  });

  it('should return 201 with created part', async () => {
    const body = {
      type: 'engine', name: 'Filter', description: 'Oil filter for car',
      quantity: 10, price: 30,
    };
    mockService.createVehiclePart.mockResolvedValue({ ...body, id: 1, deletedAt: null, creationDate: new Date() });

    const req: HttpRequest = { body, params: {}, query: {}, raw: {} as any };
    const result = await controller.handle(req);

    expect(result.status).toBe(201);
    expect(result.body.id).toBe(1);
  });

  it('should throw on validation error', async () => {
    const req: HttpRequest = { body: { name: '' }, params: {}, query: {}, raw: {} as any };
    await expect(controller.handle(req)).rejects.toThrow();
  });
});

describe('GetVehiclePartController', () => {
  let controller: GetVehiclePartController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new GetVehiclePartController(mockService);
  });

  it('should return 200 with found part', async () => {
    mockService.findById.mockResolvedValue({
      id: 1, type: 'x', name: 'x', description: 'x', quantity: 1, price: 1,
    });

    const req: HttpRequest = { body: {}, params: { id: '1' }, query: {}, raw: {} as any };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
  });
});

describe('UpdateVehiclePartController', () => {
  let controller: UpdateVehiclePartController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UpdateVehiclePartController(mockService);
  });

  it('should return 200 with updated part', async () => {
    mockService.updateVehiclePart.mockResolvedValue({
      id: 1, type: 'x', name: 'x', description: 'updated desc here',
      quantity: 5, price: 50,
    });

    const req: HttpRequest = {
      body: { quantity: 5 },
      params: { id: '1' },
      query: {},
      raw: {} as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
  });

  it('should throw on invalid body', async () => {
    const req: HttpRequest = {
      body: { description: 'short' },
      params: { id: '1' },
      query: {},
      raw: {} as any,
    };
    await expect(controller.handle(req)).rejects.toThrow();
  });
});

describe('DeleteVehiclePartController', () => {
  let controller: DeleteVehiclePartController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DeleteVehiclePartController(mockService);
  });

  it('should return 204', async () => {
    mockService.deleteVehiclePart.mockResolvedValue();

    const req: HttpRequest = { body: {}, params: { id: '1' }, query: {}, raw: {} as any };
    const result = await controller.handle(req);

    expect(result.status).toBe(204);
  });
});

describe('ListVehiclePartsController', () => {
  let controller: ListVehiclePartsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ListVehiclePartsController(mockService);
  });

  it('should return 200 with paginated list', async () => {
    mockService.list.mockResolvedValue([]);
    mockService.countAll.mockResolvedValue(0);

    const req: HttpRequest = {
      body: {},
      params: {},
      query: { page: '1', limit: '10' },
      raw: { query: { page: '1', limit: '10' } } as any,
    };
    const result = await controller.handle(req);

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty('data');
    expect(result.body).toHaveProperty('meta');
  });
});
