import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

class MockWebSocket {
  url: string;
  send = vi.fn();
  close = vi.fn();
  onopen: ((e: Event) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  constructor(url: string) { this.url = url; }
}

describe('NetworkMonitor', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  async function renderNM() {
    const { NetworkMonitor } = await import('@/components/network/NetworkMonitor');
    return render(<NetworkMonitor />);
  }

  it('renders title', async () => {
    await renderNM();
    expect(screen.getByText('Live Network Monitor')).toBeDefined();
  });

  it('renders all 4 service names', async () => {
    await renderNM();
    expect(screen.getByText('Next.js Frontend API')).toBeDefined();
    expect(screen.getByText('Python Signal Engine')).toBeDefined();
    expect(screen.getByText('Kraken Live WebSocket')).toBeDefined();
    expect(screen.getByText('Yahoo Finance Feed')).toBeDefined();
  });

  it('renders Refresh Now button', async () => {
    await renderNM();
    expect(screen.getByText('Refresh Now')).toBeDefined();
  });

  it('renders checking state initially', async () => {
    await renderNM();
    expect(screen.getAllByText('Pinging...').length).toBeGreaterThan(0);
  });
});