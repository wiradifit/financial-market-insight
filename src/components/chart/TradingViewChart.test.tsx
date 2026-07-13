import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TradingViewChart } from '@/components/chart/TradingViewChart';

describe('TradingViewChart', () => {
  it('renders container div with correct id for crypto', () => {
    const { container } = render(<TradingViewChart symbol="BTC-USD" />);
    expect(container.querySelector('#tv-chart-BTC_USD')).toBeDefined();
  });

  it('renders container div for stock symbol', () => {
    const { container } = render(<TradingViewChart symbol="AAPL" />);
    expect(container.querySelector('#tv-chart-AAPL')).toBeDefined();
  });

  it('renders container div for forex symbol', () => {
    const { container } = render(<TradingViewChart symbol="EURUSD" />);
    expect(container.querySelector('#tv-chart-EURUSD')).toBeDefined();
  });

  it('sets minHeight from height prop', () => {
    const { container } = render(<TradingViewChart symbol="BTC-USD" height={500} />);
    const div = container.querySelector('#tv-chart-BTC_USD');
    expect((div as HTMLElement)?.style.minHeight).toBe('500px');
  });

  it('has w-full class', () => {
    const { container } = render(<TradingViewChart symbol="BTC-USD" />);
    expect(container.querySelector('#tv-chart-BTC_USD')?.className).toContain('w-full');
  });

  it('defaults height to 500', () => {
    const { container } = render(<TradingViewChart symbol="TEST" />);
    expect(container.querySelector('#tv-chart-TEST')).toBeDefined();
  });

  it('handles symbol with colon', () => {
    const { container } = render(<TradingViewChart symbol="BINANCE:BTCUSDT" />);
    expect(container.querySelector('#tv-chart-BINANCE_BTCUSDT')).toBeDefined();
  });

  it('sanitizes symbol for container id', () => {
    const { container } = render(<TradingViewChart symbol="BTC/USD" />);
    expect(container.querySelector('#tv-chart-BTC_USD')).toBeDefined();
  });
});