import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/lib/LanguageContext';
import { translations } from '@/lib/translations';
import { HomePage } from './HomePage';

type QueryResult = { data: unknown; error: unknown };

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock('@/lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase')>();
  return { ...actual, supabase: { from: fromMock } };
});

/** Chainable, awaitable stand-in for a Supabase query builder. */
function queryBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'ilike', 'order']) {
    builder[method] = vi.fn(() => builder);
  }
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));
  builder.then = (resolve: (v: QueryResult) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}

const t = translations.english;

function renderPage() {
  return render(
    <LanguageProvider>
      <HomePage />
    </LanguageProvider>
  );
}

const report = (id: string) => ({
  id,
  account_number: '0123456789',
  bank_name: 'Test Bank',
  phone_number: null,
  business_name: null,
  amount_lost: 1000,
  scam_type: 'fake_vendor',
  description: 'did not deliver',
  evidence_url: null,
  upvotes: 0,
  created_at: '2026-09-10T10:00:00Z',
});

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
