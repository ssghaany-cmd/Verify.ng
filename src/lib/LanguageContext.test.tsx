import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { translations } from './translations';

function Probe() {
  const { language, toggleLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="message">{t('errorOccurred')}</span>
      <button onClick={toggleLanguage}>toggle</button>
    </div>
  );
}

describe('LanguageProvider', () => {
  it('defaults to english and switches to pidgin and back', async () => {
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>
    );
    expect(screen.getByTestId('language')).toHaveTextContent('english');
    expect(screen.getByTestId('message')).toHaveTextContent(translations.english.errorOccurred);

    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('language')).toHaveTextContent('pidgin');
    expect(screen.getByTestId('message')).toHaveTextContent(translations.pidgin.errorOccurred);

    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('language')).toHaveTextContent('english');
  });

  it('throws a helpful error when used outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow('useLanguage must be used within LanguageProvider');
    vi.restoreAllMocks();
  });
});
