import {
  AssetInfo,
  MarketOverview,
  OHLCVBar,
  ScanResult,
  Signal,
} from '@/types/market';

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_SIGNAL_API_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 10_000;

class SignalApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'SignalApiError';
  }
}

class SignalApiClient {
  constructor(
    private readonly baseUrl: string = DEFAULT_BASE_URL,
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS
  ) {}

  /** Core fetcher with timeout + JSON parsing. Throws `SignalApiError` on failure. */
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...init.headers },
      });
      if (!res.ok) {
        throw new SignalApiError(
          `Signal API ${path} failed with ${res.status}`,
          res.status
        );
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Safe wrapper that logs & returns fallback instead of throwing. */
  private async safeRequest<T>(path: string, fallback: T): Promise<T> {
    try {
      return await this.request<T>(path);
    } catch (error) {
      // Non-fatal by design: network/abort failures fall back to `fallback`.
      // warn (not error) so Next's dev overlay doesn't treat an offline
      // backend as a crash. ponytail: warn covers it; escalate only if a
      // failed scan should ever be user-visible as an error.
      if ((error as Error).name !== 'AbortError') {
        console.warn(`[signal-api] ${path} unavailable:`, (error as Error).message);
      }
      return fallback;
    }
  }

  getMarketOverview(): Promise<MarketOverview | null> {
    return this.safeRequest<MarketOverview | null>(
      '/api/market/overview',
      null
    );
  }

  getStockInfo(symbol: string): Promise<AssetInfo | null> {
    return this.safeRequest<AssetInfo | null>(
      `/api/stocks/${encodeURIComponent(symbol)}`,
      null
    );
  }

  async getStockHistory(
    symbol: string,
    period = '1mo',
    interval = '1d'
  ): Promise<OHLCVBar[]> {
    const path = `/api/stocks/${encodeURIComponent(
      symbol
    )}/history?period=${period}&interval=${interval}`;
    const data = await this.safeRequest<{ data?: OHLCVBar[] }>(path, {});
    return data.data ?? [];
  }

  getCryptoInfo(symbol: string): Promise<AssetInfo | null> {
    return this.safeRequest<AssetInfo | null>(
      `/api/crypto/${encodeURIComponent(symbol)}`,
      null
    );
  }

  async getCryptoHistory(
    symbol: string,
    period = '1mo',
    interval = '1d'
  ): Promise<OHLCVBar[]> {
    const path = `/api/crypto/${encodeURIComponent(
      symbol
    )}/history?period=${period}&interval=${interval}`;
    const data = await this.safeRequest<{ data?: OHLCVBar[] }>(path, {});
    return data.data ?? [];
  }

  getForexInfo(base: string, quote: string): Promise<AssetInfo | null> {
    return this.safeRequest<AssetInfo | null>(
      `/api/forex/${encodeURIComponent(base)}/${encodeURIComponent(quote)}`,
      null
    );
  }

  scanSignals(symbols?: string[]): Promise<ScanResult | null> {
    const query = symbols?.length ? `?symbols=${symbols.join(',')}` : '';
    return this.safeRequest<ScanResult | null>(
      `/api/signals/scan${query}`,
      null
    );
  }

  getSignals(symbol: string): Promise<Signal[]> {
    return this.safeRequest<Signal[]>(
      `/api/signals/${encodeURIComponent(symbol)}`,
      []
    );
  }
}

export const signalApiClient = new SignalApiClient();
export { SignalApiError, SignalApiClient };
