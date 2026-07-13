import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import type { ScanResult, Signal } from '@/types/market';
import { signalApiClient } from '@/lib/data/signal-api-client';

vi.mock('@/lib/data/signal-api-client', () => ({
  signalApiClient: {
    scanSignals: vi.fn().mockResolvedValue(null),
    getSignals: vi.fn().mockResolvedValue([]),
    getMarketOverview: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/lib/stores/notifications', () => {
  const addAlerts = vi.fn();
  const state = { alerts: [], addAlerts, lastScanTimestamp: 0, markSent: vi.fn(), clear: vi.fn() };
  return {
    useNotificationStore: (sel: (s: unknown) => unknown) => sel(state),
  };
});

describe('SignalFeed', () => {
  it('renders the title', async () => {
    const { SignalFeed } = await import('@/components/dashboard/SignalFeed');
    renderWithProviders(<SignalFeed />);
    expect(screen.getByText('Live Signal Feed')).toBeDefined();
  });

  it('renders subtitle text', async () => {
    const { SignalFeed } = await import('@/components/dashboard/SignalFeed');
    renderWithProviders(<SignalFeed />);
    expect(screen.getByText('AI-generated technical analysis signals')).toBeDefined();
  });

  it('shows View All button', async () => {
    const { SignalFeed } = await import('@/components/dashboard/SignalFeed');
    renderWithProviders(<SignalFeed />);
    expect(screen.getByText('View All')).toBeDefined();
  });

  it('shows error state when engine offline', async () => {
    vi.mocked(signalApiClient.scanSignals).mockRejectedValue(new Error('offline'));
    const { SignalFeed } = await import('@/components/dashboard/SignalFeed');
    renderWithProviders(<SignalFeed />);
    await waitFor(() => {
      expect(screen.getByText('Signal Engine Offline')).toBeDefined();
    }, { timeout: 3000 });
  });

  it('shows no active signals when data empty', async () => {
    vi.mocked(signalApiClient.scanSignals).mockResolvedValue({ signals: [], symbolsScanned: 0, timestamp: Date.now() } as ScanResult);
    const { SignalFeed } = await import('@/components/dashboard/SignalFeed');
    renderWithProviders(<SignalFeed />);
    await waitFor(() => {
      expect(screen.getByText('No Active Signals')).toBeDefined();
    }, { timeout: 3000 });
  });

  it('renders signal cards when data has BULLISH signal', async () => {
    const mockSignals: Signal[] = [{
      symbol: 'BTC-USD',
      direction: 'BULLISH',
      signalType: 'RSI_OVERSOLD',
      confidence: 85,
      indicatorValues: { RSI: 28.5 },
      timeframe: '1h',
      message: 'RSI indicates oversold conditions',
      timestamp: Date.now(),
      entryPrice: 62000,
      tp: 65000,
      sl: 60000,
    }];
    vi.mocked(signalApiClient.scanSignals).mockResolvedValue({ signals: mockSignals, symbolsScanned: 1, timestamp: Date.now() } as ScanResult);
    const { SignalFeed } = await import('@/components/dashboard/SignalFeed');
    renderWithProviders(<SignalFeed />);
    await waitFor(() => {
      expect(screen.getByText('BTC-USD')).toBeDefined();
      expect(screen.getByText('85%')).toBeDefined();
    }, { timeout: 3000 });
  });

  it('renders BEARISH signal card', async () => {
    const mockSignals: Signal[] = [{
      symbol: 'ETH-USD',
      direction: 'BEARISH',
      signalType: 'MACD_BEARISH_CROSS',
      confidence: 70,
      indicatorValues: { MACD: -5 },
      timeframe: '4h',
      message: 'MACD bearish crossover detected',
      timestamp: Date.now(),
    }];
    vi.mocked(signalApiClient.scanSignals).mockResolvedValue({ signals: mockSignals, symbolsScanned: 1, timestamp: Date.now() } as ScanResult);
    const { SignalFeed } = await import('@/components/dashboard/SignalFeed');
    renderWithProviders(<SignalFeed />);
    await waitFor(() => {
      expect(screen.getByText('ETH-USD')).toBeDefined();
    }, { timeout: 3000 });
  });
});