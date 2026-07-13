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

describe('ForexPage', () => {
  it('renders title', async () => {
    const { default: ForexPage } = await import('@/app/forex/page');
    renderWithProviders(<ForexPage />);
    expect(screen.getByText('Forex Market')).toBeDefined();
  });

  it('renders description', async () => {
    const { default: ForexPage } = await import('@/app/forex/page');
    renderWithProviders(<ForexPage />);
    expect(screen.getByText('Chart analysis and signal detection for currency pairs')).toBeDefined();
  });
});