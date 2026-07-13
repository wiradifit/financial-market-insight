import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';

vi.mock('@/components/network/NetworkMonitor', () => ({
  NetworkMonitor: () => <div>NetworkMonitor</div>,
}));

describe('NetworkPage', () => {
  it('renders title', async () => {
    const { default: NetworkPage } = await import('@/app/network/page');
    renderWithProviders(<NetworkPage />);
    expect(screen.getByText('Network Health')).toBeDefined();
  });

  it('renders description', async () => {
    const { default: NetworkPage } = await import('@/app/network/page');
    renderWithProviders(<NetworkPage />);
    expect(screen.getByText('Real-time status of all external dependencies and microservices.')).toBeDefined();
  });
});