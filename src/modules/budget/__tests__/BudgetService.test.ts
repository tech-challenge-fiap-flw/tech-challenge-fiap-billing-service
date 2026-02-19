import { BudgetService } from '../application/BudgetService';
import { BudgetEntity } from '../domain/Budget';
import { IBudgetRepository } from '../domain/IBudgetRepository';
import { IVehiclePartService } from '../../vehicle-part/application/VehiclePartService';
import { IBudgetVehiclePartService } from '../../budget-vehicle-part/application/BudgetVehiclePartService';
import { IVehicleServiceService } from '../../vehicle-service/application/VehicleServiceService';
import { IBudgetVehicleServiceService } from '../../budget-vehicle-service/application/BudgetVehicleServiceService';
import { SqsPublisher } from '../../../infra/messaging/SqsPublisher';
import { NotFoundServerException, ForbiddenServerException } from '../../../shared/application/ServerException';

const mockRepo: jest.Mocked<IBudgetRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  transaction: jest.fn(),
};

const mockVehiclePartService: jest.Mocked<IVehiclePartService> = {
  createVehiclePart: jest.fn(),
  updateVehiclePart: jest.fn(),
  deleteVehiclePart: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
};

const mockBudgetVehiclePartService: jest.Mocked<IBudgetVehiclePartService> = {
  createMany: jest.fn(),
  listByBudget: jest.fn(),
  updateMany: jest.fn(),
  removeMany: jest.fn(),
};

const mockVehicleServiceService: jest.Mocked<IVehicleServiceService> = {
  createVehicleService: jest.fn(),
  updateVehicleService: jest.fn(),
  deleteVehicleService: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  list: jest.fn(),
  countAll: jest.fn(),
};

const mockBudgetVehicleServiceService: jest.Mocked<IBudgetVehicleServiceService> = {
  create: jest.fn(),
  createMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
};

const mockSqsPublisher = {
  publish: jest.fn(),
} as unknown as jest.Mocked<SqsPublisher>;

