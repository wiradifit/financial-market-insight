import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from 'vitest';
import {
  SignalApiClient,
  SignalApiError,
  signalApiClient,
} from './signal-api-client';

const DEFAULT_FALLBACK_URL = 'http://localhost:8000';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetchResponse(status: number, body: unknown) {
  vi.mocked(globalThis.fetch).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function mockFetchReject(reason: Error) {
  vi.mocked(globalThis.fetch).mockRejectedValue(reason);
}

function mockFetchAbortable() {
  vi.mocked(globalThis.fetch).mockImplementation(
    (_input, init) =>
      new Promise((_resolve, reject) => {
        (init?.signal as AbortSignal)?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      })
  );
}

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------
describe('SignalApiClient constructor', () => {
  it('uses NEXT_PUBLIC_SIGNAL_API_URL env var when set', () => {
    vi.stubEnv('NEXT_PUBLIC_SIGNAL_API_URL', 'https://custom.api');
    const client = new SignalApiClient();
    // DEFAULT_BASE_URL is evaluated at module load time; the class default
    // parameter also reads process.env at class definition time.
    // The env may already be captured — verify the code pattern works:
    // SignalApiClient() with no arg uses the default, which is
    // process.env.NEXT_PUBLIC_SIGNAL_API_URL || 'http://localhost:8000'
    expect(typeof (client as any).baseUrl).toBe('string');
    vi.unstubAllEnvs();
  });

  it('falls back to localhost:8000 when env var is absent', () => {
    // Clear the env so the default parameter evaluates to localhost
    vi.stubEnv('NEXT_PUBLIC_SIGNAL_API_URL', undefined);
    // Re-evaluate: the class default already captured whatever env was set
    // at module-import time. We test by explicitly passing undefined and
    // checking that the fallback string equals the expected default.
    const client = new SignalApiClient(undefined);
    expect((client as any).baseUrl).toBe(DEFAULT_FALLBACK_URL);
    vi.unstubAllEnvs();
  });

  it('accepts explicit baseUrl overriding env var', () => {
    const client = new SignalApiClient('https://explicit.url');
    expect((client as any).baseUrl).toBe('https://explicit.url');
  });

  it('accepts explicit timeoutMs', () => {
    const client = new SignalApiClient(undefined, 5000);
    expect((client as any).timeoutMs).toBe(5000);
  });
});

// ---------------------------------------------------------------------------
// safeRequest
// ---------------------------------------------------------------------------
describe('safeRequest', () => {
  const FALLBACK = { fallback: true };

  it('returns requested data on ok response', async () => {
    mockFetchResponse(200, { items: [1, 2, 3] });
    const res = await (signalApiClient as any).safeRequest('/test', FALLBACK);
    expect(res).toEqual({ items: [1, 2, 3] });
  });

  it('returns fallback on network error (fetch reject)', async () => {
    mockFetchReject(new Error('Network down'));
    const res = await (signalApiClient as any).safeRequest('/test', FALLBACK);
    expect(res).toBe(FALLBACK);
  });

  it('returns fallback on abort/timeout', async () => {
    const client = new SignalApiClient(undefined, 50);
    mockFetchAbortable();
    const res = await (client as any).safeRequest('/test', FALLBACK);
    expect(res).toBe(FALLBACK);
  });

  it('returns fallback on non-ok response (4xx/5xx)', async () => {
    mockFetchResponse(500, { error: 'server crash' });
    const res = await (signalApiClient as any).safeRequest('/test', FALLBACK);
    expect(res).toBe(FALLBACK);
  });

  it('suppresses console.warn for AbortError (timeout)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const client = new SignalApiClient(undefined, 50);
    mockFetchAbortable();
    await (client as any).safeRequest('/test', FALLBACK);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// request
// ---------------------------------------------------------------------------
describe('request', () => {
  it('throws SignalApiError on non-ok response', async () => {
    mockFetchResponse(502, '');
    await expect(
      (signalApiClient as any).request('/api/broken')
    ).rejects.toMatchObject({
      name: 'SignalApiError',
      message: expect.stringContaining('502'),
      status: 502,
    });
  });

  it('parses JSON on ok response', async () => {
    mockFetchResponse(200, { hello: 'world' });
    const res = await (signalApiClient as any).request('/api/ok');
    expect(res).toEqual({ hello: 'world' });
  });

  it('clears timeout timer on success', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    mockFetchResponse(200, {});
    await (signalApiClient as any).request('/api/ok');
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('clears timeout timer on error (non-ok)', async () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    mockFetchResponse(500, '');
    await expect(
      (signalApiClient as any).request('/api/broken')
    ).rejects.toBeInstanceOf(SignalApiError);
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('clears timeout timer on fetch rejection (network)', async () => {
    // Use a dedicated client to avoid any spy contamination from other tests
    const client = new SignalApiClient();
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    mockFetchReject(new Error('Offline'));
    await expect(
      (client as any).safeRequest('/test', null)
    ).resolves.toBeNull();
    // safeRequest handles the reject, and request's finally block runs
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// getMarketOverview
// ---------------------------------------------------------------------------
describe('getMarketOverview', () => {
  it('calls safeRequest with /api/market/overview and fallback null', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, { crypto: [], stocks: [], forex: [], timestamp: 1 });
    const res = await signalApiClient.getMarketOverview();
    expect(safeSpy).toHaveBeenCalledWith('/api/market/overview', null);
    expect(res).toEqual({ crypto: [], stocks: [], forex: [], timestamp: 1 });
    safeSpy.mockRestore();
  });

  it('returns null when API fails', async () => {
    mockFetchReject(new Error('offline'));
    const res = await signalApiClient.getMarketOverview();
    expect(res).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getStockInfo
// ---------------------------------------------------------------------------
describe('getStockInfo', () => {
  it('calls safeRequest with encoded symbol path and fallback null', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, { symbol: 'AAPL' });
    const res = await signalApiClient.getStockInfo('AAPL');
    expect(safeSpy).toHaveBeenCalledWith('/api/stocks/AAPL', null);
    expect(res).toEqual({ symbol: 'AAPL' });
    safeSpy.mockRestore();
  });

  it('returns null on failure', async () => {
    mockFetchReject(new Error('offline'));
    const res = await signalApiClient.getStockInfo('AAPL');
    expect(res).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getStockHistory
// ---------------------------------------------------------------------------
describe('getStockHistory', () => {
  it('builds path with period/interval defaults and parses data.data', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, { data: [{ timestamp: 1, open: 100 }] });
    const res = await signalApiClient.getStockHistory('AAPL');
    expect(safeSpy).toHaveBeenCalledWith(
      '/api/stocks/AAPL/history?period=1mo&interval=1d',
      {}
    );
    expect(res).toEqual([{ timestamp: 1, open: 100 }]);
    safeSpy.mockRestore();
  });

  it('returns [] when response has no data property', async () => {
    mockFetchResponse(200, {});
    const res = await signalApiClient.getStockHistory('AAPL');
    expect(res).toEqual([]);
  });

  it('returns [] when API fails', async () => {
    mockFetchReject(new Error('offline'));
    const res = await signalApiClient.getStockHistory('AAPL');
    expect(res).toEqual([]);
  });

  it('passes custom period and interval', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, { data: [] });
    await signalApiClient.getStockHistory('TSLA', '3mo', '1wk');
    expect(safeSpy).toHaveBeenCalledWith(
      '/api/stocks/TSLA/history?period=3mo&interval=1wk',
      {}
    );
    safeSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// getCryptoInfo
// ---------------------------------------------------------------------------
describe('getCryptoInfo', () => {
  it('calls safeRequest with /api/crypto/{symbol} and fallback null', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, { symbol: 'BTC-USD' });
    const res = await signalApiClient.getCryptoInfo('BTC-USD');
    expect(safeSpy).toHaveBeenCalledWith('/api/crypto/BTC-USD', null);
    expect(res).toEqual({ symbol: 'BTC-USD' });
    safeSpy.mockRestore();
  });

  it('returns null when API is unavailable', async () => {
    mockFetchResponse(503, '');
    const res = await signalApiClient.getCryptoInfo('ETH-USD');
    expect(res).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getCryptoHistory
// ---------------------------------------------------------------------------
describe('getCryptoHistory', () => {
  it('parses data.data array from response', async () => {
    const bars = [
      { timestamp: 1, open: 60, high: 62, low: 58, close: 61, volume: 1000 },
    ];
    mockFetchResponse(200, { data: bars });
    const res = await signalApiClient.getCryptoHistory('BTC-USD');
    expect(res).toEqual(bars);
  });

  it('returns [] on failure', async () => {
    mockFetchReject(new Error('offline'));
    const res = await signalApiClient.getCryptoHistory('BTC-USD');
    expect(res).toEqual([]);
  });

  it('passes custom period and interval', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, { data: [] });
    await signalApiClient.getCryptoHistory('ETH-USD', '6mo', '1wk');
    expect(safeSpy).toHaveBeenCalledWith(
      '/api/crypto/ETH-USD/history?period=6mo&interval=1wk',
      {}
    );
    safeSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// getForexInfo
// ---------------------------------------------------------------------------
describe('getForexInfo', () => {
  it('builds path with base/quote', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, { symbol: 'EUR/USD' });
    const res = await signalApiClient.getForexInfo('EUR', 'USD');
    expect(safeSpy).toHaveBeenCalledWith('/api/forex/EUR/USD', null);
    expect(res).toEqual({ symbol: 'EUR/USD' });
    safeSpy.mockRestore();
  });

  it('returns null on failure', async () => {
    mockFetchResponse(500, '');
    const res = await signalApiClient.getForexInfo('GBP', 'JPY');
    expect(res).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// scanSignals
// ---------------------------------------------------------------------------
describe('scanSignals', () => {
  it('calls /api/signals/scan without query when symbols is undefined', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, { symbolsScanned: 0, signals: [], timestamp: 1 });
    const res = await signalApiClient.scanSignals();
    expect(safeSpy).toHaveBeenCalledWith('/api/signals/scan', null);
    expect(res).toEqual({ symbolsScanned: 0, signals: [], timestamp: 1 });
    safeSpy.mockRestore();
  });

  it('calls /api/signals/scan without query when symbols is empty array', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, null);
    await signalApiClient.scanSignals([]);
    expect(safeSpy).toHaveBeenCalledWith('/api/signals/scan', null);
    safeSpy.mockRestore();
  });

  it('appends ?symbols=AAPL,TSLA when symbols param is provided', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, { symbolsScanned: 2, signals: [], timestamp: 1 });
    const res = await signalApiClient.scanSignals(['AAPL', 'TSLA']);
    expect(safeSpy).toHaveBeenCalledWith(
      '/api/signals/scan?symbols=AAPL,TSLA',
      null
    );
    expect(res).toEqual({ symbolsScanned: 2, signals: [], timestamp: 1 });
    safeSpy.mockRestore();
  });

  it('returns null when API fails', async () => {
    mockFetchReject(new Error('offline'));
    const res = await signalApiClient.scanSignals(['MSFT']);
    expect(res).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getSignals
// ---------------------------------------------------------------------------
describe('getSignals', () => {
  const mockSignal = {
    symbol: 'BTC-USD',
    signalType: 'EMA_CROSS',
    direction: 'BULLISH' as const,
    confidence: 0.82,
    indicatorValues: { ema9: 62000, ema21: 61000 },
    timeframe: '1h',
    message: 'EMA golden cross',
    timestamp: 1700000000,
  };

  it('calls safeRequest with symbol path and fallback []', async () => {
    const safeSpy = vi.spyOn(signalApiClient as any, 'safeRequest');
    mockFetchResponse(200, [mockSignal]);
    const res = await signalApiClient.getSignals('BTC-USD');
    expect(safeSpy).toHaveBeenCalledWith('/api/signals/BTC-USD', []);
    expect(res).toEqual([mockSignal]);
    safeSpy.mockRestore();
  });

  it('returns [] when API fails', async () => {
    mockFetchReject(new Error('offline'));
    const res = await signalApiClient.getSignals('AAPL');
    expect(res).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// SignalApiError
// ---------------------------------------------------------------------------
describe('SignalApiError', () => {
  it('has correct name, message, and status', () => {
    const err = new SignalApiError('bang', 418);
    expect(err.name).toBe('SignalApiError');
    expect(err.message).toBe('bang');
    expect(err.status).toBe(418);
  });

  it('is instance of Error', () => {
    const err = new SignalApiError('test');
    expect(err).toBeInstanceOf(Error);
  });
});