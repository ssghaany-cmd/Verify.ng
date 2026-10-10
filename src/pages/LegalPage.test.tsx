import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LegalPage } from './LegalPage';

describe('LegalPage', () => {
  it('shows the policy title and calls onBack', async () => {
    const onBack = vi.fn();
    render(<LegalPage onBack={onBack} />);

    expect(screen.getByRole('heading', { name: /Privacy Policy & Terms of Service/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Back/ }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows one section at a time and lets the user collapse it', async () => {
    const { container } = render(<LegalPage onBack={() => {}} />);
    const privacy = screen.getByRole('button', { name: 'Privacy Policy' });
    const terms = screen.getByRole('button', { name: 'Terms of Service' });
    const bodyCount = () => container.querySelectorAll('.animate-fade-in').length;

    expect(bodyCount()).toBe(1); // privacy is open by default

    await userEvent.click(terms);
    expect(bodyCount()).toBe(1); // switched to terms, privacy closed

    await userEvent.click(terms);
    expect(bodyCount()).toBe(0); // collapsed

    await userEvent.click(privacy);
    expect(bodyCount()).toBe(1);
  });
});
