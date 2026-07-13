'use client';

import { useState, useEffect, useCallback } from 'react';
import { BellRing, Send, Trash2, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useNotificationStore, type SignalAlert } from '@/lib/stores/notifications';
import { batchSendTelegram } from '@/lib/utils/notify';
import { timeAgo } from '@/lib/utils/format';

function formatPrice(p: number): string {
  if (p < 0.01) return p.toPrecision(4);
  if (p < 1000) return p.toFixed(2);
  return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STORAGE_KEY = 'fmi-notification-config';

interface NotifConfig {
  telegramBotToken: string;
  telegramChatId: string;
  enabled: boolean;
  minConfidence: number;
}

function loadConfig(): NotifConfig {
  if (typeof window === 'undefined') {
    return { telegramBotToken: '', telegramChatId: '', enabled: false, minConfidence: 50 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { telegramBotToken: '', telegramChatId: '', enabled: false, minConfidence: 50 };
}

function saveConfig(config: NotifConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export default function SettingsPage() {
  const [config, setConfig] = useState<NotifConfig>(loadConfig);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState('');

  const alerts = useNotificationStore((s) => s.alerts);
  const markSent = useNotificationStore((s) => s.markSent);
  const clear = useNotificationStore((s) => s.clear);

  const unsent = alerts.filter(
    (a) => !a.sent && a.confidence >= config.minConfidence
  );

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  const sendAlerts = useCallback(async () => {
    if (!config.telegramBotToken || !config.telegramChatId) {
      setError('Telegram Bot Token and Chat ID are required');
      return;
    }
    if (unsent.length === 0) {
      setError('No unsent alerts to dispatch');
      return;
    }

    setSending(true);
    setError('');
    setResult(null);

    const res = await batchSendTelegram(unsent, config.telegramBotToken, config.telegramChatId);
    setResult(res);

    for (const alert of unsent.slice(0, res.sent)) {
      markSent(alert.id);
    }

    setSending(false);
  }, [config, unsent, markSent]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Notifications</h1>
        <p className="text-sm sm:text-base text-[color:var(--color-text-muted)]">
          Configure real-time signal alerts via Telegram
        </p>
      </header>

      <section className="glass-panel p-4 sm:p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <BellRing size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Telegram Configuration</h2>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Free — create a bot via{' '}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                @BotFather
              </a>{' '}
              on Telegram
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Telegram Bot Token
            </label>
            <input
              type="text"
              value={config.telegramBotToken}
              onChange={(e) => setConfig({ ...config, telegramBotToken: e.target.value.trim() })}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              className="input-field w-full font-mono-numbers text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={config.telegramChatId}
              onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value.trim() })}
              placeholder="-1001234567890 or 123456789"
              className="input-field w-full font-mono-numbers text-sm"
            />
            <p className="text-[10px] text-[color:var(--color-text-muted)] mt-1">
              Get it from{' '}
              <a
                href="https://t.me/userinfobot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                @userinfobot
              </a>
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">Enable min confidence</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={30}
                max={90}
                value={config.minConfidence}
                onChange={(e) => setConfig({ ...config, minConfidence: parseInt(e.target.value) })}
                className="w-24 accent-blue-500"
              />
              <span className="text-xs font-bold text-white font-mono-numbers w-8 text-right">
                {config.minConfidence}%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Send size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Pending Alerts</h2>
              <p className="text-xs text-[color:var(--color-text-muted)]">
                {unsent.length} unsent signal{unsent.length !== 1 ? 's' : ''} above {config.minConfidence}% confidence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clear}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={14} />
              Clear
            </button>
            <button
              onClick={sendAlerts}
              disabled={sending || unsent.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              <Send size={14} />
              {sending ? 'Sending...' : `Send ${unsent.length}`}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {result && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-1.5 text-green-400 text-sm">
              <CheckCircle2 size={16} />
              <span className="font-semibold">{result.sent} sent</span>
            </div>
            {result.failed > 0 && (
              <div className="flex items-center gap-1.5 text-red-400 text-sm">
                <XCircle size={16} />
                <span className="font-semibold">{result.failed} failed</span>
              </div>
            )}
          </div>
        )}

        {alerts.length === 0 && (
          <p className="text-sm text-center text-[color:var(--color-text-muted)] py-6">
            No alerts yet. Alerts appear here when Signal Feed detects new signals above {config.minConfidence}% confidence.
          </p>
        )}

        {alerts.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {alerts.map((alert) => {
              const color =
                alert.direction === 'BULLISH'
                  ? 'border-green-500/20'
                  : alert.direction === 'BEARISH'
                    ? 'border-red-500/20'
                    : 'border-amber-500/20';

              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border bg-white/5 transition-colors ${color} ${alert.sent ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{alert.symbol}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                        alert.direction === 'BULLISH'
                          ? 'bg-green-500/10 text-green-400'
                          : alert.direction === 'BEARISH'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {alert.direction}
                      </span>
                      <span className="text-[10px] text-[color:var(--color-text-muted)]">
                        {alert.confidence}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[color:var(--color-text-muted)]">
                        {timeAgo(alert.timestamp)}
                      </span>
                      {alert.sent && (
                        <CheckCircle2 size={12} className="text-green-400" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[color:var(--color-text-secondary)] mb-1">
                    {alert.signalType.replace(/_/g, ' ')}: {alert.message.slice(0, 100)}
                  </p>
                  {alert.entryPrice && (
                    <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-mono-numbers">
                      <span className="text-[color:var(--color-text-muted)]">E: ${formatPrice(alert.entryPrice)}</span>
                      <span className="text-[color:var(--color-gain)]">TP: ${formatPrice(alert.tp ?? 0)}</span>
                      <span className="text-[color:var(--color-loss)]">SL: ${formatPrice(alert.sl ?? 0)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="glass-panel p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <ExternalLink size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">How to set up</h2>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              All free — no paid services required
            </p>
          </div>
        </div>

        <ol className="space-y-3 text-sm text-[color:var(--color-text-secondary)] list-decimal list-inside">
          <li>
            Open Telegram and message{' '}
            <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              @BotFather
            </a>
            . Type <code className="text-xs bg-white/10 px-1 py-0.5 rounded">/newbot</code> and follow the prompts.
          </li>
          <li>
            Copy the <strong>token</strong> BotFather gives you. It starts with a number followed by a colon.
          </li>
          <li>
            Start a chat with your bot, then message{' '}
            <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              @userinfobot
            </a>{' '}
            to get your Chat ID.
          </li>
          <li>Paste both values above and click Send.</li>
        </ol>
      </section>
    </div>
  );
}