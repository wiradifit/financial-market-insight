import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActiveModulesCard } from '@/components/dashboard/ActiveModulesCard';

describe('ActiveModulesCard', () => {
  it('renders the section title', () => {
    render(<ActiveModulesCard />);
    expect(screen.getByText('Active Modules')).toBeDefined();
  });

  it('renders all 3 module names', () => {
    render(<ActiveModulesCard />);
    expect(screen.getByText('Binance CCXT Stream')).toBeDefined();
    expect(screen.getByText('TA Signal Engine')).toBeDefined();
    expect(screen.getByText('Stock Data (Yahoo)')).toBeDefined();
  });

  it('renders correct detail text', () => {
    render(<ActiveModulesCard />);
    expect(screen.getByText('Connected')).toBeDefined();
    expect(screen.getByText('Running')).toBeDefined();
    expect(screen.getByText('Idle')).toBeDefined();
  });
});