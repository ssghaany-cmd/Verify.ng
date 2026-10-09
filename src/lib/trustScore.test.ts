import { describe, it, expect } from 'vitest';
import { calculateTrustScore, TRUST_STYLES, type TrustLevel } from './trustScore';

describe('calculateTrustScore', () => {
  it('returns safe for zero reports', () => {
    expect(calculateTrustScore(0)).toEqual({ level: 'safe', reportCount: 0 });
  });

  it.each([1, 2])('returns caution for %i report(s)', (count) => {
    expect(calculateTrustScore(count).level).toBe('caution');
  });

  it.each([3, 4, 5])('returns highRisk for %i reports', (count) => {
    expect(calculateTrustScore(count).level).toBe('highRisk');
  });

  it.each([6, 7, 50])('returns danger for %i reports', (count) => {
    expect(calculateTrustScore(count).level).toBe('danger');
  });

  it('preserves the report count in the result', () => {
    expect(calculateTrustScore(4).reportCount).toBe(4);
  });
});

describe('TRUST_STYLES', () => {
  it('defines a style for every trust level', () => {
    const levels: TrustLevel[] = ['safe', 'caution', 'highRisk', 'danger'];
    for (const level of levels) {
      expect(TRUST_STYLES[level].labelKey).toBeTruthy();
      expect(TRUST_STYLES[level].bg).toMatch(/^bg-/);
    }
  });
});
