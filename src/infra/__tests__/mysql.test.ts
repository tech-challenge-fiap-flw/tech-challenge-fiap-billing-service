const mockQuery = jest.fn();
const mockGetConnection = jest.fn();
const mockCreatePool = jest.fn();

jest.mock('mysql2/promise', () => ({
  createPool: mockCreatePool.mockReturnValue({
    query: mockQuery,
    getConnection: mockGetConnection,
  }),
}));

describe('mysql infra', () => {
  let mysqlModule: typeof import('../../infra/db/mysql');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    mockCreatePool.mockReturnValue({
      query: mockQuery,
      getConnection: mockGetConnection,
    });
  });

  beforeEach(async () => {
    mysqlModule = await import('../../infra/db/mysql');
  });

  describe('query', () => {
    it('should execute query on pool and return rows', async () => {
      const rows = [{ id: 1, name: 'test' }];
      mockQuery.mockResolvedValue([rows]);

      const result = await mysqlModule.query('SELECT * FROM test');

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM test', undefined);
      expect(result).toEqual(rows);
    });

    it('should pass params to pool query', async () => {
      mockQuery.mockResolvedValue([[]]);

      await mysqlModule.query('SELECT * FROM test WHERE id = ?', [1]);

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM test WHERE id = ?', [1]);
    });
  });

  describe('insertOne', () => {
    it('should execute insert and return result header', async () => {
      const result = { insertId: 42, affectedRows: 1 };
      mockQuery.mockResolvedValue([result]);

      const res = await mysqlModule.insertOne('INSERT INTO test VALUES (?)', ['val']);

      expect(mockQuery).toHaveBeenCalledWith('INSERT INTO test VALUES (?)', ['val']);
      expect(res).toEqual(result);
    });
  });

  describe('update', () => {
    it('should execute update and return result header', async () => {
      const result = { affectedRows: 1 };
      mockQuery.mockResolvedValue([result]);

      const res = await mysqlModule.update('UPDATE test SET name = ?', ['new']);

      expect(mockQuery).toHaveBeenCalledWith('UPDATE test SET name = ?', ['new']);
      expect(res).toEqual(result);
    });
  });

  describe('deleteByField', () => {
    it('should execute delete query on pool', async () => {
      mockQuery.mockResolvedValue([]);

      await mysqlModule.deleteByField('test', 'id', 1);

      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM test WHERE id = ?', [1]);
    });
  });

  describe('runInTransaction', () => {
    it('should run function in transaction and commit on success', async () => {
      const mockConn = {
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
        release: jest.fn(),
        query: jest.fn(),
      };
      mockGetConnection.mockResolvedValue(mockConn);

      const fn = jest.fn().mockResolvedValue('result');

      const result = await mysqlModule.runInTransaction(fn);

      expect(mockGetConnection).toHaveBeenCalled();
      expect(mockConn.beginTransaction).toHaveBeenCalled();
      expect(fn).toHaveBeenCalled();
      expect(mockConn.commit).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should rollback and rethrow on error', async () => {
      const mockConn = {
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
        release: jest.fn(),
        query: jest.fn(),
      };
      mockGetConnection.mockResolvedValue(mockConn);

      const error = new Error('fail');
      const fn = jest.fn().mockRejectedValue(error);

      await expect(mysqlModule.runInTransaction(fn)).rejects.toThrow('fail');

      expect(mockConn.rollback).toHaveBeenCalled();
      expect(mockConn.commit).not.toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
    });
  });
});
