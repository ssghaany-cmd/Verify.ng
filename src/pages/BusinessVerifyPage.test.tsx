import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '@/lib/LanguageContext';
import { BADGE_FEE_NAIRA } from '@/lib/config';
import { translations } from '@/lib/translations';
import { queryBuilder } from '@/test/supabaseMock';
import { BusinessVerifyPage } from './BusinessVerifyPage';

const { fromMock, invokeMock, initializeMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  invokeMock: vi.fn(),
  initializeMock: vi.fn(),
}));

vi.mock('@/lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase')>();
  return { ...actual, supabase: { from: fromMock, functions: { invoke: invokeMock } } };
});

const t = translations.english;
type MonnifyOptions = Parameters<Window['MonnifySDK']['initialize']>[0];

type FormOptions = { cac?: string; phone?: string; email?: string };

async function fillAndSubmit({ cac = 'RC1234567', phone = '08031234567', email = 'ada@honest.ng' }: FormOptions = {}) {
  const { container } = render(
    <LanguageProvider>
      <BusinessVerifyPage />
    </LanguageProvider>
  );
  const [name, cacInput, owner, phoneInput, emailInput] = Array.from(container.querySelectorAll('input'));

  await userEvent.type(name, 'Honest Stores');
  await userEvent.type(cacInput, cac);
  await userEvent.type(owner, 'Ada Obi');
  await userEvent.type(phoneInput, phone);
  await userEvent.type(emailInput, email);
  await userEvent.selectOptions(container.querySelector('select')!, 'General Trading');
  await userEvent.click(screen.getByRole('button', { name: t.payNow }));
}

const monnifyOptions = () => initializeMock.mock.calls[0][0] as MonnifyOptions;

describe('BusinessVerifyPage', () => {
  beforeEach(() => {
    fromMock.mockReset();
    invokeMock.mockReset();
    initializeMock.mockReset();
    window.MonnifySDK = { initialize: initializeMock };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fromMock.mockReturnValue(queryBuilder({ data: { id: 'v-1' }, error: null }));
    invokeMock.mockResolvedValue({ data: {}, error: null });
  });

  it('saves the application and opens Monnify checkout with the badge fee', async () => {
    await fillAndSubmit();

    await waitFor(() => expect(initializeMock).toHaveBeenCalledTimes(1));
    expect(fromMock).toHaveBeenCalledWith('business_verifications');
    expect(monnifyOptions()).toEqual(
      expect.objectContaining({
        amount: BADGE_FEE_NAIRA,
        currency: 'NGN',
        customerEmail: 'ada@honest.ng',
        customerFullName: 'Ada Obi',
      })
    );
    expect(monnifyOptions().reference).toMatch(/^verifyng_v-1_\d+$/);
  });

  it('verifies a paid transaction server-side and shows the confirmation', async () => {
    await fillAndSubmit();
    await waitFor(() => expect(initializeMock).toHaveBeenCalled());

    await act(async () => {
      monnifyOptions().onComplete({ transactionReference: 'TX-1', paymentStatus: 'PAID' });
    });

    expect(await screen.findByText(t.applicationReceived)).toBeInTheDocument();
    expect(invokeMock).toHaveBeenCalledWith('verify-payment', {
      body: { transaction_reference: 'TX-1', verification_id: 'v-1' },
    });
  });

  it('shows the cancelled message when the payment window is closed', async () => {
    await fillAndSubmit();
    await waitFor(() => expect(initializeMock).toHaveBeenCalled());

    act(() => monnifyOptions().onClose());

    expect(await screen.findByText(t.paymentCancelled)).toBeInTheDocument();
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('does not verify a payment that did not succeed', async () => {
    await fillAndSubmit();
    await waitFor(() => expect(initializeMock).toHaveBeenCalled());

    act(() => monnifyOptions().onComplete({ transactionReference: 'TX-2', paymentStatus: 'FAILED' }));

    expect(await screen.findByText(t.paymentCancelled)).toBeInTheDocument();
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('reports a failure when server-side verification fails', async () => {
    invokeMock.mockResolvedValue({ data: null, error: { message: 'verification failed' } });
    await fillAndSubmit();
    await waitFor(() => expect(initializeMock).toHaveBeenCalled());

    await act(async () => {
      monnifyOptions().onComplete({ transactionReference: 'TX-3', status: 'SUCCESS' });
    });

    expect(await screen.findByText(t.paymentCancelled)).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  it('shows an error and skips checkout when saving the application fails', async () => {
    fromMock.mockReturnValue(queryBuilder({ data: null, error: { message: 'insert failed' } }));

    await fillAndSubmit();

    expect(await screen.findByText(t.errorOccurred)).toBeInTheDocument();
    expect(initializeMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid CAC number before touching the backend', async () => {
    await fillAndSubmit({ cac: 'XX12' });

    expect(await screen.findByText(t.invalidCacNumber)).toBeInTheDocument();
    expect(fromMock).not.toHaveBeenCalled();
    expect(initializeMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid phone number before touching the backend', async () => {
    await fillAndSubmit({ phone: '12345' });

    expect(await screen.findByText(t.invalidPhoneNumber)).toBeInTheDocument();
    expect(fromMock).not.toHaveBeenCalled();
  });
});
