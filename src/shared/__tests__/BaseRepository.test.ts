import { BaseRepository } from '../../shared/domain/BaseRepository';
import * as mysql from '../../infra/db/mysql';

jest.mock('../../infra/db/mysql', () => ({
  runInTransaction: jest.fn(),
}));

describe('BaseRepository', () => {
  let repo: BaseRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new BaseRepository();
  });

  describe('transaction', () => {
    it('should delegate to mysql.runInTransaction', async () => {
      const fn = jest.fn().mockResolvedValue('tx-result');
      (mysql.runInTransaction as jest.Mock).mockImplementation((cb: any) => cb());

      await repo.transaction(fn);

      expect(mysql.runInTransaction).toHaveBeenCalledWith(fn);
    });

    it('should return the result from the transaction', async () => {
      const fn = jest.fn().mockResolvedValue('data');
      (mysql.runInTransaction as jest.Mock).mockResolvedValue('data');

      const result = await repo.transaction(fn);

      expect(result).toBe('data');
    });

    it('should propagate errors from the transaction', async () => {
      const fn = jest.fn();
      (mysql.runInTransaction as jest.Mock).mockRejectedValue(new Error('tx-error'));

      await expect(repo.transaction(fn)).rejects.toThrow('tx-error');
    });
  });
});
