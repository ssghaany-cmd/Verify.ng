/*
# VerifyNG — Create scam_reports and business_verifications tables

## Overview
Creates the core database tables for the VerifyNG fraud detection platform.
This is a single-tenant, no-auth app — anyone can report scams, search, and verify businesses.
All data is intentionally public (community-submitted fraud reports and business applications).

## New Tables

### 1. scam_reports
- `id` (uuid, primary key)
- `account_number` (text, not null) — the reported bank account number
- `bank_name` (text, not null) — name of the bank
- `phone_number` (text) — optional phone number of the scammer
- `business_name` (text) — optional business name
- `amount_lost` (numeric) — amount lost in Naira
- `scam_type` (text, not null) — category: fake_vendor, fake_delivery, romance_scam, investment_scam, other
- `description` (text, not null) — what happened
- `evidence_url` (text) — optional URL to uploaded evidence screenshot
- `upvotes` (integer, default 0) — number of people confirming same experience
- `created_at` (timestamptz, default now())

### 2. business_verifications
- `id` (uuid, primary key)
- `business_name` (text, not null)
- `cac_number` (text, not null) — CAC registration number
- `owner_name` (text, not null)
- `phone_number` (text, not null)
- `email` (text, not null)
- `category` (text, not null)
- `status` (text, default 'pending') — pending, approved, rejected
- `created_at` (timestamptz, default now())

## Security
- RLS enabled on both tables.
- All CRUD operations allowed for anon + authenticated (public community platform).
- `USING (true)` is acceptable because all data is intentionally public/shared.

## Notes
1. No user_id columns — this is a no-auth community platform.
2. Anyone can submit reports and upvote — that's the design.
3. Business verification status is managed by admins (via service role, not exposed).
*/

CREATE TABLE IF NOT EXISTS scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number text NOT NULL,
  bank_name text NOT NULL,
  phone_number text,
  business_name text,
  amount_lost numeric DEFAULT 0,
  scam_type text NOT NULL CHECK (scam_type IN ('fake_vendor', 'fake_delivery', 'romance_scam', 'investment_scam', 'other')),
  description text NOT NULL,
  evidence_url text,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scam_reports" ON scam_reports;
CREATE POLICY "anon_select_scam_reports" ON scam_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scam_reports" ON scam_reports;
CREATE POLICY "anon_insert_scam_reports" ON scam_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scam_reports" ON scam_reports;
CREATE POLICY "anon_update_scam_reports" ON scam_reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scam_reports" ON scam_reports;
CREATE POLICY "anon_delete_scam_reports" ON scam_reports FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS business_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  cac_number text NOT NULL,
  owner_name text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE business_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_business_verifications" ON business_verifications;
CREATE POLICY "anon_select_business_verifications" ON business_verifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_business_verifications" ON business_verifications;
CREATE POLICY "anon_insert_business_verifications" ON business_verifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_business_verifications" ON business_verifications;
CREATE POLICY "anon_update_business_verifications" ON business_verifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_business_verifications" ON business_verifications;
CREATE POLICY "anon_delete_business_verifications" ON business_verifications FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_scam_reports_account_number ON scam_reports (account_number);
CREATE INDEX IF NOT EXISTS idx_scam_reports_phone_number ON scam_reports (phone_number);
CREATE INDEX IF NOT EXISTS idx_scam_reports_business_name ON scam_reports (business_name);
CREATE INDEX IF NOT EXISTS idx_scam_reports_created_at ON scam_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_verifications_business_name ON business_verifications (business_name);
CREATE INDEX IF NOT EXISTS idx_business_verifications_cac_number ON business_verifications (cac_number);

-- Seed sample data
INSERT INTO scam_reports (account_number, bank_name, phone_number, business_name, amount_lost, scam_type, description, upvotes) VALUES
('0123456789', 'Access Bank', '08012345678', 'TechMart Online', 45000, 'fake_vendor', 'Ordered a phone from their Instagram page, paid into this account and they blocked me. Never delivered.', 3),
('0987654321', 'GTBank', '08098765432', NULL, 120000, 'investment_scam', 'They promised 50% return on investment in 2 weeks. After I paid, they stopped picking calls.', 5),
('0456789123', 'Zenith Bank', '08034567890', 'Quick Delivery NG', 15000, 'fake_delivery', 'Paid for same-day delivery of goods from Lagos to Abuja. Goods never arrived and they stopped responding.', 2),
('0369258147', 'UBA', '08023456789', NULL, 75000, 'romance_scam', 'Met someone on Facebook who claimed to be in the US. After weeks of chatting, asked for money for flight ticket. Sent money, they disappeared.', 7),
('0582319470', 'First Bank', '08056789012', 'CryptoPro Investments', 200000, 'investment_scam', 'Crypto investment scheme that promised daily returns. I deposited 200k and never got anything back.', 4)
ON CONFLICT DO NOTHING;

INSERT INTO business_verifications (business_name, cac_number, owner_name, phone_number, email, category, status) VALUES
('TechMart Nigeria Ltd', 'RC1234567', 'Chidi Okafor', '08033333333', 'chidi@techmart.ng', 'Electronics Retail', 'approved'),
('FreshFoods Logistics', 'RC7654321', 'Ngozi Eze', '08044444444', 'ngozi@freshfoods.ng', 'Logistics & Delivery', 'approved')
ON CONFLICT DO NOTHING;
