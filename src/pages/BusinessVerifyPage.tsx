import { useState } from 'react';
import { BadgeCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase } from '@/lib/supabase';

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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const { error: insertError } = await supabase.from('business_verifications').insert({
        business_name: form.business_name,
        cac_number: form.cac_number,
        owner_name: form.owner_name,
        phone_number: form.phone_number,
        email: form.email,
        category: form.category,
      });
      if (insertError) throw insertError;
      setSubmitted(true);
      setForm({ business_name: '', cac_number: '', owner_name: '', phone_number: '', email: '', category: '' });
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
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
            onClick={() => setSubmitted(false)}
            className="bg-[#008753] hover:bg-[#007045] active:scale-95 transition-all text-white font-bold px-6 py-3 rounded-2xl text-sm"
          >
            {t('submitAnother')}
          </button>
        </div>
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

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {t('errorOccurred')}
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
          disabled={submitting}
          className="w-full bg-[#008753] hover:bg-[#007045] disabled:bg-gray-300 active:scale-[0.98] transition-all text-white font-bold py-3.5 rounded-2xl text-base flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('loading')}
            </>
          ) : (
            t('submitApplication')
          )}
        </button>
      </form>
    </div>
  );
}
