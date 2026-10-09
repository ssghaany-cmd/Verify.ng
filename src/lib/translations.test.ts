import { describe, it, expect } from 'vitest';
import { translations } from './translations';

describe('translations', () => {
  it('has the same keys in english and pidgin', () => {
    expect(Object.keys(translations.pidgin).sort()).toEqual(
      Object.keys(translations.english).sort()
    );
  });

  it('has no empty strings', () => {
    for (const lang of Object.values(translations)) {
      for (const [key, value] of Object.entries(lang)) {
        expect(value, key).not.toBe('');
      }
    }
  });
});
