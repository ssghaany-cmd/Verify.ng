import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/lib/LanguageContext';
import { translations } from '@/lib/translations';
import { NIGERIAN_BANKS } from '@/lib/banks';
import { queryBuilder } from '@/test/supabaseMock';
import { ReportScamPage } from './ReportScamPage';

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock('@/lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase')>();
  return { ...actual, supabase: { from: fromMock, storage: { from: vi.fn() } } };
});

const t = translations.english;

type FormOptions = { account?: string; phone?: string; amount?: string };

async function fillAndSubmit({ account = '0123456789', phone = '', amount = '' }: FormOptions = {}) {
  const { container } = render(
    <LanguageProvider>
      <ReportScamPage />
    </LanguageProvider>
  );
  const [bankSelect, typeSelect] = Array.from(container.querySelectorAll('select'));

  await userEvent.type(screen.getByPlaceholderText(t.enterAccountNumber), account);
  await userEvent.selectOptions(bankSelect, NIGERIAN_BANKS[0]);
  if (phone) await userEvent.type(screen.getByPlaceholderText(t.enterPhoneNumber), phone);
  if (amount) await userEvent.type(screen.getByPlaceholderText('0'), amount);
  await userEvent.selectOptions(typeSelect, 'fake_vendor');
  await userEvent.type(container.querySelector('textarea')!, 'Paid and the seller vanished');
  await userEvent.click(screen.getByRole('button', { name: t.submitReport }));
}

describe('ReportScamPage', () => {
  beforeEach(() => {
    fromMock.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('submits a valid report with normalized values', async () => {
    const builder = queryBuilder({ data: null, error: null });
    fromMock.mockReturnValue(builder);

    await fillAndSubmit({ phone: '0803 123 4567', amount: '2500' });

    expect(await screen.findByText(t.reportSubmitted)).toBeInTheDocument();
    expect(fromMock).toHaveBeenCalledWith('scam_reports');
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        account_number: '0123456789',
        bank_name: NIGERIAN_BANKS[0],
        phone_number: '08031234567',
        amount_lost: 2500,
        scam_type: 'fake_vendor',
      })
    );
  });

  it('rejects an invalid account number without calling the backend', async () => {
    await fillAndSubmit({ account: '12345' });

    expect(await screen.findByText(t.invalidAccountNumber)).toBeInTheDocument();
    expect(fromMock).not.toHaveBeenCalled();
    expect(screen.queryByText(t.reportSubmitted)).not.toBeInTheDocument();
  });

  it('rejects an invalid phone number without calling the backend', async () => {
    await fillAndSubmit({ phone: '12345' });

    expect(await screen.findByText(t.invalidPhoneNumber)).toBeInTheDocument();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('shows an error and logs it when the insert fails', async () => {
    fromMock.mockReturnValue(queryBuilder({ data: null, error: { message: 'insert failed' } }));

    await fillAndSubmit();

    expect(await screen.findByText(t.errorOccurred)).toBeInTheDocument();
    expect(screen.queryByText(t.reportSubmitted)).not.toBeInTheDocument();
    await waitFor(() => expect(console.error).toHaveBeenCalled());
  });
});
