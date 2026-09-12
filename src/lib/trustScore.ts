export type TrustLevel = 'safe' | 'caution' | 'highRisk' | 'danger';

export type TrustScoreResult = {
  level: TrustLevel;
  reportCount: number;
};

export function calculateTrustScore(reportCount: number): TrustScoreResult {
  if (reportCount === 0) return { level: 'safe', reportCount };
  if (reportCount <= 2) return { level: 'caution', reportCount };
  if (reportCount <= 5) return { level: 'highRisk', reportCount };
  return { level: 'danger', reportCount };
}

export const TRUST_STYLES: Record<TrustLevel, {
  bg: string;
  text: string;
  border: string;
  icon: string;
  labelKey: 'verifiedSafe' | 'caution' | 'highRisk' | 'danger';
}> = {
  safe: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: 'text-green-600',
    labelKey: 'verifiedSafe',
  },
  caution: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    icon: 'text-yellow-600',
    labelKey: 'caution',
  },
  highRisk: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-300',
    icon: 'text-orange-600',
    labelKey: 'highRisk',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-300',
    icon: 'text-red-600',
    labelKey: 'danger',
  },
};
