import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';

vi.mock('@/lib/data/signal-api-client', () => ({
  signalApiClient: {
    getMarketOverview: vi.fn().mockResolvedValue({
      stocks: [{ symbol: 'AAPL', name: 'Apple Inc.', price: 200, change: 2, changePercent: 1, high24h: 0, low24h: 0, volume: 0, lastUpdated: 0 }],
      crypto: [{ symbol: 'BTC-USD', name: 'Bitcoin', price: 50000, change: 500, changePercent: 1, high24h: 0, low24h: 0, volume: 0, lastUpdated: 0 }],
      forex: [{ symbol: 'EUR-USD', name: 'Euro', price: 1.1, change: 0.01, changePercent: 1, high24h: 0, low24h: 0, volume: 0, lastUpdated: 0 }],
      timestamp: Date.now(),
    }),
  },
}));

describe('MarketOverviewCard', () => {
  it('renders title', async () => {
    const { MarketOverviewCard } = await import('@/components/dashboard/MarketOverviewCard');
    renderWithProviders(<MarketOverviewCard />);
    expect(screen.getByText('Market Overview')).toBeDefined();
  });

  it('renders asset kind badges', async () => {
    const { MarketOverviewCard } = await import('@/components/dashboard/MarketOverviewCard');
    renderWithProviders(<MarketOverviewCard />);
    expect(screen.getByText('Crypto')).toBeDefined();
    expect(screen.getByText('Stocks')).toBeDefined();
    expect(screen.getByText('FX')).toBeDefined();
  });

  it('renders asset rows when data available', async () => {
    const { MarketOverviewCard } = await import('@/components/dashboard/MarketOverviewCard');
    renderWithProviders(<MarketOverviewCard />);
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeDefined();
      expect(screen.getByText('BTC-USD')).toBeDefined();
      expect(screen.getByText('EUR-USD')).toBeDefined();
    }, { timeout: 2000 });
  });
});