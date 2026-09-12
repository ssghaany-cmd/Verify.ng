import { useState, useRef } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { supabase, type ScamType } from '@/lib/supabase';
import { NIGERIAN_BANKS } from '@/lib/banks';
import { SCAM_TYPE_LABELS } from '@/lib/supabase';

export function ReportScamPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    account_number: '',
    bank_name: '',
    phone_number: '',
    business_name: '',
    amount_lost: '',
    scam_type: '',
    description: '',
  });
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidenceFile(file);
    const reader = new FileReader();
    reader.onload = () => setEvidencePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setEvidenceFile(null);
    setEvidencePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_number || !form.bank_name || !form.scam_type || !form.description) return;

    setSubmitting(true);
    setError(false);

    try {
      let evidenceUrl: string | null = null;

      if (evidenceFile) {
        const fileName = `evidence/${Date.now()}-${evidenceFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(fileName, evidenceFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('evidence').getPublicUrl(fileName);
          evidenceUrl = urlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase.from('scam_reports').insert({
        account_number: form.account_number,
        bank_name: form.bank_name,
        phone_number: form.phone_number || null,
        business_name: form.business_name || null,
        amount_lost: form.amount_lost ? parseFloat(form.amount_lost) : 0,
        scam_type: form.scam_type,
        description: form.description,
        evidence_url: evidenceUrl,
      });

      if (insertError) throw insertError;

      setSubmitted(true);
      setForm({
        account_number: '',
        bank_name: '',
        phone_number: '',
        business_name: '',
        amount_lost: '',
        scam_type: '',
        description: '',
      });
      removeFile();
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('reportSubmitted')}</h2>
        <p className="text-sm text-gray-500 mb-6 px-4">{t('reportSubmittedDesc')}</p>
        <button
          onClick={() => setSubmitted(false)}
          className="bg-[#008753] hover:bg-[#007045] active:scale-95 transition-all text-white font-bold px-6 py-3 rounded-2xl text-sm"
        >
          {t('reportAnother')}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{t('reportScamTitle')}</h2>
        <p className="text-sm text-gray-500">{t('disclaimerText')}</p>
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
            {t('accountNumber')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.account_number}
            onChange={(e) => handleChange('account_number', e.target.value)}
            placeholder={t('enterAccountNumber')}
            required
            inputMode="numeric"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t('bankName')} <span className="text-red-500">*</span>
          </label>
          <select
            value={form.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          >
            <option value="">{t('selectBank')}</option>
            {NIGERIAN_BANKS.map((bank) => (
              <option key={bank} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('phoneNumber')}</label>
          <input
            type="tel"
            value={form.phone_number}
            onChange={(e) => handleChange('phone_number', e.target.value)}
            placeholder={t('enterPhoneNumber')}
            inputMode="tel"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('businessName')}</label>
          <input
            type="text"
            value={form.business_name}
            onChange={(e) => handleChange('business_name', e.target.value)}
            placeholder={t('enterBusinessName')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('amountLost')}</label>
          <input
            type="number"
            value={form.amount_lost}
            onChange={(e) => handleChange('amount_lost', e.target.value)}
            placeholder="0"
            inputMode="numeric"
            min="0"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t('howScamHappened')} <span className="text-red-500">*</span>
          </label>
          <select
            value={form.scam_type}
            onChange={(e) => handleChange('scam_type', e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white"
          >
            <option value="">{t('selectScamType')}</option>
            {(Object.keys(SCAM_TYPE_LABELS) as ScamType[]).map((key) => (
              <option key={key} value={key}>{SCAM_TYPE_LABELS[key]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {t('description')} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#008753] focus:outline-none text-sm bg-white resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('uploadEvidence')}</label>
          {evidencePreview ? (
            <div className="relative rounded-xl border-2 border-gray-200 overflow-hidden">
              <img src={evidencePreview} alt="Evidence" className="w-full max-h-48 object-cover" />
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-6 text-gray-400 hover:border-[#008753] hover:text-[#008753] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-xs">{t('uploadEvidence')}</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
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
            t('submitReport')
          )}
        </button>
      </form>
    </div>
  );
}
