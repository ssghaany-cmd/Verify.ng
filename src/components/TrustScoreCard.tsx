import { ShieldCheck, AlertTriangle, ShieldAlert, ShieldX, Copy, Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { TRUST_STYLES, type TrustLevel } from '@/lib/trustScore';
import { formatDate } from '@/lib/format';
import { SCAM_TYPE_LABELS, type ScamReport } from '@/lib/supabase';

type TrustScoreCardProps = {
  level: TrustLevel;
  reportCount: number;
  reports: ScamReport[];
  accountIdentifier: string;
  bankName?: string;
  isVerifiedBusiness?: boolean;
  businessName?: string;
};

const LEVEL_ICONS: Record<TrustLevel, typeof ShieldCheck> = {
  safe: ShieldCheck,
  caution: AlertTriangle,
  highRisk: ShieldAlert,
  danger: ShieldX,
};

export function TrustScoreCard({
  level,
  reportCount,
  reports,
  accountIdentifier,
  bankName,
  isVerifiedBusiness,
  businessName,
}: TrustScoreCardProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const style = TRUST_STYLES[level];
  const Icon = LEVEL_ICONS[level];

  const handleCopy = () => {
    navigator.clipboard.writeText(accountIdentifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `VerifyNG Alert: Account ${accountIdentifier}${bankName ? ` (${bankName})` : ''} has ${reportCount} scam report(s). ${t(level === 'safe' ? 'verifiedSafe' : level === 'danger' ? 'danger' : level === 'highRisk' ? 'highRisk' : 'caution')}. Stay safe!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const mostRecent = reports[0];

  return (
    <div className={`rounded-2xl border-2 ${style.border} ${style.bg} p-5 animate-fade-in`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-full ${style.bg} flex items-center justify-center border-2 ${style.border}`}>
            <Icon className={`w-7 h-7 ${style.icon}`} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{t('trustScore')}</p>
            <p className={`text-lg font-bold ${style.text}`}>{t(style.labelKey)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-800">{reportCount}</p>
          <p className="text-[10px] text-gray-500">{t('totalReports')}</p>
        </div>
      </div>

      {isVerifiedBusiness && (
        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 rounded-lg px-3 py-1.5 mb-3 text-sm font-semibold">
          <ShieldCheck className="w-4 h-4" />
          {t('verified')} — {businessName}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <code className="flex-1 bg-white/70 rounded-lg px-3 py-2 text-sm font-mono text-gray-700 border border-gray-200">
          {accountIdentifier}
        </code>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 bg-white hover:bg-gray-50 active:scale-95 transition-all rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-200 shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? t('copied') : t('copyAccountNumber')}
        </button>
      </div>

      {mostRecent && (
        <p className="text-xs text-gray-500 mb-3">
          {t('mostRecentReport')}: <span className="font-semibold text-gray-700">{formatDate(mostRecent.created_at)}</span>
        </p>
      )}

      <button
        onClick={handleWhatsAppShare}
        className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] active:scale-95 transition-all text-white font-semibold py-2.5 rounded-xl text-sm mb-4"
      >
        <Share2 className="w-4 h-4" />
        {t('shareOnWhatsApp')}
      </button>

      {reports.length > 0 && (
        <>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-center text-sm font-semibold text-[#008753] hover:underline py-1"
          >
            {showDetails ? t('hideDetails') : t('viewDetails')}
          </button>
          {showDetails && (
            <div className="mt-3 space-y-3 animate-fade-in">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{t('whatPeopleReported')}</p>
              {reports.map((report) => (
                <div key={report.id} className="bg-white/60 rounded-xl p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-block bg-[#008753]/10 text-[#008753] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {SCAM_TYPE_LABELS[report.scam_type] || report.scam_type}
                    </span>
                    <span className="text-[10px] text-gray-400">{formatDate(report.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>
                  {report.amount_lost > 0 && (
                    <p className="text-xs text-gray-500 mt-1.5">₦{report.amount_lost.toLocaleString()} lost</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {reports.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">{t('noReportsDesc')}</p>
      )}

      <p className="text-[10px] text-gray-400 text-center mt-3 italic">{t('disclaimerText')}</p>
    </div>
  );
}
