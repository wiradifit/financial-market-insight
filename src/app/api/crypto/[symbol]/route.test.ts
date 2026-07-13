import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ccxtClient } from '@/lib/data/ccxt-client';

vi.mock('@/lib/data/ccxt-client', () => ({
  ccxtClient: {
    getTicker: vi.fn(),
    getOHLCV: vi.fn(),
  },
}));

describe('GET /api/crypto/[symbol]', () => {
  it('returns ticker and history on success', async () => {
    const mockTicker = { exchange: 'kraken', symbol: 'BTC/USDT', price: 50000 };
    const mockHistory = [{ timestamp: 1, open: 0, high: 0, low: 0, close: 0, volume: 0 }];
    vi.mocked(ccxtClient.getTicker).mockResolvedValue(mockTicker as any);
    vi.mocked(ccxtClient.getOHLCV).mockResolvedValue(mockHistory as any);

    const { GET } = await import('@/app/api/crypto/[symbol]/route');
    const response = await GET(new Request('http://localhost/api/crypto/BTC-USD'), {
      params: Promise.resolve({ symbol: 'BTC-USD' }),
    } as any);
    const json = await response.json();

    expect(json.ticker).toBeDefined();
    expect(json.history).toBeDefined();
    expect(json.timestamp).toBeDefined();
  });

  it('returns 404 when ticker is null', async () => {
    vi.mocked(ccxtClient.getTicker).mockResolvedValue(null);
    vi.mocked(ccxtClient.getOHLCV).mockResolvedValue([]);

    const { GET } = await import('@/app/api/crypto/[symbol]/route');
    const response = await GET(new Request('http://localhost/api/crypto/UNKNOWN'), {
      params: Promise.resolve({ symbol: 'UNKNOWN' }),
    } as any);

    expect(response.status).toBe(404);
  });

  it('returns 502 on error', async () => {
    vi.mocked(ccxtClient.getTicker).mockRejectedValue(new Error('fail'));

    const { GET } = await import('@/app/api/crypto/[symbol]/route');
    const response = await GET(new Request('http://localhost/api/crypto/BTC-USD'), {
      params: Promise.resolve({ symbol: 'BTC-USD' }),
    } as any);

    expect(response.status).toBe(502);
  });
});