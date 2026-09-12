import { useState } from 'react';
import { Search, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase, type ScamReport, type BusinessVerification } from '@/lib/supabase';
import { calculateTrustScore } from '@/lib/trustScore';
import { TrustScoreCard } from '@/components/TrustScoreCard';

type SearchResult = {
  reports: ScamReport[];
  business: BusinessVerification | null;
  identifier: string;
  bankName?: string;
};

export function HomePage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(false);
    setResult(null);
    setSearched(true);

    try {
      const isNumeric = /^\d+$/.test(trimmed);
      const isAccountNumber = isNumeric && trimmed.length >= 10;

      let reportsQuery = supabase.from('scam_reports').select('*');
      if (isAccountNumber) {
        reportsQuery = reportsQuery.eq('account_number', trimmed);
      } else if (isNumeric) {
        reportsQuery = reportsQuery.eq('phone_number', trimmed);
      } else {
        reportsQuery = reportsQuery.ilike('business_name', `%${trimmed.toLowerCase()}%`);
      }
      reportsQuery = reportsQuery.order('created_at', { ascending: false });

      const { data: reports, error: reportsError } = await reportsQuery;

      let businessData: BusinessVerification | null = null;
      if (!reportsError) {
        let businessQuery = supabase.from('business_verifications').select('*').eq('status', 'approved');
        if (isNumeric) {
          businessQuery = businessQuery.eq('phone_number', trimmed);
        } else {
          businessQuery = businessQuery.ilike('business_name', `%${trimmed.toLowerCase()}%`);
        }
        const { data: business, error: businessError } = await businessQuery.maybeSingle();
        if (businessError) throw businessError;
        businessData = business as BusinessVerification | null;
      }

      if (reportsError) throw reportsError;

      const reportList = (reports || []) as ScamReport[];
      const bankName = reportList[0]?.bank_name;

      setResult({
        reports: reportList,
        business: businessData,
        identifier: trimmed,
        bankName,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const trustScore = result ? calculateTrustScore(result.reports.length) : null;

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      {/* Hero */}
      <div className="text-center pt-6 pb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#008753]/10 mb-3">
          <ShieldCheck className="w-8 h-8 text-[#008753]" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('verifyBeforeYouPay')}</h2>
        <p className="text-sm text-gray-500">
          {t('searchPlaceholder')}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white shadow-sm"
            inputMode="text"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="w-full bg-[#008753] hover:bg-[#007045] disabled:bg-gray-300 active:scale-[0.98] transition-all text-white font-bold py-3.5 rounded-2xl text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('searching')}
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              {t('searchButton')}
            </>
          )}
        </button>
      </form>

      {/* Results */}
      {searched && !loading && !error && trustScore && result && (
        <div className="mt-6 animate-fade-in">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{t('searchResults')}</p>
          <TrustScoreCard
            level={trustScore.level}
            reportCount={trustScore.reportCount}
            reports={result.reports}
            accountIdentifier={result.identifier}
            bankName={result.bankName}
            isVerifiedBusiness={result.business?.status === 'approved'}
            businessName={result.business?.business_name}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {t('errorOccurred')}
        </div>
      )}

      {/* Disclaimer */}
      {!searched && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xs text-yellow-800 leading-relaxed">
            <strong>{t('disclaimer')}:</strong> {t('disclaimerText')}
          </p>
        </div>
      )}
    </div>
  );
}
