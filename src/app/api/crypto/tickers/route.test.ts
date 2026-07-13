import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ccxtClient } from '@/lib/data/ccxt-client';

vi.mock('@/lib/data/ccxt-client', () => ({
  ccxtClient: {
    getTopCryptoTickers: vi.fn(),
    getTicker: vi.fn(),
    getOHLCV: vi.fn(),
    getMultiExchangePrices: vi.fn(),
  },
}));

describe('GET /api/crypto/tickers', () => {
  it('returns data with timestamp on success', async () => {
    const mockData = [{ symbol: 'BTC-USDT', price: 50000 }];
    vi.mocked(ccxtClient.getTopCryptoTickers).mockResolvedValue(mockData as any);

    const { GET } = await import('@/app/api/crypto/tickers/route');
    const response = await GET(new Request('http://localhost/api/crypto/tickers'));
    const json = await response.json();

    expect(json.data).toEqual(mockData);
    expect(json.timestamp).toBeDefined();
  });

  it('respects limit query param', async () => {
    vi.mocked(ccxtClient.getTopCryptoTickers).mockResolvedValue([]);
    const { GET } = await import('@/app/api/crypto/tickers/route');
    await GET(new Request('http://localhost/api/crypto/tickers?limit=5'));
    expect(ccxtClient.getTopCryptoTickers).toHaveBeenCalledWith(5);
  });

  it('caps limit at 50', async () => {
    vi.mocked(ccxtClient.getTopCryptoTickers).mockResolvedValue([]);
    const { GET } = await import('@/app/api/crypto/tickers/route');
    await GET(new Request('http://localhost/api/crypto/tickers?limit=100'));
    expect(ccxtClient.getTopCryptoTickers).toHaveBeenCalledWith(50);
  });

  it('returns 502 on error', async () => {
    vi.mocked(ccxtClient.getTopCryptoTickers).mockRejectedValue(new Error('fail'));
    const { GET } = await import('@/app/api/crypto/tickers/route');
    const response = await GET(new Request('http://localhost/api/crypto/tickers'));
    expect(response.status).toBe(502);
  });
});