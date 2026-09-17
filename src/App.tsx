import { useState } from 'react';
import { ShieldCheck, Search, AlertCircle, BadgeCheck, ChevronDown, Info, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

const FAQ_ITEMS = [
  {
    q: 'Is VerifyNG free to use?',
    a: 'Yes, VerifyNG is completely free. You can search, report, and verify businesses at no cost.',
  },
  {
    q: 'Are the reports verified?',
    a: 'No. All reports are community-submitted and have not been independently verified. Use the information as a guide and always exercise caution.',
  },
  {
    q: 'Can someone report my account falsely?',
    a: 'While anyone can submit a report, multiple upvotes from different users indicate a pattern. If your account was falsely reported, you can apply for business verification to show a green badge.',
  },
  {
    q: 'How does the Trust Score work?',
    a: 'The Trust Score is based on the number of reports against an account: 0 reports = Verified Safe (green), 1-2 = Caution (yellow), 3-5 = High Risk (orange), 6+ = Danger (red).',
  },
  {
    q: 'How do I get a verified business badge?',
    a: 'Go to the Verify Business tab, fill in your CAC registration number and business details, and submit. We will review your application within 5 business days.',
  },
  {
    q: 'Does VerifyNG work offline?',
    a: 'Yes! Once installed, VerifyNG can show cached results when you are offline. New searches and reports require an internet connection.',
  },
  {
    q: 'Is my personal information stored?',
    a: 'VerifyNG does not require login. The information you submit in reports (account numbers, phone numbers) is visible to the community to help others stay safe.',
  },
];

export function AboutPage({ onOpenLegal }: { onOpenLegal: () => void }) {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    { icon: Search, title: 'Search', desc: 'Enter a bank account number, phone number, or business name to check if it has been reported.' },
    { icon: AlertCircle, title: 'Report', desc: 'If you have been scammed, report the account to warn others in the community.' },
    { icon: BadgeCheck, title: 'Verify', desc: 'Legitimate businesses can apply for a verified badge to show they are trusted.' },
    { icon: ShieldCheck, title: 'Stay Safe', desc: 'Check before you pay. Share reports with friends and family via WhatsApp.' },
  ];

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      {/* About */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#008753]/10 mb-3">
          <ShieldCheck className="w-8 h-8 text-[#008753]" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('aboutTitle')}</h2>
        <p className="text-sm text-gray-500 leading-relaxed px-4">
          VerifyNG is a community-driven fraud detection platform built to protect Nigerians from scams.
          Search any bank account, phone number, or business before you make a payment. If you have been scammed,
          report it to warn others. Together we can fight fraud.
        </p>
      </div>

      {/* How it works */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#008753]" />
          {t('howItWorks')}
        </h3>
        <div className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-gray-200 p-4">
                <div className="w-10 h-10 rounded-lg bg-[#008753]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#008753]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Score Legend */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#008753]" />
          {t('trustScore')}
        </h3>
        <div className="space-y-2">
          {[
            { color: 'bg-green-500', label: t('verifiedSafe'), desc: '0 reports' },
            { color: 'bg-yellow-500', label: t('caution'), desc: '1-2 reports' },
            { color: 'bg-orange-500', label: t('highRisk'), desc: '3-5 reports' },
            { color: 'bg-red-500', label: t('danger'), desc: '6+ reports' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3">
              <span className={`w-4 h-4 rounded-full ${item.color} shrink-0`} />
              <span className="text-sm font-semibold text-gray-700 flex-1">{item.label}</span>
              <span className="text-xs text-gray-400">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#008753]" />
          {t('faq')}
        </h3>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-900 flex-1 pr-2">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed animate-fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
        <p className="text-xs text-yellow-800 leading-relaxed">
          <strong>{t('disclaimer')}:</strong> {t('disclaimerText')}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center pb-4">
        <button onClick={onOpenLegal} className="text-xs font-semibold text-[#008753] underline">
          Privacy Policy & Terms of Service
        </button>
        <p className="text-xs text-gray-400 mt-3">VerifyNG &copy; 2026</p>
        <p className="text-xs text-gray-400 mt-1">Made with care for Nigeria</p>
      </div>
    </div>
  );
          }
