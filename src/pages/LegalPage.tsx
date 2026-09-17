import { useState } from 'react';
import { ArrowLeft, ChevronDown, FileText, Shield } from 'lucide-react';

type Section = 'privacy' | 'terms';

export function LegalPage({ onBack }: { onBack: () => void }) {
  const [openSection, setOpenSection] = useState<Section>('privacy');

  return (
    <div className="px-4 py-4 max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-1">Privacy Policy & Terms of Service</h2>
      <p className="text-xs text-gray-400 mb-6">Last updated: September 2026</p>

      <div className="space-y-3">
        {/* PRIVACY POLICY */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setOpenSection(openSection === 'privacy' ? ('' as Section) : 'privacy')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Shield className="w-4 h-4 text-[#008753]" />
              Privacy Policy
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openSection === 'privacy' ? 'rotate-180' : ''}`}
            />
          </button>
          {openSection === 'privacy' && (
            <div className="px-4 pb-5 text-sm text-gray-600 leading-relaxed space-y-4 animate-fade-in">
              <p>
                VerifyNG ("we", "the app") is a community fraud-reporting and business-verification
                service for Nigeria. This policy explains what information passes through the app and
                how it's used.
              </p>

              <div>
                <p className="font-semibold text-gray-800 mb-1">No accounts, no login</p>
                <p>
                  VerifyNG does not require you to create an account or log in. We do not collect your
                  name, your own phone number, or your own email just to use the search feature.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">When you submit a scam report</p>
                <p>
                  A report contains information about the account, phone number, or business you are
                  reporting — not about you as the reporter. Any evidence image you attach is stored to
                  support the report. Reports are shown publicly in the app so others can see them; do
                  not include your own personal details in a report description if you don't want them
                  public.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">When you apply for a verified business badge</p>
                <p>
                  We collect your business name, CAC registration number, owner name, phone number,
                  email, and business category to review your application. This information is used to
                  confirm your business identity and to contact you about your application status — it
                  is not displayed publicly beyond your business name and category once approved.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">Payments</p>
                <p>
                  Badge payments are processed by Monnify, a licensed Nigerian payment provider. Your
                  card, bank transfer, or account details are entered directly into Monnify's secure
                  checkout — VerifyNG never sees or stores your card number or bank login details. We
                  only receive confirmation that a payment succeeded, along with a transaction reference.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">Data storage</p>
                <p>
                  Data submitted through VerifyNG is stored using Supabase, a third-party database
                  provider. We take reasonable steps to keep this data secure, but no online system can
                  be guaranteed 100% secure.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">Your choices</p>
                <p>
                  If you'd like a report or business application you submitted removed, contact us using
                  the details on the About page and we'll review the request.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* TERMS OF SERVICE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setOpenSection(openSection === 'terms' ? ('' as Section) : 'terms')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <FileText className="w-4 h-4 text-[#008753]" />
              Terms of Service
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openSection === 'terms' ? 'rotate-180' : ''}`}
            />
          </button>
          {openSection === 'terms' && (
            <div className="px-4 pb-5 text-sm text-gray-600 leading-relaxed space-y-4 animate-fade-in">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Community-submitted content</p>
                <p>
                  Scam reports on VerifyNG are submitted by members of the public and have not been
                  independently investigated or verified by us. Use them as a guide, not as proof of
                  guilt, and always exercise your own judgment before making or refusing a payment.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">No liability for report accuracy</p>
                <p>
                  We do not guarantee the accuracy of any report, trust score, or verification badge
                  shown in the app. VerifyNG is not liable for any loss arising from reliance on
                  information found here, or from a transaction you enter into with any business or
                  account listed.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">False reports</p>
                <p>
                  Submitting a report you know to be false or malicious is against these Terms.
                  Businesses that believe they've been unfairly reported can apply for a verified badge
                  to help establish trust.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">Verified badge fee</p>
                <p>
                  The badge fee is charged before your application is reviewed and is non-refundable
                  once payment is confirmed, regardless of the outcome of the review, since it covers the
                  cost of manual review. Approved badges are valid for one year from approval and must be
                  renewed to remain active.
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">Changes to these terms</p>
                <p>
                  We may update these Terms and this Privacy Policy from time to time as the app evolves.
                  Continued use of VerifyNG after a change means you accept the updated terms.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
                                                                                }
