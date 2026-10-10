import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb(): never {
  throw new Error('kaboom');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React and our logger both write to console.error when a render throws.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('shows a fallback and logs the error when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    const logged = vi.mocked(console.error).mock.calls.some(
      (call) => typeof call[0] === 'string' && call[0].includes('ErrorBoundary') && call[0].includes('kaboom')
    );
    expect(logged).toBe(true);
  });
});
