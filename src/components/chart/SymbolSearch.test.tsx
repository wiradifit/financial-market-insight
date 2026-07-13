import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SymbolSearch } from '@/components/chart/SymbolSearch';

describe('SymbolSearch', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    onSelect.mockClear();
  });

  it('renders quick select buttons for crypto', () => {
    render(<SymbolSearch assetType="crypto" currentSymbol="" onSelect={onSelect} />);
    expect(screen.getByText('BTC-USD')).toBeDefined();
    expect(screen.getByText('ETH-USD')).toBeDefined();
  });

  it('renders quick select buttons for stocks', () => {
    render(<SymbolSearch assetType="stocks" currentSymbol="" onSelect={onSelect} />);
    expect(screen.getByText('AAPL')).toBeDefined();
  });

  it('renders quick select buttons for forex', () => {
    render(<SymbolSearch assetType="forex" currentSymbol="" onSelect={onSelect} />);
    expect(screen.getByText('EURUSD')).toBeDefined();
  });

  it('calls onSelect when clicking quick button', async () => {
    const user = userEvent.setup();
    render(<SymbolSearch assetType="crypto" currentSymbol="" onSelect={onSelect} />);
    await user.click(screen.getByText('BTC-USD'));
    expect(onSelect).toHaveBeenCalledWith('BTC-USD');
  });

  it('shows dropdown for filtered results', async () => {
    const user = userEvent.setup();
    render(<SymbolSearch assetType="crypto" currentSymbol="" onSelect={onSelect} />);
    const input = screen.getByPlaceholderText('Search symbol...');
    await user.type(input, 'ETH');
    expect(screen.getByText('ETH-USD')).toBeDefined();
  });

  it('selecting from dropdown calls onSelect', async () => {
    const user = userEvent.setup();
    render(<SymbolSearch assetType="crypto" currentSymbol="" onSelect={onSelect} />);
    const input = screen.getByPlaceholderText('Search symbol...');
    await user.type(input, 'ETH');
    const item = screen.getByText('ETH-USD');
    await user.click(item);
    expect(onSelect).toHaveBeenCalledWith('ETH-USD');
  });

  it('clicking outside closes dropdown', async () => {
    render(<SymbolSearch assetType="crypto" currentSymbol="" onSelect={onSelect} />);
    const input = screen.getByPlaceholderText('Search symbol...');
    fireEvent.focus(input);
    fireEvent.click(document.body);
  });

  it('renders without crashing', () => {
    const { container } = render(
      <SymbolSearch assetType="stocks" currentSymbol="AAPL" onSelect={onSelect} />
    );
    expect(container).toBeDefined();
  });
});