import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { useNotificationStore } from '@/lib/stores/notifications';

const mockPush = vi.fn();
const mockToggleMobileNav = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
}));

vi.mock('@/lib/stores/ui', () => ({
  useUIStore: (sel: (s: unknown) => unknown) => {
    const state = { mobileNavOpen: false, toggleMobileNav: mockToggleMobileNav, setMobileNav: vi.fn() };
    return sel(state);
  },
}));

describe('Header', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockToggleMobileNav.mockClear();
    useNotificationStore.getState().clear();
  });

  async function renderHeader() {
    const { Header } = await import('@/components/layout/Header');
    return renderWithProviders(<Header />);
  }

  it('renders the FM logo', async () => {
    await renderHeader();
    expect(screen.getByText('FM')).toBeDefined();
  });

  it('renders notification bell', async () => {
    await renderHeader();
    expect(screen.getByLabelText('Notifications')).toBeDefined();
  });

  it('renders mobile hamburger menu', async () => {
    await renderHeader();
    expect(screen.getByLabelText('Open navigation')).toBeDefined();
  });

  it('shows notification count when alerts exist', async () => {
    useNotificationStore.getState().addAlerts([{
      id: 'test-1', symbol: 'BTC-USD', direction: 'BULLISH',
      signalType: 'RSI_OVERSOLD', confidence: 85, message: 'Test', timestamp: Date.now(),
    }]);
    await renderHeader();
    expect(screen.getByText('1')).toBeDefined();
  });

  it('shows 9+ for more than 9 unsent alerts', async () => {
    const alerts = Array.from({ length: 10 }, (_, i) => ({
      id: `a-${i}`, symbol: 'BTC-USD', direction: 'BULLISH' as const,
      signalType: 'RSI', confidence: 85, message: 'T', timestamp: Date.now(),
    }));
    useNotificationStore.getState().addAlerts(alerts);
    await renderHeader();
    expect(screen.getByText('9+')).toBeDefined();
  });

  it('renders chart button', async () => {
    await renderHeader();
    expect(screen.getByLabelText('Chart view')).toBeDefined();
  });

  it('opens search on button click', async () => {
    const user = userEvent.setup();
    await renderHeader();
    const searchButton = screen.getByText('Search symbols...');
    await user.click(searchButton);
    expect(screen.getByPlaceholderText('BTC, AAPL, EURUSD...')).toBeDefined();
  });

  it('navigates to settings on notification click', async () => {
    const user = userEvent.setup();
    await renderHeader();
    await user.click(screen.getByLabelText('Notifications'));
    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('navigates to crypto on chart click', async () => {
    const user = userEvent.setup();
    await renderHeader();
    await user.click(screen.getByLabelText('Chart view'));
    expect(mockPush).toHaveBeenCalledWith('/crypto');
  });

  it('renders quick symbol buttons in search dropdown', async () => {
    const user = userEvent.setup();
    await renderHeader();
    await user.click(screen.getByText('Search symbols...'));
    expect(screen.getByText('BTC-USD')).toBeDefined();
    expect(screen.getByText('AAPL')).toBeDefined();
  });
});