import { describe, it, expect, vi, afterEach } from 'vitest';
import { logError } from './logger';

describe('logError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs context and message for Error instances and forwards the original error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('boom');
    logError('Test.context', err);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('Test.context');
    expect(spy.mock.calls[0][0]).toContain('boom');
    expect(spy.mock.calls[0][1]).toBe(err);
  });

  it('handles Supabase-style error objects with a message field', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logError('Test.supabase', { message: 'row level security violation', code: '42501' });
    expect(spy.mock.calls[0][0]).toContain('row level security violation');
  });

  it('handles plain strings and unserialisable values without throwing', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logError('Test.string', 'plain failure');
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => logError('Test.circular', circular)).not.toThrow();
    expect(spy.mock.calls[0][0]).toContain('plain failure');
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