describe('BudgetService', () => {
  let service: BudgetService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Make transaction just execute the callback
    mockRepo.transaction.mockImplementation(async (fn) => fn());

    service = new BudgetService(
      mockRepo,
      mockVehiclePartService,
      mockBudgetVehiclePartService,
      mockVehicleServiceService,
      mockBudgetVehicleServiceService,
      mockSqsPublisher,
    );
  });

  describe('create', () => {
    it('should create a budget with vehicle parts and services', async () => {
      const budgetEntity = BudgetEntity.restore({
        id: 1,
        description: 'Test',
        ownerId: 10,
        diagnosisId: 20,
        total: 550,
        creationDate: new Date(),
        deletedAt: null,
      } as any);

      mockVehicleServiceService.findByIds.mockResolvedValue([
        { id: 1, name: 'Oil Change', price: 150, deletedAt: null },
      ]);
      mockVehiclePartService.findById.mockResolvedValue({
        id: 100, type: 'engine', name: 'Filter', description: 'x', quantity: 20, price: 40,
      });
      mockVehiclePartService.updateVehiclePart.mockResolvedValue({
        id: 100, type: 'engine', name: 'Filter', description: 'x', quantity: 10, price: 40,
      });
      mockRepo.create.mockResolvedValue(budgetEntity);
      mockBudgetVehiclePartService.createMany.mockResolvedValue([]);
      mockBudgetVehicleServiceService.createMany.mockResolvedValue([]);
      mockSqsPublisher.publish.mockResolvedValue();

      const result = await service.create({
        description: 'Test',
        ownerId: 10,
        diagnosisId: 20,
        vehicleParts: [{ vehiclePartId: 100, quantity: 10 }],
        vehicleServicesIds: [1],
      });

      expect(mockRepo.transaction).toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockBudgetVehiclePartService.createMany).toHaveBeenCalled();
      expect(mockBudgetVehicleServiceService.createMany).toHaveBeenCalled();
      expect(mockSqsPublisher.publish).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('should create budget without vehicle services', async () => {
      const budgetEntity = BudgetEntity.restore({
        id: 2, description: 'No services', ownerId: 1, diagnosisId: 1,
        total: 100, creationDate: new Date(), deletedAt: null,
      } as any);

      mockVehicleServiceService.findByIds.mockResolvedValue([]);
      mockVehiclePartService.findById.mockResolvedValue({
        id: 1, type: 'x', name: 'x', description: 'x', quantity: 10, price: 10,
      });
      mockVehiclePartService.updateVehiclePart.mockResolvedValue({
        id: 1, type: 'x', name: 'x', description: 'x', quantity: 5, price: 10,
      });
      mockRepo.create.mockResolvedValue(budgetEntity);
      mockBudgetVehiclePartService.createMany.mockResolvedValue([]);

      const result = await service.create({
        description: 'No services',
        ownerId: 1,
        diagnosisId: 1,
        vehicleParts: [{ vehiclePartId: 1, quantity: 5 }],
      });

      expect(mockBudgetVehicleServiceService.createMany).not.toHaveBeenCalled();
      expect(result.id).toBe(2);
    });

    it('should throw NotFound when vehicle services not found', async () => {
      mockVehicleServiceService.findByIds.mockResolvedValue([]);

      await expect(
        service.create({
          description: 'Test',
          ownerId: 1,
          diagnosisId: 1,
          vehicleParts: [{ vehiclePartId: 1, quantity: 1 }],
          vehicleServicesIds: [999],
        })
      ).rejects.toThrow(NotFoundServerException);
    });

    it('should throw Forbidden when insufficient part quantity', async () => {
      mockVehicleServiceService.findByIds.mockResolvedValue([]);
      mockVehiclePartService.findById.mockResolvedValue({
        id: 1, type: 'x', name: 'x', description: 'x', quantity: 2, price: 10,
      });

      await expect(
        service.create({
          description: 'Test',
          ownerId: 1,
          diagnosisId: 1,
          vehicleParts: [{ vehiclePartId: 1, quantity: 5 }],
        })
      ).rejects.toThrow(ForbiddenServerException);
    });
  });

  describe('create without SQS publisher', () => {
    it('should skip publishing when no sqsPublisher', async () => {
      const serviceNoSqs = new BudgetService(
        mockRepo,
        mockVehiclePartService,
        mockBudgetVehiclePartService,
        mockVehicleServiceService,
        mockBudgetVehicleServiceService,
      );

      const budgetEntity = BudgetEntity.restore({
        id: 3, description: 'No SQS', ownerId: 1, diagnosisId: 1,
        total: 0, creationDate: new Date(), deletedAt: null,
      } as any);

      mockVehicleServiceService.findByIds.mockResolvedValue([]);
      mockRepo.create.mockResolvedValue(budgetEntity);
      mockBudgetVehiclePartService.createMany.mockResolvedValue([]);

      const result = await serviceNoSqs.create({
        description: 'No SQS',
        ownerId: 1,
        diagnosisId: 1,
        vehicleParts: [],
      });

      expect(mockSqsPublisher.publish).not.toHaveBeenCalled();
      expect(result.id).toBe(3);
    });
  });

  describe('findById', () => {
    it('should return budget when found', async () => {
      const budgetEntity = BudgetEntity.restore({
        id: 1, description: 'Test', ownerId: 1, diagnosisId: 1,
        total: 100, creationDate: new Date(), deletedAt: null,
      } as any);
      mockRepo.findById.mockResolvedValue(budgetEntity);

      const result = await service.findById(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFound when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById(999))
        .rejects.toThrow(NotFoundServerException);
    });

    it('should pass userId for non-admin users', async () => {
      const budgetEntity = BudgetEntity.restore({
        id: 1, description: 'Test', ownerId: 5, diagnosisId: 1,
        total: 100, creationDate: new Date(), deletedAt: null,
      } as any);
      mockRepo.findById.mockResolvedValue(budgetEntity);

      await service.findById(1, { sub: 5, email: 'user@test.com', type: 'customer' });

      expect(mockRepo.findById).toHaveBeenCalledWith(1, 5);
    });

    it('should pass undefined userId for admin users', async () => {
      const budgetEntity = BudgetEntity.restore({
        id: 1, description: 'Test', ownerId: 1, diagnosisId: 1,
        total: 100, creationDate: new Date(), deletedAt: null,
      } as any);
      mockRepo.findById.mockResolvedValue(budgetEntity);

      await service.findById(1, { sub: 1, email: 'admin@test.com', type: 'admin' });

      expect(mockRepo.findById).toHaveBeenCalledWith(1, undefined);
    });
  });
});
