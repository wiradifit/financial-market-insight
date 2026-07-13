import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';

describe('NewsFeed', () => {
  it('renders the News title', async () => {
    const { NewsFeed } = await import('@/components/dashboard/NewsFeed');
    renderWithProviders(<NewsFeed />);
    expect(screen.getByText('News')).toBeDefined();
  });

  it('renders default symbol display', async () => {
    const { NewsFeed } = await import('@/components/dashboard/NewsFeed');
    renderWithProviders(<NewsFeed />);
    expect(screen.getByText('BTC, ETH, SOL')).toBeDefined();
  });

  it('renders custom symbol display', async () => {
    const { NewsFeed } = await import('@/components/dashboard/NewsFeed');
    renderWithProviders(<NewsFeed symbols="AAPL,MSFT" />);
    expect(screen.getByText('AAPL, MSFT')).toBeDefined();
  });
});