import { describe, it, expect, vi, beforeEach } from 'vitest';

const { _kraken, _binance, _coinbase } = vi.hoisted(() => {
  const exchanges: Record<string, Record<string, unknown>> = {};

  exchanges.kraken = {
    id: 'kraken',
    fetchTicker: vi.fn().mockResolvedValue({
      symbol: 'BTC/USDT', last: 50000, bid: 49990, ask: 50010, baseVolume: 1000, timestamp: 1000000,
    }),
    fetchOHLCV: vi.fn().mockResolvedValue([[1000000, 50000, 51000, 49000, 50500, 150]]),
    fetchOrderBook: vi.fn().mockResolvedValue({
      symbol: 'BTC/USDT', bids: [[50000, 1.5]], asks: [[50010, 2.0]], timestamp: 1000000,
    }),
    fetchTickers: vi.fn().mockResolvedValue({
      'BTC/USDT': { symbol: 'BTC/USDT', last: 50000, open: 49500, high: 51000, low: 49000, quoteVolume: 1000000, baseVolume: 20, percentage: 1, timestamp: 1000000 },
    }),
  };

  exchanges.binance = {
    id: 'binance',
    fetchTicker: vi.fn().mockResolvedValue({
      symbol: 'BTC/USDT', last: 50100, bid: 50090, ask: 50110, baseVolume: 2000, timestamp: 1000000,
    }),
    fetchOHLCV: vi.fn().mockResolvedValue([[2000000, 50100, 50200, 50000, 50150, 100]]),
    fetchOrderBook: vi.fn().mockResolvedValue({
      symbol: 'BTC/USDT', bids: [[50100, 1.0]], asks: [[50110, 0.5]], timestamp: 1000000,
    }),
    fetchTickers: vi.fn().mockResolvedValue({
      'BTC/USDT': { symbol: 'BTC/USDT', last: 50100, open: 50000, quoteVolume: 2000000, baseVolume: 40, percentage: 2, timestamp: 1000000 },
    }),
  };

  exchanges.coinbase = {
    id: 'coinbase',
    fetchTicker: vi.fn().mockResolvedValue({
      symbol: 'BTC/USDT', last: 49900, bid: 49890, ask: 49910, baseVolume: 1500, timestamp: 1000000,
    }),
    fetchOHLCV: vi.fn().mockResolvedValue([[3000000, 49900, 50000, 49800, 49950, 50]]),
    fetchOrderBook: vi.fn().mockResolvedValue({
      symbol: 'BTC/USDT', bids: [[49900, 2.0]], asks: [[49910, 1.0]], timestamp: 1000000,
    }),
    fetchTickers: vi.fn().mockResolvedValue({
      'BTC/USDT': { symbol: 'BTC/USDT', last: 49900, open: 49800, quoteVolume: 500000, baseVolume: 10, percentage: 0.2, timestamp: 1000000 },
    }),
  };

  return { _kraken: exchanges.kraken, _binance: exchanges.binance, _coinbase: exchanges.coinbase };
});

vi.mock('ccxt', () => ({
  exchanges: ['kraken', 'binance', 'coinbase'],
  ...(['kraken', 'binance', 'coinbase'] as const).reduce<Record<string, unknown>>((acc, name) => {
    acc[name] = function () { return _kraken.id === name ? _kraken : _binance.id === name ? _binance : _coinbase; };
    return acc;
  }, {}),
  default: {
    exchanges: ['kraken', 'binance', 'coinbase'],
    ...(['kraken', 'binance', 'coinbase'] as const).reduce<Record<string, unknown>>((acc, name) => {
      acc[name] = function () { return _kraken.id === name ? _kraken : _binance.id === name ? _binance : _coinbase; };
      return acc;
    }, {}),
  },
}));

import { ccxtClient } from '@/lib/data/ccxt-client';

