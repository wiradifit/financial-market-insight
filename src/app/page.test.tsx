import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';

vi.mock('@/components/dashboard/CryptoWatchlist', () => ({
  CryptoWatchlist: () => <div>CryptoWatchlist</div>,
}));
vi.mock('@/components/dashboard/ActiveModulesCard', () => ({
  ActiveModulesCard: () => <div>ActiveModulesCard</div>,
}));
vi.mock('@/components/dashboard/SignalFeed', () => ({
  SignalFeed: () => <div>SignalFeed</div>,
}));
vi.mock('@/components/dashboard/MarketOverviewCard', () => ({
  MarketOverviewCard: () => <div>MarketOverviewCard</div>,
}));
vi.mock('@/components/dashboard/NewsFeed', () => ({
  NewsFeed: () => <div>NewsFeed</div>,
}));

describe('DashboardPage', () => {
  it('renders dashboard title', async () => {
    const { default: DashboardPage } = await import('@/app/page');
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeDefined();
  });

  it('renders subtitle', async () => {
    const { default: DashboardPage } = await import('@/app/page');
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Real-time market data, signal analysis, and news aggregation')).toBeDefined();
  });
});