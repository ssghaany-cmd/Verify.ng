import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MODEL,
  GEMINI_BASE_URL,
  SYSTEM_PROMPT,
  buildUserMessage,
  callGemini,
  createRateLimiter,
  extractIdentifiers,
  extractKeywords,
  phoneVariants,
  type ReportRow,
} from './askAI.ts';

const report = (overrides: Partial<ReportRow> = {}): ReportRow => ({
  account_number: '0123456789',
  bank_name: 'GTBank',
  phone_number: null,
  business_name: 'X Store',
  amount_lost: 5000,
  scam_type: 'fake_vendor',
  description: 'Paid and nothing arrived',
  upvotes: 3,
  created_at: '2026-09-10T10:00:00Z',
  ...overrides,
});

describe('extractIdentifiers', () => {
  it('finds a 10-digit account number and Nigerian phone numbers in different formats', () => {
    const result = extractIdentifiers('Is 0123456789 ok? Also 0803 123 4567 and +2348031234567');
    expect(result.accounts).toEqual(['0123456789']);
    expect(result.phones).toEqual(['08031234567', '+2348031234567']);
  });

  it('does not treat other digit runs as account numbers', () => {
    expect(extractIdentifiers('order 12345 or 01234567890')).toEqual({ accounts: [], phones: [] });
  });

  it('removes duplicates', () => {
    expect(extractIdentifiers('0123456789 and 0123 456 789').accounts).toEqual(['0123456789']);
  });
});

describe('phoneVariants', () => {
  it('returns local, international and plus forms from either input', () => {
    const expected = ['08031234567', '2348031234567', '+2348031234567'];
    expect(phoneVariants('08031234567')).toEqual(expected);
    expect(phoneVariants('+2348031234567')).toEqual(expected);
  });
});

describe('extractKeywords', () => {
  it('keeps up to four meaningful lowercase words and drops filler words', () => {
    expect(extractKeywords('Is Honest Stores Lagos a trustworthy seller on instagram?')).toEqual([
      'honest',
      'stores',
      'lagos',
      'trustworthy',
    ]);
  });

  it('returns only plain letters so the words are safe in a database filter', () => {
    for (const word of extractKeywords("x'; drop table (reports),.%* storefront")) {
      expect(word).toMatch(/^[a-z]+$/);
    }
  });
});

describe('buildUserMessage', () => {
  it('masks account numbers and includes the question', () => {
    const message = buildUserMessage('Is X Store ok?', [report()]);
    expect(message).toContain('012*****89');
    expect(message).not.toContain('0123456789');
    expect(message).toContain('User question: Is X Store ok?');
    expect(message).toContain('<reports count="1">');
  });

  it('truncates long descriptions and collapses whitespace', () => {
    const message = buildUserMessage('q', [report({ description: `line one\n\n${'a'.repeat(1000)}` })]);
    expect(message).toContain('line one a');
    expect(message.length).toBeLessThan(700);
  });

  it('says so when nothing matched', () => {
    expect(buildUserMessage('q', [])).toContain('(no matching reports)');
  });

  it('caps the number of reports sent to the model', () => {
    const many = Array.from({ length: 50 }, () => report());
    expect(buildUserMessage('q', many)).toContain('<reports count="20">');
  });
});

describe('callGemini', () => {
  const reply = (body: unknown, ok = true, status = 200) => async () => ({ ok, status, json: async () => body });

  it('sends the key, system instruction and message, then joins the text parts', async () => {
    let seen: { url: string; headers: Record<string, string>; body: Record<string, unknown> } | undefined;
    const answer = await callGemini({
      apiKey: 'secret-key',
      userMessage: 'hello',
      fetchImpl: async (url, init) => {
        seen = { url, headers: init.headers, body: JSON.parse(init.body) };
        return {
          ok: true,
          status: 200,
          json: async () => ({ candidates: [{ content: { parts: [{ text: 'Hi ' }, { text: 'there' }] } }] }),
        };
      },
    });

    expect(answer).toBe('Hi there');
    expect(seen?.url).toBe(`${GEMINI_BASE_URL}/${DEFAULT_MODEL}:generateContent`);
    expect(seen?.headers['x-goog-api-key']).toBe('secret-key');
    expect(seen?.body).toEqual(
      expect.objectContaining({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: 'hello' }] }],
      })
    );
  });

  it('uses a custom model name when given', async () => {
    let url = '';
    await callGemini({
      apiKey: 'k',
      model: 'gemini-test',
      userMessage: 'x',
      fetchImpl: async (u) => {
        url = u;
        return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] }) };
      },
    });
    expect(url).toBe(`${GEMINI_BASE_URL}/gemini-test:generateContent`);
  });

  it('throws when the API responds with an error status', async () => {
    await expect(callGemini({ apiKey: 'k', userMessage: 'x', fetchImpl: reply({}, false, 429) })).rejects.toThrow('429');
  });

  it('throws when the prompt was blocked', async () => {
    await expect(
      callGemini({ apiKey: 'k', userMessage: 'x', fetchImpl: reply({ promptFeedback: { blockReason: 'SAFETY' } }) })
    ).rejects.toThrow('SAFETY');
  });

  it('throws when the reply has no text', async () => {
    await expect(
      callGemini({ apiKey: 'k', userMessage: 'x', fetchImpl: reply({ candidates: [{ content: { parts: [] } }] }) })
    ).rejects.toThrow('empty');
  });
});

describe('createRateLimiter', () => {
  it('blocks after the limit and allows again once the window passes', () => {
    let now = 0;
    const allow = createRateLimiter(2, 1000, () => now);

    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(true);
    expect(allow('a')).toBe(false);
    expect(allow('b')).toBe(true); // separate visitor

    now = 1500;
    expect(allow('a')).toBe(true);
  });
});
