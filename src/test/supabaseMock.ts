import { vi } from 'vitest';

export type QueryResult = { data: unknown; error: unknown };

/** Chainable, awaitable stand-in for a Supabase query builder. */
export function queryBuilder(result: QueryResult) {
  const builder: Record<string, ReturnType<typeof vi.fn> | unknown> = {};
  for (const method of ['select', 'eq', 'ilike', 'order', 'limit', 'update', 'insert']) {
    builder[method] = vi.fn(() => builder);
  }
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.then = (resolve: (v: QueryResult) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder as Record<string, ReturnType<typeof vi.fn>> & PromiseLike<QueryResult>;
}

export const scamReport = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  account_number: '0123456789',
  bank_name: 'Test Bank',
  phone_number: null,
  business_name: null,
  amount_lost: 1000,
  scam_type: 'fake_vendor',
  description: 'did not deliver',
  evidence_url: null,
  upvotes: 0,
  created_at: '2026-09-10T10:00:00Z',
  ...overrides,
});
