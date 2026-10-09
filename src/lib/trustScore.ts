
import { describe, expect, it } from 'vitest';
import { calculateTrustScore } from './trustScore';

describe('calculateTrustScore', () => {
  it('returns safe for zero reports', () => {
    expect(calculateTrustScore(0)).toEqual({
      level: 'safe',
      reportCount: 0,
    });
  });

  it('returns caution for 1–2 reports', () => {
    expect(calculateTrustScore(1).level).toBe('caution');
    expect(calculateTrustScore(2).level).toBe('caution');
  });

  it('returns highRisk for 3–5 reports', () => {
    expect(calculateTrustScore(3).level).toBe('highRisk');
    expect(calculateTrustScore(5).level).toBe('highRisk');
  });

  it('returns danger for 6 or more reports', () => {
    expect(calculateTrustScore(6).level).toBe('danger');
    expect(calculateTrustScore(10).level).toBe('danger');
  });

  it('preserves the supplied report count', () => {
    expect(calculateTrustScore(4).reportCount).toBe(4);
  });
});
