import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { maskAccountNumber, formatNaira, formatDate, timeAgo } from './format';

describe('maskAccountNumber', () => {
  it('keeps first 3 and last 2 digits of a 10-digit NUBAN', () => {
    expect(maskAccountNumber('0123456789')).toBe('012*****89');
  });

  it('never reveals the middle digits', () => {
    const masked = maskAccountNumber('0123456789');
    expect(masked).not.toContain('3456');
  });

  it('returns very short values unchanged', () => {
    expect(maskAccountNumber('1234')).toBe('1234');
    expect(maskAccountNumber('12')).toBe('12');
  });
});

describe('formatNaira', () => {
  it('uses the naira symbol with thousands separators and no decimals', () => {
    expect(formatNaira(5000)).toMatch(/^₦\s?5,000$/);
    expect(formatNaira(1234567)).toMatch(/^₦\s?1,234,567$/);
  });

  it('formats zero', () => {
    expect(formatNaira(0)).toMatch(/^₦\s?0$/);
  });
});

describe('formatDate', () => {
  it('includes the year and day for a valid ISO date', () => {
    const out = formatDate('2026-09-15T12:00:00Z');
    expect(out).toContain('2026');
    expect(out).toContain('15');
  });
});

describe('timeAgo', () => {
  const NOW = new Date('2026-09-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

  it('says "just now" under a minute', () => {
    expect(timeAgo(ago(30_000))).toBe('just now');
  });

  it('reports minutes', () => {
    expect(timeAgo(ago(5 * 60_000))).toBe('5m ago');
  });

  it('reports hours', () => {
    expect(timeAgo(ago(3 * 3_600_000))).toBe('3h ago');
  });

  it('reports days under a week', () => {
    expect(timeAgo(ago(2 * 86_400_000))).toBe('2d ago');
  });

  it('falls back to a formatted date after a week', () => {
    expect(timeAgo(ago(10 * 86_400_000))).toContain('2026');
  });
});
