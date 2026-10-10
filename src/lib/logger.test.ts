import { describe, it, expect, vi, afterEach } from 'vitest';
import { logError, toLogEntry } from './logger';

describe('toLogEntry', () => {
  it('captures the message and original error for Error instances', () => {
    const err = new Error('boom');
    expect(toLogEntry('Test.context', err)).toEqual(
      expect.objectContaining({ context: 'Test.context', message: 'boom', name: 'Error', cause: err })
    );
  });

  it('keeps Supabase-style code, details and hint', () => {
    const entry = toLogEntry('Test.supabase', {
      message: 'row level security violation',
      code: '42501',
      details: 'no policy',
      hint: 'check policies',
    });
    expect(entry).toEqual(
      expect.objectContaining({
        message: 'row level security violation',
        code: '42501',
        details: 'no policy',
        hint: 'check policies',
      })
    );
  });

  it('handles plain strings, null and unserialisable values without throwing', () => {
    expect(toLogEntry('Test.string', 'plain failure').message).toBe('plain failure');
    expect(() => toLogEntry('Test.null', null)).not.toThrow();
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => toLogEntry('Test.circular', circular)).not.toThrow();
  });
});

describe('logError', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs a readable line plus the structured entry', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('boom');
    logError('Test.context', err);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe('[verify.ng] Test.context: boom');
    expect(spy.mock.calls[0][1]).toEqual(expect.objectContaining({ context: 'Test.context', cause: err }));
  });
});
