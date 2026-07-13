import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ccxtClient } from '@/lib/data/ccxt-client';

vi.mock('@/lib/data/ccxt-client', () => ({
  ccxtClient: {
    getMultiExchangePrices: vi.fn(),
  },
}));

describe('GET /api/crypto/[symbol]/exchanges', () => {
  it('returns prices and spread on success', async () => {
    const mockPrices = [
      { exchange: 'binance', price: 50000 },
      { exchange: 'kraken', price: 49900 },
    ];
    vi.mocked(ccxtClient.getMultiExchangePrices).mockResolvedValue(mockPrices as any);

    const { GET } = await import('@/app/api/crypto/[symbol]/exchanges/route');
    const response = await GET(new Request('http://localhost/api/crypto/BTC-USD/exchanges'), {
      params: Promise.resolve({ symbol: 'BTC-USD' }),
    } as any);
    const json = await response.json();

    expect(json.prices).toEqual(mockPrices);
    expect(json.spread).toBeDefined();
    expect(json.timestamp).toBeDefined();
  });

  it('returns 404 when no prices found', async () => {
    vi.mocked(ccxtClient.getMultiExchangePrices).mockResolvedValue([]);

    const { GET } = await import('@/app/api/crypto/[symbol]/exchanges/route');
    const response = await GET(new Request('http://localhost/api/crypto/BTC-USD/exchanges'), {
      params: Promise.resolve({ symbol: 'BTC-USD' }),
    } as any);

    expect(response.status).toBe(404);
  });

  it('returns 502 on error', async () => {
    vi.mocked(ccxtClient.getMultiExchangePrices).mockRejectedValue(new Error('fail'));

    const { GET } = await import('@/app/api/crypto/[symbol]/exchanges/route');
    const response = await GET(new Request('http://localhost/api/crypto/BTC-USD/exchanges'), {
      params: Promise.resolve({ symbol: 'BTC-USD' }),
    } as any);

    expect(response.status).toBe(502);
  });

  it('calculates spread correctly', async () => {
    const mockPrices = [
      { exchange: 'binance', price: 50100 },
      { exchange: 'kraken', price: 50000 },
      { exchange: 'coinbase', price: 49900 },
    ];
    vi.mocked(ccxtClient.getMultiExchangePrices).mockResolvedValue(mockPrices as any);

    const { GET } = await import('@/app/api/crypto/[symbol]/exchanges/route');
    const response = await GET(new Request('http://localhost/api/crypto/BTC-USD/exchanges'), {
      params: Promise.resolve({ symbol: 'BTC-USD' }),
    } as any);
    const json = await response.json();

    expect(json.spread.min).toBe(49900);
    expect(json.spread.max).toBe(50100);
    expect(json.spread.diff).toBe(200);
  });
});