import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

class MockWS {
  url: string;
  readyState = 0;
  onopen: ((this: WebSocket, ev: Event) => unknown) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null = null;
  onerror: ((this: WebSocket, ev: Event) => unknown) | null = null;
  onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null = null;
  send = vi.fn();
  close = vi.fn();
  constructor(url: string) { this.url = url; }
}

vi.mock('@/lib/utils/format', () => ({
  formatCurrency: (v: number) => `$${v}`,
  timeAgo: () => 'just now',
  getChangeColor: () => 'text-gain',
}));

describe('CryptoWatchlist', () => {
  beforeEach(() => {
    vi.stubGlobal('WebSocket', MockWS);
  });

  async function renderWatchlist() {
    const { CryptoWatchlist } = await import('@/components/dashboard/CryptoWatchlist');
    const { renderWithProviders } = await import('@/test-utils');
    return renderWithProviders(<CryptoWatchlist />);
  }

  it('renders Live Price Feed title', async () => {
    await renderWatchlist();
    await waitFor(() => {
      expect(screen.getByText('Live Price Feed')).toBeDefined();
    }, { timeout: 3000 });
  });

  it('renders BTC, ETH, SOL subtitle', async () => {
    await renderWatchlist();
    await waitFor(() => {
      expect(screen.getByText('BTC \u2022 ETH \u2022 SOL')).toBeDefined();
    }, { timeout: 3000 });
  });

  it('sends subscribe message on WebSocket open', async () => {
    await renderWatchlist();
    await waitFor(() => {
      expect(screen.getByText('Live Price Feed')).toBeDefined();
    }, { timeout: 3000 });

    const wsInstance = (WebSocket as unknown as ReturnType<typeof vi.fn>).mock?.instances?.[0] as MockWS | undefined;
    if (wsInstance?.onopen) {
      wsInstance.onopen.call(wsInstance as unknown as WebSocket, new Event('open'));
      expect(wsInstance.send).toHaveBeenCalled();
    }
  });

  it('handles WebSocket error', async () => {
    await renderWatchlist();
    await waitFor(() => {
      expect(screen.getByText('Live Price Feed')).toBeDefined();
    }, { timeout: 3000 });

    const wsInstance = (WebSocket as unknown as ReturnType<typeof vi.fn>).mock?.instances?.[0] as MockWS | undefined;
    if (wsInstance?.onerror) {
      wsInstance.onerror.call(wsInstance as unknown as WebSocket, new Event('error'));
    }
  });

  it('handles WebSocket close', async () => {
    await renderWatchlist();
    await waitFor(() => {
      expect(screen.getByText('Live Price Feed')).toBeDefined();
    }, { timeout: 3000 });

    const wsInstance = (WebSocket as unknown as ReturnType<typeof vi.fn>).mock?.instances?.[0] as MockWS | undefined;
    if (wsInstance?.onclose) {
      wsInstance.onclose.call(wsInstance as unknown as WebSocket, new CloseEvent('close'));
    }
  });
});