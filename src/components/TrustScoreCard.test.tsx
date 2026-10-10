import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/lib/LanguageContext';
import { translations } from '@/lib/translations';
import type { ScamReport } from '@/lib/supabase';
import { scamReport } from '@/test/supabaseMock';
import { TrustScoreCard } from './TrustScoreCard';

const t = translations.english;

function renderCard(props: Partial<React.ComponentProps<typeof TrustScoreCard>> = {}) {
  return render(
    <LanguageProvider>
      <TrustScoreCard
        level="caution"
        reportCount={2}
        reports={[scamReport('1'), scamReport('2')] as ScamReport[]}
        accountIdentifier="0123456789"
        bankName="Test Bank"
        {...props}
      />
    </LanguageProvider>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TrustScoreCard', () => {
  it('shows the level label, count and identifier', () => {
    renderCard({ level: 'danger', reportCount: 7 });
    expect(screen.getByText(t.danger)).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('0123456789')).toBeInTheDocument();
  });

  it('shows the verified business badge only when verified', () => {
    const { unmount } = renderCard({ isVerifiedBusiness: true, businessName: 'Honest Stores' });
    expect(screen.getByText(/Honest Stores/)).toBeInTheDocument();
    unmount();

    renderCard({ isVerifiedBusiness: false, businessName: 'Honest Stores' });
    expect(screen.queryByText(/Honest Stores/)).not.toBeInTheDocument();
  });

  it('toggles report details', async () => {
    renderCard();
    expect(screen.queryByText(t.whatPeopleReported)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: t.viewDetails }));
    expect(screen.getByText(t.whatPeopleReported)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: t.hideDetails }));
    expect(screen.queryByText(t.whatPeopleReported)).not.toBeInTheDocument();
  });

  it('hides the details toggle and shows the empty message when there are no reports', () => {
    renderCard({ level: 'safe', reportCount: 0, reports: [] });
    expect(screen.queryByRole('button', { name: t.viewDetails })).not.toBeInTheDocument();
    expect(screen.getByText(t.noReportsDesc)).toBeInTheDocument();
  });

  it('opens a WhatsApp share link containing the identifier', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderCard();
    await userEvent.click(screen.getByRole('button', { name: t.shareOnWhatsApp }));
    expect(open).toHaveBeenCalledTimes(1);
    const url = String(open.mock.calls[0][0]);
    expect(url).toContain('https://wa.me/?text=');
    expect(decodeURIComponent(url)).toContain('0123456789');
  });

  it('copies the identifier and confirms with a label change', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole('button', { name: t.copyAccountNumber }));
    expect(await screen.findByRole('button', { name: t.copied })).toBeInTheDocument();
  });
});
