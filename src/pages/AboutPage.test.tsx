import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AboutPage } from './AboutPage';

const FIRST_ANSWER = /VerifyNG is completely free/;
const SECOND_QUESTION = 'Are the reports verified?';
const SECOND_ANSWER = /Use the information as a guide/;

function renderPage(onOpenLegal = vi.fn()) {
  render(
    <LanguageProvider>
      <AboutPage onOpenLegal={onOpenLegal} />
    </LanguageProvider>
  );
  return onOpenLegal;
}

describe('AboutPage', () => {
  it('opens the first FAQ answer by default', () => {
    renderPage();
    expect(screen.getByText(FIRST_ANSWER)).toBeInTheDocument();
    expect(screen.queryByText(SECOND_ANSWER)).not.toBeInTheDocument();
  });

  it('switches FAQ answers and collapses the open one', async () => {
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: SECOND_QUESTION }));
    expect(screen.getByText(SECOND_ANSWER)).toBeInTheDocument();
    expect(screen.queryByText(FIRST_ANSWER)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: SECOND_QUESTION }));
    expect(screen.queryByText(SECOND_ANSWER)).not.toBeInTheDocument();
  });

  it('opens the legal page from the footer link', async () => {
    const onOpenLegal = renderPage();
    await userEvent.click(screen.getByRole('button', { name: /Privacy Policy & Terms of Service/ }));
    expect(onOpenLegal).toHaveBeenCalledTimes(1);
  });

  it('offers email and WhatsApp contact links', () => {
    renderPage();
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href') ?? '');
    expect(hrefs.some((href) => href.startsWith('mailto:'))).toBe(true);
    expect(hrefs.some((href) => href.startsWith('https://wa.me/'))).toBe(true);
  });
});
