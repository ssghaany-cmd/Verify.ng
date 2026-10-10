import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstallPrompt } from './InstallPrompt';

function fireInstallEvent() {
  const prompt = vi.fn().mockResolvedValue(undefined);
  const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
    prompt,
    userChoice: Promise.resolve({ outcome: 'accepted' as const }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return prompt;
}

describe('InstallPrompt', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders nothing until the browser offers installation', () => {
    render(<InstallPrompt />);
    expect(screen.queryByText('Install VerifyNG')).not.toBeInTheDocument();
  });

  it('shows the banner and triggers the install prompt', async () => {
    render(<InstallPrompt />);
    const prompt = fireInstallEvent();
    expect(screen.getByText('Install VerifyNG')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Install' }));

    expect(prompt).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Install VerifyNG')).not.toBeInTheDocument());
  });

  it('remembers a dismissal for the session', async () => {
    const { unmount } = render(<InstallPrompt />);
    fireInstallEvent();
    const [, dismiss] = screen.getAllByRole('button');

    await userEvent.click(dismiss);

    expect(screen.queryByText('Install VerifyNG')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('installDismissed')).toBe('1');
    unmount();

    render(<InstallPrompt />);
    fireInstallEvent();
    expect(screen.queryByText('Install VerifyNG')).not.toBeInTheDocument();
  });
});
