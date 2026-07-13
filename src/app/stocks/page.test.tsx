import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';

vi.mock('@/components/chart/TradingViewChart', () => ({
  TradingViewChart: () => <div>TradingViewChart</div>,
}));
vi.mock('@/components/chart/SignalPanel', () => ({
  SignalPanel: () => <div>SignalPanel</div>,
}));
vi.mock('@/components/chart/SymbolSearch', () => ({
  SymbolSearch: () => <div>SymbolSearch</div>,
}));

describe('StocksPage', () => {
  it('renders title', async () => {
    const { default: StocksPage } = await import('@/app/stocks/page');
    renderWithProviders(<StocksPage />);
    expect(screen.getByText('Stock Analysis')).toBeDefined();
  });

  it('renders description', async () => {
    const { default: StocksPage } = await import('@/app/stocks/page');
    renderWithProviders(<StocksPage />);
    expect(screen.getByText('Chart analysis and signal detection for equities')).toBeDefined();
  });
});