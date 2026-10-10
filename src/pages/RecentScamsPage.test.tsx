import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/lib/LanguageContext';
import { translations } from '@/lib/translations';
import { queryBuilder, scamReport } from '@/test/supabaseMock';
import { RecentScamsPage } from './RecentScamsPage';

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock('@/lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase')>();
  return { ...actual, supabase: { from: fromMock } };
});

const t = translations.english;

function renderPage() {
  return render(
    <LanguageProvider>
      <RecentScamsPage />
    </LanguageProvider>
  );
}

const upvoteButton = () => screen.getByRole('button', { name: new RegExp(t.confirmedVictims) });

describe('RecentScamsPage', () => {
  beforeEach(() => {
    fromMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders reports with a masked account number', async () => {
    fromMock.mockReturnValue(queryBuilder({ data: [scamReport('1')], error: null }));
    renderPage();

    expect(await screen.findByText('012*****89')).toBeInTheDocument();
    expect(screen.queryByText('0123456789')).not.toBeInTheDocument();
    expect(screen.getByText('Test Bank')).toBeInTheDocument();
    expect(screen.getByText(/1,000/)).toBeInTheDocument();
  });

  it('shows the empty state when there are no reports', async () => {
    fromMock.mockReturnValue(queryBuilder({ data: [], error: null }));
    renderPage();
    expect(await screen.findByText(t.noScamsYet)).toBeInTheDocument();
  });

  it('shows an error and logs it when loading fails', async () => {
    fromMock.mockReturnValue(queryBuilder({ data: null, error: { message: 'network down' } }));
    renderPage();
    expect(await screen.findByText(t.errorOccurred)).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  it('retries loading when the retry button is clicked', async () => {
    fromMock
      .mockReturnValueOnce(queryBuilder({ data: null, error: { message: 'network down' } }))
      .mockReturnValue(queryBuilder({ data: [scamReport('1')], error: null }));
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: t.retry }));
    expect(await screen.findByText('012*****89')).toBeInTheDocument();
  });

  it('counts an upvote once and disables the button', async () => {
    fromMock.mockReturnValue(queryBuilder({ data: [scamReport('1', { upvotes: 4 })], error: null }));
    renderPage();
    await screen.findByText('012*****89');

    await userEvent.click(upvoteButton());

    await waitFor(() => expect(upvoteButton()).toHaveTextContent('5'));
    expect(upvoteButton()).toBeDisabled();
  });

  it('reverts the upvote when saving it fails', async () => {
    fromMock
      .mockReturnValueOnce(queryBuilder({ data: [scamReport('1', { upvotes: 4 })], error: null }))
      .mockReturnValue(queryBuilder({ data: null, error: { message: 'rls denied' } }));
    renderPage();
    await screen.findByText('012*****89');

    await userEvent.click(upvoteButton());

    await waitFor(() => expect(upvoteButton()).toHaveTextContent('4'));
    expect(upvoteButton()).toBeEnabled();
    expect(console.error).toHaveBeenCalled();
  });

  it('expands and collapses report details', async () => {
    fromMock.mockReturnValue(
      queryBuilder({ data: [scamReport('1', { business_name: 'Fake Store Ltd' })], error: null })
    );
    renderPage();
    await screen.findByText('012*****89');
    expect(screen.queryByText('Fake Store Ltd')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: t.viewDetails }));
    expect(screen.getByText('Fake Store Ltd')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: t.hideDetails }));
    expect(screen.queryByText('Fake Store Ltd')).not.toBeInTheDocument();
  });
});
