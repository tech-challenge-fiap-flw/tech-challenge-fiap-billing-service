import { getPagination, toPage } from '../http/pagination';

describe('pagination', () => {
  describe('getPagination', () => {
    it('should return defaults when no query params', () => {
      const req = { query: {} } as any;
      const result = getPagination(req);
      expect(result).toEqual({ page: 1, limit: 10, offset: 0 });
    });

    it('should parse page and limit from query', () => {
      const req = { query: { page: '3', limit: '20' } } as any;
      const result = getPagination(req);
      expect(result).toEqual({ page: 3, limit: 20, offset: 40 });
    });

    it('should enforce minimum page 1', () => {
      const req = { query: { page: '0', limit: '10' } } as any;
      const result = getPagination(req);
      expect(result.page).toBe(1);
    });

    it('should default to 10 when limit is 0 (falsy)', () => {
      const req = { query: { page: '1', limit: '0' } } as any;
      const result = getPagination(req);
      expect(result.limit).toBe(10);
    });

    it('should enforce maximum limit 100', () => {
      const req = { query: { page: '1', limit: '200' } } as any;
      const result = getPagination(req);
      expect(result.limit).toBe(100);
    });

    it('should calculate correct offset', () => {
      const req = { query: { page: '5', limit: '10' } } as any;
      const result = getPagination(req);
      expect(result.offset).toBe(40);
    });
  });

  describe('toPage', () => {
    it('should return paginated response', () => {
      const items = ['a', 'b', 'c'];
      const result = toPage(items, 1, 10, 3);

      expect(result.data).toEqual(['a', 'b', 'c']);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(3);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should calculate totalPages correctly', () => {
      const result = toPage([], 1, 10, 25);
      expect(result.meta.totalPages).toBe(3);
    });

    it('should handle empty results', () => {
      const result = toPage([], 1, 10, 0);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });
});
