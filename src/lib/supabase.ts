import { createClient } from '@supabase/supabase-js';

// Fall back to placeholders so the module can be imported on a fresh clone
// (and in tests) without credentials. Real requests will simply fail.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type ScamReport = {
  id: string;
  account_number: string;
  bank_name: string;
  phone_number: string | null;
  business_name: string | null;
  amount_lost: number;
  scam_type: string;
  description: string;
  evidence_url: string | null;
  upvotes: number;
  created_at: string;
};

export type BusinessVerification = {
  id: string;
  business_name: string;
  cac_number: string;
  owner_name: string;
  phone_number: string;
  email: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type ScamType = 'fake_vendor' | 'fake_delivery' | 'romance_scam' | 'investment_scam' | 'other';

export const SCAM_TYPE_LABELS: Record<string, string> = {
  fake_vendor: 'Fake Vendor',
  fake_delivery: 'Fake Delivery',
  romance_scam: 'Romance Scam',
  investment_scam: 'Investment Scam',
  other: 'Other',
};
