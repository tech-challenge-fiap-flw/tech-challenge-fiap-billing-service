import { Request } from 'express';

export function getPagination(req: Request) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function toPage<T>(items: T[], page: number, limit: number, total: number) {
  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
