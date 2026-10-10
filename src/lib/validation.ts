import type { TranslationKey } from './translations';

export const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Strip spaces and dashes users commonly type into numbers. */
export function normalizeDigits(value: string): string {
  return value.replace(/[\s-]/g, '');
}

/** Nigerian bank account numbers (NUBAN) are exactly 10 digits. */
export function isValidAccountNumber(value: string): boolean {
  return /^\d{10}$/.test(normalizeDigits(value));
}

/** Nigerian mobile: 0803..., 0703..., 0903... or the +234/234 international form. */
export function isValidPhoneNumber(value: string): boolean {
  return /^(?:0|\+?234)[789][01]\d{8}$/.test(normalizeDigits(value));
}

/** Empty means "not provided" (0). Returns null for negative or non-numeric input. */
export function parseAmount(value: string): number | null {
  if (value.trim() === '') return 0;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
}

export function validateEvidenceFile(file: Pick<File, 'type' | 'size'>): TranslationKey | null {
  if (!file.type.startsWith('image/') || file.size > MAX_EVIDENCE_BYTES) {
    return 'invalidEvidenceFile';
  }
  return null;
}

/** Nigerian CAC numbers look like RC1234567, BN1234567 or IT12345 (prefix optional). */
export function isValidCacNumber(value: string): boolean {
  return /^(?:RC|BN|IT|LP|LLP)?-?\d{4,8}$/i.test(normalizeDigits(value));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export type BusinessFormValues = {
  business_name: string;
  cac_number: string;
  owner_name: string;
  phone_number: string;
  email: string;
  category: string;
};

/** Returns the translation key of the first problem found, or null when valid. */
export function validateBusinessForm(form: BusinessFormValues): TranslationKey | null {
  if (!form.business_name.trim() || !form.owner_name.trim() || !form.category) return 'errorOccurred';
  if (!isValidCacNumber(form.cac_number)) return 'invalidCacNumber';
  if (!isValidPhoneNumber(form.phone_number)) return 'invalidPhoneNumber';
  if (!isValidEmail(form.email)) return 'invalidEmail';
  return null;
}

export type ReportFormValues = {
  account_number: string;
  phone_number: string;
  amount_lost: string;
};

/** Returns the translation key of the first problem found, or null when valid. */
export function validateReportForm(form: ReportFormValues): TranslationKey | null {
  if (!isValidAccountNumber(form.account_number)) return 'invalidAccountNumber';
  if (form.phone_number.trim() !== '' && !isValidPhoneNumber(form.phone_number)) {
    return 'invalidPhoneNumber';
  }
  if (parseAmount(form.amount_lost) === null) return 'invalidAmount';
  return null;
}
