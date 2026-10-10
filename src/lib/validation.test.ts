import { describe, it, expect } from 'vitest';
import {
  MAX_EVIDENCE_BYTES,
  isValidAccountNumber,
  isValidPhoneNumber,
  normalizeDigits,
  parseAmount,
  validateBusinessForm,
  validateEvidenceFile,
  validateReportForm,
  isValidCacNumber,
  isValidEmail,
} from './validation';

describe('normalizeDigits', () => {
  it('removes spaces and dashes', () => {
    expect(normalizeDigits('0803 123-4567')).toBe('08031234567');
  });
});

describe('isValidAccountNumber', () => {
  it('accepts exactly 10 digits, with or without spacing', () => {
    expect(isValidAccountNumber('0123456789')).toBe(true);
    expect(isValidAccountNumber('0123 456 789')).toBe(true);
  });

  it.each(['', '12345', '01234567890', 'abcdefghij', '012345678a'])('rejects %j', (value) => {
    expect(isValidAccountNumber(value)).toBe(false);
  });
});

describe('isValidPhoneNumber', () => {
  it.each(['08031234567', '07012345678', '09012345678', '+2348031234567', '2348031234567', '0803 123 4567'])(
    'accepts %s',
    (value) => {
      expect(isValidPhoneNumber(value)).toBe(true);
    }
  );

  it.each(['', '12345', '0803123456', '080312345678', '06031234567', 'phone-number'])('rejects %j', (value) => {
    expect(isValidPhoneNumber(value)).toBe(false);
  });
});

describe('parseAmount', () => {
  it('treats empty input as zero', () => {
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('   ')).toBe(0);
  });

  it('parses valid numbers', () => {
    expect(parseAmount('2500')).toBe(2500);
    expect(parseAmount('99.5')).toBe(99.5);
  });

  it('returns null for negative or non-numeric input', () => {
    expect(parseAmount('-5')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('Infinity')).toBeNull();
  });
});

describe('validateEvidenceFile', () => {
  it('accepts a small image', () => {
    expect(validateEvidenceFile({ type: 'image/png', size: 1024 })).toBeNull();
  });

  it('rejects non-images', () => {
    expect(validateEvidenceFile({ type: 'application/pdf', size: 1024 })).toBe('invalidEvidenceFile');
  });

  it('rejects images over the size limit', () => {
    expect(validateEvidenceFile({ type: 'image/jpeg', size: MAX_EVIDENCE_BYTES + 1 })).toBe('invalidEvidenceFile');
  });
});

describe('validateReportForm', () => {
  const valid = { account_number: '0123456789', phone_number: '', amount_lost: '' };

  it('passes a valid form with optional fields empty', () => {
    expect(validateReportForm(valid)).toBeNull();
  });

  it('flags a bad account number first', () => {
    expect(validateReportForm({ ...valid, account_number: '123', phone_number: 'bad' })).toBe('invalidAccountNumber');
  });

  it('flags a bad phone number only when one is provided', () => {
    expect(validateReportForm({ ...valid, phone_number: '12345' })).toBe('invalidPhoneNumber');
  });

  it('flags a bad amount', () => {
    expect(validateReportForm({ ...valid, amount_lost: '-1' })).toBe('invalidAmount');
  });
});

describe('isValidCacNumber', () => {
  it.each(['RC1234567', 'rc 1234567', 'BN123456', 'IT12345', '1234567'])('accepts %s', (value) => {
    expect(isValidCacNumber(value)).toBe(true);
  });

  it.each(['', 'RC', 'XX1234567', '123', 'RC12345678901'])('rejects %j', (value) => {
    expect(isValidCacNumber(value)).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts normal addresses', () => {
    expect(isValidEmail('owner@shop.ng')).toBe(true);
  });

  it.each(['', 'owner', 'owner@', '@shop.ng', 'owner@shop', 'ow ner@shop.ng'])('rejects %j', (value) => {
    expect(isValidEmail(value)).toBe(false);
  });
});

describe('validateBusinessForm', () => {
  const valid = {
    business_name: 'Honest Stores',
    cac_number: 'RC1234567',
    owner_name: 'Ada Obi',
    phone_number: '08031234567',
    email: 'ada@honest.ng',
    category: 'General Trading',
  };

  it('passes a fully valid form', () => {
    expect(validateBusinessForm(valid)).toBeNull();
  });

  it('flags a bad CAC number, phone and email in that order', () => {
    expect(validateBusinessForm({ ...valid, cac_number: 'nope', phone_number: '1', email: 'x' })).toBe('invalidCacNumber');
    expect(validateBusinessForm({ ...valid, phone_number: '1', email: 'x' })).toBe('invalidPhoneNumber');
    expect(validateBusinessForm({ ...valid, email: 'x' })).toBe('invalidEmail');
  });

  it('flags blank required fields', () => {
    expect(validateBusinessForm({ ...valid, business_name: '   ' })).toBe('errorOccurred');
    expect(validateBusinessForm({ ...valid, category: '' })).toBe('errorOccurred');
  });
});
