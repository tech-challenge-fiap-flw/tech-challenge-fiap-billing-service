import { VehiclePartMySqlRepository } from '../infra/VehiclePartMySqlRepository';
import { VehiclePartEntity } from '../domain/VehiclePart';
import * as mysql from '../../../infra/db/mysql';

jest.mock('../../../infra/db/mysql', () => ({
  query: jest.fn(),
  insertOne: jest.fn(),
  update: jest.fn(),
  deleteByField: jest.fn(),
  runInTransaction: jest.fn(),
}));

describe('VehiclePartMySqlRepository', () => {
  let repo: VehiclePartMySqlRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new VehiclePartMySqlRepository();
  });

  describe('create', () => {
    it('should insert and return entity with generated id', async () => {
      const entity = VehiclePartEntity.create({
        type: 'brake',
        name: 'Brake Pad',
        description: 'Front brake pad',
        quantity: 10,
        price: 50,
      });

      (mysql.insertOne as jest.Mock).mockResolvedValue({ insertId: 5 });

      const result = await repo.create(entity);

      expect(mysql.insertOne).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO vehicle_parts'),
        expect.arrayContaining(['brake', 'Brake Pad', 'Front brake pad', 10, 50]),
      );
      expect(result.toJSON().id).toBe(5);
    });
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      const row = { id: 1, type: 'brake', name: 'Brake Pad', description: 'desc', quantity: 10, price: 50, deletedAt: null, creationDate: new Date() };
      (mysql.query as jest.Mock).mockResolvedValue([row]);

      const result = await repo.findById(1);

      expect(result).not.toBeNull();
      expect(result!.toJSON().name).toBe('Brake Pad');
    });

    it('should return null when not found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update fields and return updated entity', async () => {
      (mysql.query as jest.Mock)
        .mockResolvedValueOnce([]) // UPDATE query
        .mockResolvedValueOnce([{ id: 1, type: 'brake', name: 'Updated Pad', description: 'desc', quantity: 5, price: 60, deletedAt: null, creationDate: new Date() }]);

      const result = await repo.update(1, { name: 'Updated Pad', price: 60 });

      expect(mysql.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE vehicle_parts SET'),
        expect.arrayContaining(['Updated Pad', 60, 1]),
      );
      expect(result).not.toBeNull();
      expect(result!.toJSON().name).toBe('Updated Pad');
    });

    it('should return null when entity not found after update', async () => {
      (mysql.query as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await repo.update(999, { name: 'Ghost' });

      expect(result).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('should execute soft delete query', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      await repo.softDelete(1);

      expect(mysql.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE vehicle_parts SET deletedAt = NOW()'),
        [1],
      );
    });
  });

  describe('list', () => {
    it('should return list of entities', async () => {
      const rows = [
        { id: 1, type: 'brake', name: 'Pad', description: '', quantity: 10, price: 50, deletedAt: null, creationDate: new Date() },
        { id: 2, type: 'oil', name: 'Oil', description: '', quantity: 20, price: 30, deletedAt: null, creationDate: new Date() },
      ];
      (mysql.query as jest.Mock).mockResolvedValue(rows);

      const result = await repo.list(0, 10);

      expect(result).toHaveLength(2);
      expect(result[0].toJSON().name).toBe('Pad');
    });

    it('should return empty array when no results', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.list(0, 10);

      expect(result).toHaveLength(0);
    });
  });

  describe('countAll', () => {
    it('should return count of non-deleted parts', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([{ count: 42 }]);

      const result = await repo.countAll();

      expect(result).toBe(42);
    });

    it('should return 0 when no rows match', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.countAll();

      expect(result).toBe(0);
    });
  });
});
