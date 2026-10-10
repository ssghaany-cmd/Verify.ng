import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/lib/LanguageContext';
import { translations } from '@/lib/translations';
import { queryBuilder, scamReport } from '@/test/supabaseMock';
import { HomePage } from './HomePage';

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock('@/lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase')>();
  return { ...actual, supabase: { from: fromMock } };
});

const t = translations.english;

function renderPage() {
  return render(
    <LanguageProvider>
      <HomePage />
    </LanguageProvider>
  );
}

const report = scamReport;

describe('HomePage search', () => {
  beforeEach(() => {
    fromMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('disables the search button until something is typed', () => {
    renderPage();
    expect(screen.getByRole('button', { name: t.searchButton })).toBeDisabled();
  });

  it('renders a TrustScoreCard with the report count on success', async () => {
    fromMock.mockImplementation((table: string) =>
      table === 'scam_reports'
        ? queryBuilder({ data: [report('1'), report('2'), report('3')], error: null })
        : queryBuilder({ data: null, error: null })
    );

    renderPage();
    await userEvent.type(screen.getByPlaceholderText(t.searchPlaceholder), '0123456789');
    await userEvent.click(screen.getByRole('button', { name: t.searchButton }));

    expect(await screen.findByText(t.searchResults)).toBeInTheDocument();
    expect(screen.getByText(t.highRisk)).toBeInTheDocument();
    expect(screen.queryByText(t.errorOccurred)).not.toBeInTheDocument();
  });

  it('shows the safe state when no reports exist', async () => {
    fromMock.mockImplementation(() => queryBuilder({ data: [], error: null }));

    renderPage();
    await userEvent.type(screen.getByPlaceholderText(t.searchPlaceholder), 'Honest Stores');
    await userEvent.click(screen.getByRole('button', { name: t.searchButton }));

    expect(await screen.findByText(t.verifiedSafe)).toBeInTheDocument();
  });

  it('shows the error banner and logs when the query fails', async () => {
    fromMock.mockImplementation(() =>
      queryBuilder({ data: null, error: { message: 'network down' } })
    );

    renderPage();
    await userEvent.type(screen.getByPlaceholderText(t.searchPlaceholder), '0123456789');
    await userEvent.click(screen.getByRole('button', { name: t.searchButton }));

    expect(await screen.findByText(t.errorOccurred)).toBeInTheDocument();
    expect(screen.queryByText(t.searchResults)).not.toBeInTheDocument();
    await waitFor(() => expect(console.error).toHaveBeenCalled());
  });
});
