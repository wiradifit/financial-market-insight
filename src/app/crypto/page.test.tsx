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

describe('CryptoPage', () => {
  it('renders title', async () => {
    const { default: CryptoPage } = await import('@/app/crypto/page');
    renderWithProviders(<CryptoPage />);
    expect(screen.getByText('Crypto Signals')).toBeDefined();
  });

  it('renders description', async () => {
    const { default: CryptoPage } = await import('@/app/crypto/page');
    renderWithProviders(<CryptoPage />);
    expect(screen.getByText('Chart analysis and signal detection for cryptocurrency pairs')).toBeDefined();
  });

  it('renders live indicator', async () => {
    const { default: CryptoPage } = await import('@/app/crypto/page');
    renderWithProviders(<CryptoPage />);
    expect(screen.getByText('Live TradingView')).toBeDefined();
    expect(screen.getByText('Streaming')).toBeDefined();
  });
});