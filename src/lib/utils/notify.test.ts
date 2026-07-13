import { describe, it, expect, vi } from 'vitest';
import { sendTelegramNotification, batchSendTelegram } from '@/lib/utils/notify';
import type { SignalAlert } from '@/lib/stores/notifications';

const mockAlert = (overrides: Partial<SignalAlert> = {}): SignalAlert => ({
  id: 'BTC-BULLISH-RSI-123',
  symbol: 'BTC-USD',
  direction: 'BULLISH',
  signalType: 'RSI_OVERSOLD',
  confidence: 85,
  message: 'RSI oversold bounce expected',
  entryPrice: 62000,
  tp: 65000,
  sl: 60000,
  timestamp: Date.now(),
  ...overrides,
});

describe('sendTelegramNotification', () => {
  it('returns true on successful send', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const result = await sendTelegramNotification(
      mockAlert(),
      'test-bot-token',
      '-100123456789'
    );
    expect(result).toBe(true);

    vi.unstubAllGlobals();
  });

  it('returns false when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const result = await sendTelegramNotification(
      mockAlert(),
      'test-bot-token',
      '-100123456789'
    );
    expect(result).toBe(false);

    vi.unstubAllGlobals();
  });

  it('returns false when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400 }));

    const result = await sendTelegramNotification(
      mockAlert(),
      'test-bot-token',
      '-100123456789'
    );
    expect(result).toBe(false);

    vi.unstubAllGlobals();
  });

  it('calls telegram API with correct URL and body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await sendTelegramNotification(mockAlert(), 'token123', 'chat456');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottoken123/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('chat456'),
      })
    );

    vi.unstubAllGlobals();
  });

  it('builds message for BEARISH signals', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    await sendTelegramNotification(
      mockAlert({ direction: 'BEARISH', signalType: 'MACD_BEARISH_CROSS' }),
      't',
      'c'
    );

    vi.unstubAllGlobals();
  });

  it('builds message for NEUTRAL signals without entry/tp/sl', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    await sendTelegramNotification(
      mockAlert({ direction: 'NEUTRAL', entryPrice: undefined, tp: undefined, sl: undefined }),
      't',
      'c'
    );

    vi.unstubAllGlobals();
  });

  it('handles formatPrice for small values', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    await sendTelegramNotification(
      mockAlert({ entryPrice: 0.00000123, tp: 0.01, sl: 0.000002 }),
      't',
      'c'
    );

    vi.unstubAllGlobals();
  });

  it('handles formatPrice for large values', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    await sendTelegramNotification(
      mockAlert({ entryPrice: 150000, tp: 160000, sl: 140000 }),
      't',
      'c'
    );

    vi.unstubAllGlobals();
  });
});

describe('batchSendTelegram', () => {
  it('returns sent and failed counts', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true })
        .mockRejectedValueOnce(new Error('fail'))
    );

    const alerts = [mockAlert(), mockAlert({ id: 'B2' }), mockAlert({ id: 'B3' })];
    const result = await batchSendTelegram(alerts, 'token', 'chat');

    expect(result.sent).toBe(2);
    expect(result.failed).toBe(1);

    vi.unstubAllGlobals();
  });

  it('returns zero when all fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));

    const result = await batchSendTelegram([mockAlert()], 'token', 'chat');

    expect(result).toEqual({ sent: 0, failed: 1 });

    vi.unstubAllGlobals();
  });

  it('handles empty array', async () => {
    const result = await batchSendTelegram([], 'token', 'chat');
    expect(result).toEqual({ sent: 0, failed: 0 });
  });
});