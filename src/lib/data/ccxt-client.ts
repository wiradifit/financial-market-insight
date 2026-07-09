import ccxt, { type Exchange } from 'ccxt';
import type {
  AssetInfo,
  ExchangeTicker,
  OHLCVBar,
  OrderBook,
} from '@/types/market';

type CcxtNamespace = typeof ccxt & Record<string, new (config?: object) => Exchange>;

class CryptoDataClient {
  private exchanges: Map<string, Exchange> = new Map();
  private defaultExchange = 'kraken';

  private getExchange(exchangeId: string = this.defaultExchange): Exchange {
    const cached = this.exchanges.get(exchangeId);
    if (cached) return cached;

    const namespace = ccxt as CcxtNamespace;
    const ExchangeCtor = namespace[exchangeId];
    if (typeof ExchangeCtor !== 'function') {
      throw new Error(`Exchange "${exchangeId}" not found in ccxt.`);
    }

    const exchange = new ExchangeCtor({ enableRateLimit: true });
    this.exchanges.set(exchangeId, exchange);
    return exchange;
  }

  getExchanges(): string[] {
    return ccxt.exchanges;
  }

  async getTicker(
    symbol: string,
    exchangeId?: string
  ): Promise<ExchangeTicker | null> {
    try {
      const exchange = this.getExchange(exchangeId);
      const ticker = await exchange.fetchTicker(symbol);
      return {
        exchange: exchange.id,
        symbol: ticker.symbol ?? symbol,
        price: ticker.last ?? 0,
        bid: ticker.bid ?? 0,
        ask: ticker.ask ?? 0,
        volume: ticker.baseVolume ?? 0,
        timestamp: ticker.timestamp ?? Date.now(),
      };
    } catch (error) {
      console.error(
        `[ccxt] fetchTicker ${symbol} on ${exchangeId ?? this.defaultExchange}:`,
        error
      );
      return null;
    }
  }

  async getOHLCV(
    symbol: string,
    timeframe: string,
    since?: number,
    limit?: number,
    exchangeId?: string
  ): Promise<OHLCVBar[]> {
    try {
      const exchange = this.getExchange(exchangeId);
      const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, since, limit);
      return ohlcv.map(candle => ({
        timestamp: candle[0] ?? 0,
        open: candle[1] ?? 0,
        high: candle[2] ?? 0,
        low: candle[3] ?? 0,
        close: candle[4] ?? 0,
        volume: candle[5] ?? 0,
      }));
    } catch (error) {
      console.error(
        `[ccxt] fetchOHLCV ${symbol} on ${exchangeId ?? this.defaultExchange}:`,
        error
      );
      return [];
    }
  }

  async getOrderBook(
    symbol: string,
    limit?: number,
    exchangeId?: string
  ): Promise<OrderBook | null> {
    try {
      const exchange = this.getExchange(exchangeId);
      const orderBook = await exchange.fetchOrderBook(symbol, limit);
      return {
        symbol: orderBook.symbol ?? symbol,
        bids: orderBook.bids.map(([price, amount]) => ({
          price: price ?? 0,
          amount: amount ?? 0,
        })),
        asks: orderBook.asks.map(([price, amount]) => ({
          price: price ?? 0,
          amount: amount ?? 0,
        })),
        timestamp: orderBook.timestamp ?? Date.now(),
      };
    } catch (error) {
      console.error(
        `[ccxt] fetchOrderBook ${symbol} on ${exchangeId ?? this.defaultExchange}:`,
        error
      );
      return null;
    }
  }

  async getMultiExchangePrices(
    symbol: string,
    exchangeIds: string[] = ['binance', 'kraken', 'coinbase']
  ): Promise<ExchangeTicker[]> {
    const results = await Promise.all(
      exchangeIds.map(id => this.getTicker(symbol, id))
    );
    return results.filter((t): t is ExchangeTicker => t !== null);
  }

  async getTopCryptoTickers(limit = 20): Promise<AssetInfo[]> {
    try {
      const exchange = this.getExchange('kraken');
      const tickers = await exchange.fetchTickers();

      return Object.values(tickers)
        .filter(
          (t): t is typeof t & { symbol: string } =>
            typeof t.symbol === 'string' && (t.symbol.endsWith('/USDT') || t.symbol.endsWith('/USD'))
        )
        .sort((a, b) => (b.quoteVolume ?? 0) - (a.quoteVolume ?? 0))
        .slice(0, limit)
        .map(t => ({
          symbol: t.symbol.replace('/', '-'),
          name: t.symbol.split('/')[0],
          price: t.last ?? 0,
          change: (t.last ?? 0) - (t.open ?? 0),
          changePercent: t.percentage ?? 0,
          high24h: t.high ?? 0,
          low24h: t.low ?? 0,
          volume: t.baseVolume ?? 0,
          lastUpdated: t.timestamp ?? Date.now(),
        }));
    } catch (error) {
      console.error('[ccxt] getTopCryptoTickers:', error);
      return [];
    }
  }
}

export const ccxtClient = new CryptoDataClient();
