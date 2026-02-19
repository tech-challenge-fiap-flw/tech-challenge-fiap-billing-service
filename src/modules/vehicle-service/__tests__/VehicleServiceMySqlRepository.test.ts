import { VehicleServiceMySqlRepository } from '../infra/VehicleServiceMySqlRepository';
import { VehicleServiceEntity } from '../domain/VehicleService';
import * as mysql from '../../../infra/db/mysql';

jest.mock('../../../infra/db/mysql', () => ({
  query: jest.fn(),
  insertOne: jest.fn(),
  update: jest.fn(),
  deleteByField: jest.fn(),
  runInTransaction: jest.fn(),
}));

describe('VehicleServiceMySqlRepository', () => {
  let repo: VehicleServiceMySqlRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new VehicleServiceMySqlRepository();
  });

  describe('create', () => {
    it('should insert and return entity with generated id', async () => {
      const entity = VehicleServiceEntity.create({
        name: 'Oil Change',
        price: 100,
        description: 'Full synthetic oil change',
      });

      (mysql.insertOne as jest.Mock).mockResolvedValue({ insertId: 7 });

      const result = await repo.create(entity);

      expect(mysql.insertOne).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO vehicle_services'),
        expect.arrayContaining(['Oil Change', 100, 'Full synthetic oil change']),
      );
      expect(result.toJSON().id).toBe(7);
    });

    it('should pass null for optional fields', async () => {
      const entity = VehicleServiceEntity.create({
        name: 'Basic',
        price: 50,
      });

      (mysql.insertOne as jest.Mock).mockResolvedValue({ insertId: 8 });

      await repo.create(entity);

      const params = (mysql.insertOne as jest.Mock).mock.calls[0][1];
      expect(params[2]).toBeNull(); // description
      expect(params[3]).toBeNull(); // deletedAt
    });
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      const row = { id: 1, name: 'Oil Change', price: 100, description: 'desc', deletedAt: null };
      (mysql.query as jest.Mock).mockResolvedValue([row]);

      const result = await repo.findById(1);

      expect(result).not.toBeNull();
      expect(result!.toJSON().name).toBe('Oil Change');
    });

    it('should return null when not found', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return entity', async () => {
      (mysql.query as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: 1, name: 'Updated', price: 200, description: 'desc', deletedAt: null }]);

      const result = await repo.update(1, { name: 'Updated', price: 200 });

      expect(mysql.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE vehicle_services SET'),
        expect.arrayContaining(['Updated', 200, 1]),
      );
      expect(result).not.toBeNull();
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
    it('should execute soft delete', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      await repo.softDelete(1);

      expect(mysql.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE vehicle_services SET deletedAt = NOW()'),
        [1],
      );
    });
  });

  describe('list', () => {
    it('should return list of entities', async () => {
      const rows = [
        { id: 1, name: 'Oil Change', price: 100, description: '', deletedAt: null },
        { id: 2, name: 'Tire Rotation', price: 80, description: '', deletedAt: null },
      ];
      (mysql.query as jest.Mock).mockResolvedValue(rows);

      const result = await repo.list(0, 10);

      expect(result).toHaveLength(2);
    });

    it('should return empty array', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.list(0, 10);

      expect(result).toHaveLength(0);
    });
  });

  describe('countAll', () => {
    it('should return count', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([{ count: 15 }]);

      const result = await repo.countAll();

      expect(result).toBe(15);
    });

    it('should return 0 when empty', async () => {
      (mysql.query as jest.Mock).mockResolvedValue([]);

      const result = await repo.countAll();

      expect(result).toBe(0);
    });
  });
});
