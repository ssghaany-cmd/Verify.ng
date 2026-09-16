import { useState } from 'react';
import { BadgeCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabase';
import { BADGE_FEE_NAIRA, MONNIFY_API_KEY, MONNIFY_CONTRACT_CODE } from '@/lib/config';

declare global {
  interface Window {
    MonnifySDK: any;
  }
}

const BUSINESS_CATEGORIES = [
  'Electronics Retail',
  'Fashion & Clothing',
  'Food & Restaurants',
  'Logistics & Delivery',
  'Health & Beauty',
  'Real Estate',
  'Financial Services',
  'Education & Training',
  'Agriculture',
  'Technology & Software',
  'Automotive',
  'General Trading',
  'Other',
];

type Stage = 'form' | 'paying' | 'verifying' | 'done' | 'payment_failed';

export function BusinessVerifyPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    business_name: '',
    cac_number: '',
    owner_name: '',
    phone_number: '',
    email: '',
    category: '',
  });
  const [stage, setStage] = useState<Stage>('form');
  const [error, setError] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({ business_name: '', cac_number: '', owner_name: '', phone_number: '', email: '', category: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setStage('paying');

    try {
      const { data: inserted, error: insertError } = await supabase
        .from('business_verifications')
        .insert({
          business_name: form.business_name,
          cac_number: form.cac_number,
          owner_name: form.owner_name,
          phone_number: form.phone_number,
          email: form.email,
          category: form.category,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      const verificationId = inserted.id as string;

      window.MonnifySDK.initialize({
        amount: BADGE_FEE_NAIRA,
        currency: 'NGN',
        reference: `verifyng_${verificationId}_${Date.now()}`,
        customerFullName: form.owner_name,
        customerEmail: form.email,
        apiKey: MONNIFY_API_KEY,
        contractCode: MONNIFY_CONTRACT_CODE,
        paymentDescription: 'VerifyNG Business Verification Badge',
        onComplete: (response: { transactionReference: string; paymentStatus?: string; status?: string }) => {
          const status = response.paymentStatus ?? response.status;
          if (status === 'PAID' || status === 'SUCCESS') {
            void finalizePayment(response.transactionReference, verificationId);
          } else {
            setStage('payment_failed');
          }
        },
        onClose: () => {
          setStage('payment_failed');
        },
      });
    } catch {
      setError(true);
      setStage('form');
    }
  };

  const finalizePayment = async (transactionReference: string, verificationId: string) => {
    setStage('verifying');
    try {
      const { error: fnError } = await supabase.functions.invoke('verify-payment', {
        body: { transaction_reference: transactionReference, verification_id: verificationId },
      });
      if (fnError) throw fnError;
      setStage('done');
      resetForm();
    } catch {
      setStage('payment_failed');
    }
  };

  if (stage === 'done') {
    return (
      <div className="px-4 py-8 max-w-lg mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('applicationReceived')}</h2>
        <p className="text-sm text-gray-500 mb-6 px-4">{t('applicationReceivedDesc')}</p>
        <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-sm font-semibold text-yellow-700">{t('pending')}</span>
        </div>
        <div>
          <button
            onClick={() => setStage('form')}
            className="bg-[#008753] hover:bg-[#007045] active:scale-95 transition-all text-white font-bold px-6 py-3 rounded-2xl text-sm"
          >
            {t('submitAnother')}
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'verifying') {
    return (
      <div className="px-4 py-16 max-w-lg mx-auto text-center">
        <Loader2 className="w-10 h-10 text-[#008753] animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600">{t('verifyingPayment')}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="mb-6 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#008753]/10 flex items-center justify-center shrink-0">
          <BadgeCheck className="w-7 h-7 text-[#008753]" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('verifyBusinessTitle')}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Get a green verified badge on your business search results.
          </p>
        </div>
      </div>

      <div className="mb-4 bg-[#008753]/5 border border-[#008753]/20 rounded-xl p-3 text-sm text-gray-700">
        {t('badgeFeeNote').replace('{amount}', BADGE_FEE_NAIRA.toLocaleString())}
      </div>

      {(error || stage === 'payment_failed') && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {stage === 'payment_failed' ? t('paymentCancelled') : t('errorOccurred')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t('businessName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.business_name}
            onChange={(e) => handleChange('business_name', e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t('cacNumber')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.cac_number}
            onChange={(e) => handleChange('cac_number', e.target.value)}
            required
            placeholder="RC1234567"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t('ownerName')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.owner_name}
            onChange={(e) => handleChange('owner_name', e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t('phoneNumber')} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.phone_number}
            onChange={(e) => handleChange('phone_number', e.target.value)}
            required
            inputMode="tel"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t('email')} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            inputMode="email"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t('businessCategory')} <span className="text-red-500">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          >
            <option value="">Select category</option>
            {BUSINESS_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={stage === 'paying'}
          className="w-full bg-[#008753] hover:bg-[#007045] disabled:bg-gray-300 active:scale-[0.98] transition-all text-white font-bold py-3.5 rounded-2xl text-base flex items-center justify-center gap-2"
        >
          {stage === 'paying' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('loading')}
            </>
          ) : (
            t('payNow')
          )}
        </button>
      </form>
    </div>
  );
      }