describe('CryptoDataClient', () => {
  beforeEach(() => {
    _kraken.fetchTicker = vi.fn().mockResolvedValue({
      symbol: 'BTC/USDT', last: 50000, bid: 49990, ask: 50010, baseVolume: 1000, timestamp: 1000000,
    });
    _kraken.fetchOHLCV = vi.fn().mockResolvedValue([[1000000, 50000, 51000, 49000, 50500, 150]]);
    _kraken.fetchOrderBook = vi.fn().mockResolvedValue({
      symbol: 'BTC/USDT', bids: [[50000, 1.5]], asks: [[50010, 2.0]], timestamp: 1000000,
    });
    _kraken.fetchTickers = vi.fn().mockResolvedValue({
      'BTC/USDT': { symbol: 'BTC/USDT', last: 50000, open: 49500, high: 51000, low: 49000, quoteVolume: 1000000, baseVolume: 20, percentage: 1, timestamp: 1000000 },
    });

    _binance.fetchTicker = vi.fn().mockResolvedValue({
      symbol: 'BTC/USDT', last: 50100, bid: 50090, ask: 50110, baseVolume: 2000, timestamp: 1000000,
    });
    _coinbase.fetchTicker = vi.fn().mockResolvedValue({
      symbol: 'BTC/USDT', last: 49900, bid: 49890, ask: 49910, baseVolume: 1500, timestamp: 1000000,
    });

    (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
  });

  describe('unknown exchange', () => {
    it('throws when exchange constructor is not a function', async () => {
      expect(await ccxtClient.getTicker('BTC/USDT', 'notfound')).toBeNull();
    });
  });

  describe('api routes', () => {
    it('getTicker returns null on error for default exchange', async () => {
      _kraken.fetchTicker = vi.fn().mockRejectedValue(new Error('err'));
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      expect(await ccxtClient.getTicker('BTC/USDT')).toBeNull();
    });
  });

  describe('getExchanges', () => {
    it('returns the ccxt.exchanges array', () => {
      expect(ccxtClient.getExchanges()).toEqual(['kraken', 'binance', 'coinbase']);
    });
  });

  describe('getTicker', () => {
    it('returns a mapped ExchangeTicker', async () => {
      const result = await ccxtClient.getTicker('BTC/USDT', 'kraken');
      expect(result).not.toBeNull();
      expect(result!.exchange).toBe('kraken');
      expect(result!.price).toBe(50000);
      expect(result!.bid).toBe(49990);
      expect(result!.ask).toBe(50010);
    });

    it('falls back to defaults for missing fields', async () => {
      _kraken.fetchTicker = vi.fn().mockResolvedValue({});
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      const result = await ccxtClient.getTicker('BTC/USDT', 'kraken');
      expect(result!.symbol).toBe('BTC/USDT');
      expect(result!.price).toBe(0);
      expect(result!.volume).toBe(0);
    });

    it('uses default exchange when exchangeId is omitted', async () => {
      const result = await ccxtClient.getTicker('BTC/USDT');
      expect(result!.exchange).toBe('kraken');
    });

    it('returns null when fetchTicker rejects', async () => {
      _kraken.fetchTicker = vi.fn().mockRejectedValue(new Error('err'));
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      expect(await ccxtClient.getTicker('BTC/USDT', 'kraken')).toBeNull();
    });
  });

  describe('getOHLCV', () => {
    it('maps raw OHLCV arrays to OHLCVBar objects', async () => {
      const result = await ccxtClient.getOHLCV('BTC/USDT', '1h');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ timestamp: 1000000, open: 50000, high: 51000, low: 49000, close: 50500, volume: 150 });
    });

    it('defaults missing fields to 0', async () => {
      _kraken.fetchOHLCV = vi.fn().mockResolvedValue([[]]);
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      const result = await ccxtClient.getOHLCV('BTC/USDT', '1h');
      expect(result[0]).toEqual({ timestamp: 0, open: 0, high: 0, low: 0, close: 0, volume: 0 });
    });

    it('returns empty array on error', async () => {
      _kraken.fetchOHLCV = vi.fn().mockRejectedValue(new Error('err'));
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      expect(await ccxtClient.getOHLCV('BTC/USDT', '1h')).toEqual([]);
    });
  });

  describe('getOrderBook', () => {
    it('returns a mapped OrderBook', async () => {
      const result = await ccxtClient.getOrderBook('BTC/USDT', 10, 'kraken');
      expect(result).not.toBeNull();
      expect(result!.bids).toHaveLength(1);
      expect(result!.asks).toHaveLength(1);
    });

    it('handles missing entries with 0 defaults', async () => {
      _kraken.fetchOrderBook = vi.fn().mockResolvedValue({
        bids: [[undefined, undefined]], asks: [[undefined, undefined]],
      });
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      const result = await ccxtClient.getOrderBook('ETH/USDT');
      expect(result!.bids[0]).toEqual({ price: 0, amount: 0 });
    });

    it('returns null on error', async () => {
      _kraken.fetchOrderBook = vi.fn().mockRejectedValue(new Error('err'));
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      expect(await ccxtClient.getOrderBook('BTC/USDT')).toBeNull();
    });
  });

  describe('getMultiExchangePrices', () => {
    it('returns non-null results from multiple exchanges', async () => {
      const results = await ccxtClient.getMultiExchangePrices('BTC/USDT');
      expect(results).toHaveLength(3);
    });

    it('filters out null results', async () => {
      _kraken.fetchTicker = vi.fn().mockRejectedValue(new Error('Down'));
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      const results = await ccxtClient.getMultiExchangePrices('BTC/USDT', ['kraken', 'binance']);
      expect(results).toHaveLength(1);
    });

    it('returns empty array when all fail', async () => {
      _kraken.fetchTicker = vi.fn().mockRejectedValue(new Error('fail'));
      _binance.fetchTicker = vi.fn().mockRejectedValue(new Error('fail'));
      _coinbase.fetchTicker = vi.fn().mockRejectedValue(new Error('fail'));
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      const results = await ccxtClient.getMultiExchangePrices('BTC/USDT');
      expect(results).toEqual([]);
    });
  });

  describe('getTopCryptoTickers', () => {
    it('maps ticker data to AssetInfo', async () => {
      const result = await ccxtClient.getTopCryptoTickers(10);
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe('BTC-USDT');
    });

    it('filters to /USDT and /USD pairs only', async () => {
      _kraken.fetchTickers = vi.fn().mockResolvedValue({
        'BTC/USDT': { symbol: 'BTC/USDT', last: 50000, open: 49500, quoteVolume: 1000000, baseVolume: 20, percentage: 1, timestamp: 1000000 },
        'BTC/EUR': { symbol: 'BTC/EUR', last: 46000, open: 45500, quoteVolume: 800000, baseVolume: 17, percentage: 4, timestamp: 1000000 },
      });
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      const result = await ccxtClient.getTopCryptoTickers(10);
      expect(result).toHaveLength(1);
      expect(result.find(t => t.symbol === 'BTC-EUR')).toBeUndefined();
    });

    it('returns empty array on error', async () => {
      _kraken.fetchTickers = vi.fn().mockRejectedValue(new Error('fail'));
      (ccxtClient as unknown as { exchanges: Map<string, unknown> }).exchanges.clear();
      expect(await ccxtClient.getTopCryptoTickers()).toEqual([]);
    });
  });
});