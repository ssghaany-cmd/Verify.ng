import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ChevronDown, ChevronUp, ThumbsUp, Share2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase, type ScamReport, SCAM_TYPE_LABELS } from '@/lib/supabase';
import { maskAccountNumber, formatNaira, formatDate } from '@/lib/format';

export function RecentScamsPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error: fetchError } = await supabase
        .from('scam_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (fetchError) throw fetchError;
      setReports((data || []) as ScamReport[]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (report: ScamReport) => {
    if (upvotedIds.has(report.id)) return;
    setUpvotedIds((prev) => new Set(prev).add(report.id));
    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
    try {
      await supabase
        .from('scam_reports')
        .update({ upvotes: report.upvotes + 1 })
        .eq('id', report.id);
    } catch {
      // Revert on failure
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, upvotes: r.upvotes - 1 } : r))
      );
      setUpvotedIds((prev) => {
        const next = new Set(prev);
        next.delete(report.id);
        return next;
      });
    }
  };

  const handleShare = (report: ScamReport) => {
    const text = `VerifyNG Scam Alert: ${maskAccountNumber(report.account_number)} at ${report.bank_name}. ${SCAM_TYPE_LABELS[report.scam_type]}. ${report.upvotes + 1} ${t('confirmedVictims')}. Stay safe!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#008753]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {t('errorOccurred')}
        </div>
        <button
          onClick={fetchReports}
          className="mt-4 w-full bg-[#008753] text-white font-semibold py-3 rounded-xl text-sm active:scale-95"
        >
          {t('loading')}
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto text-center">
        <ShieldCheck className="w-16 h-16 text-green-400 mx-auto mb-3" />
        <p className="text-sm text-gray-500">{t('noScamsYet')}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t('recentScamsTitle')}</h2>
      <div className="space-y-3">
        {reports.map((report) => {
          const isExpanded = expandedId === report.id;
          const hasUpvoted = upvotedIds.has(report.id);
          return (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                      {maskAccountNumber(report.account_number)}
                    </code>
                    <span className="text-xs text-gray-500">{report.bank_name}</span>
                  </div>
                  <span className="inline-block bg-[#008753]/10 text-[#008753] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {SCAM_TYPE_LABELS[report.scam_type] || report.scam_type}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="font-semibold text-gray-700">
                    {report.amount_lost > 0 ? formatNaira(report.amount_lost) : '—'}
                  </span>
                  <span>{formatDate(report.created_at)}</span>
                </div>

                <p className={`text-sm text-gray-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                  {report.description}
                </p>

                {isExpanded && report.business_name && (
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>{t('businessName')}:</strong> {report.business_name}
                  </p>
                )}

                {isExpanded && report.phone_number && (
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>{t('phoneNumber')}:</strong> {report.phone_number}
                  </p>
                )}
              </div>

              <div className="flex items-center border-t border-gray-100">
                <button
                  onClick={() => handleUpvote(report)}
                  disabled={hasUpvoted}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
                    hasUpvoted
                      ? 'text-[#008753] bg-[#008753]/5'
                      : 'text-gray-500 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-[#008753]' : ''}`} />
                  {report.upvotes} {t('confirmedVictims')}
                </button>
                <div className="w-px h-6 bg-gray-200" />
                <button
                  onClick={() => handleShare(report)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  {t('shareOnWhatsApp')}
                </button>
                <div className="w-px h-6 bg-gray-200" />
                <button
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {isExpanded ? t('hideDetails') : t('viewDetails')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
