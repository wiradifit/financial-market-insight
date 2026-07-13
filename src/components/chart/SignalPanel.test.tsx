import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';

vi.mock('@/lib/data/signal-api-client', () => ({
  signalApiClient: {
    getSignals: vi.fn().mockResolvedValue([]),
  },
}));

describe('SignalPanel', () => {
  it('renders title with symbol', async () => {
    const { SignalPanel } = await import('@/components/chart/SignalPanel');
    renderWithProviders(<SignalPanel symbol="BTC-USD" />);
    expect(screen.getByText('Signals for BTC-USD')).toBeDefined();
  });

  it('shows no active signals when empty', async () => {
    const { SignalPanel } = await import('@/components/chart/SignalPanel');
    renderWithProviders(<SignalPanel symbol="BTC-USD" />);
    await waitFor(() => {
      expect(screen.getByText('No active signals for this symbol')).toBeDefined();
    }, { timeout: 2000 });
  });
});