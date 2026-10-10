import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Pages have their own tests; stub them so this test only covers app-shell navigation.
vi.mock('@/pages/HomePage', () => ({ HomePage: () => <div>home page</div> }));
vi.mock('@/pages/ReportScamPage', () => ({ ReportScamPage: () => <div>report page</div> }));
vi.mock('@/pages/RecentScamsPage', () => ({ RecentScamsPage: () => <div>feed page</div> }));
vi.mock('@/pages/BusinessVerifyPage', () => ({ BusinessVerifyPage: () => <div>business page</div> }));

describe('App navigation', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    window.history.replaceState({}, '', '/');
  });

  it('starts on the home tab', () => {
    render(<App />);
    expect(screen.getByText('home page')).toBeInTheDocument();
  });

  it('switches pages from the bottom navigation', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Report' }));
    expect(screen.getByText('report page')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Scams' }));
    expect(screen.getByText('feed page')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    expect(screen.getByText('business page')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(screen.getByText('home page')).toBeInTheDocument();
  });

  it('opens the tab named in the ?tab= query parameter', () => {
    window.history.replaceState({}, '', '/?tab=feed');
    render(<App />);
    expect(screen.getByText('feed page')).toBeInTheDocument();
  });

  it('ignores an unknown ?tab= value', () => {
    window.history.replaceState({}, '', '/?tab=nonsense');
    render(<App />);
    expect(screen.getByText('home page')).toBeInTheDocument();
  });

  it('toggles the UI language from the header', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Pidgin' }));
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
  });
});
