export interface OHLCVBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AssetInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  marketCap?: number;
  lastUpdated: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

export interface ExchangeTicker {
  exchange: string;
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: number;
}

export type SignalDirection = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface Signal {
  symbol: string;
  signalType: string;
  direction: SignalDirection;
  confidence: number;
  indicatorValues: Record<string, number>;
  timeframe: string;
  message: string;
  timestamp: number;
}

export interface MarketOverview {
  crypto: AssetInfo[];
  stocks: AssetInfo[];
  forex: AssetInfo[];
  timestamp: number;
}

export interface ScanResult {
  symbolsScanned: number;
  signals: Signal[];
  timestamp: number;
}

export interface NewsItem {
  id?: string;
  uuid?: string;
  content?: {
    title: string;
    pubDate: string;
    provider?: { displayName: string };
    clickThroughUrl?: { url: string };
  };
  title?: string;
  publisher?: string;
  link?: string;
  providerPublishTime?: number;
  type?: string;
  related_symbol: string;
}
