'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';
import type { Signal } from '@/types/market';
import { signalApiClient } from '@/lib/data/signal-api-client';

function formatPrice(p: number): string {
  if (p < 0.01) return p.toPrecision(4);
  if (p < 1000) return p.toFixed(2);
  return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function signalColor(dir: string) {
  if (dir === 'BULLISH') return 'text-green-400 bg-green-500/10 border-green-500/20';
  if (dir === 'BEARISH') return 'text-red-400 bg-red-500/10 border-red-500/20';
  return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
}

export function SignalPanel({ symbol }: { symbol: string }) {
  const { data: signals, isLoading } = useQuery<Signal[]>({
    queryKey: ['signals', symbol],
    queryFn: () => signalApiClient.getSignals(symbol),
    refetchInterval: 60_000,
    enabled: !!symbol,
  });

  const hasSignals = signals && signals.length > 0;

  return (
    <div className="glass-panel p-4 flex flex-col h-full max-h-[500px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Activity size={16} className="text-blue-400" />
          Signals for {symbol}
        </h3>
        {hasSignals && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {signals.length} active
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                <div className="h-3 w-40 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !hasSignals && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity size={24} className="text-[color:var(--color-text-muted)] mb-2" />
            <p className="text-xs text-[color:var(--color-text-muted)]">
              No active signals for this symbol
            </p>
          </div>
        )}

        {signals?.map((signal, i) => {
          const dirIcon = signal.direction === 'BULLISH'
            ? <ArrowUpRight size={14} />
            : signal.direction === 'BEARISH'
              ? <ArrowDownRight size={14} />
              : <Activity size={14} />;

          return (
            <div
              key={`${signal.signalType}-${i}`}
              className={`p-3 rounded-lg border bg-white/5 transition-colors ${signalColor(signal.direction)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {dirIcon}
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {signal.direction}
                  </span>
                </div>
                <span className="text-[10px] text-[color:var(--color-text-muted)]">
                  {signal.timeframe}
                </span>
              </div>

              <p className="text-xs text-[color:var(--color-text-secondary)] mb-1 leading-relaxed">
                {signal.signalType.replace(/_/g, ' ')}
              </p>

              <div className="flex items-center gap-2 mb-2">
                <div className="confidence-bar flex-1">
                  <div
                    className="confidence-bar-fill"
                    style={{
                      width: `${signal.confidence}%`,
                      background:
                        signal.confidence >= 80
                          ? 'var(--color-gain)'
                          : signal.confidence >= 60
                            ? '#3b82f6'
                            : 'var(--color-text-muted)',
                    }}
                  />
                </div>
                <span className="text-xs font-bold font-mono-numbers text-white">
                  {signal.confidence}%
                </span>
              </div>

              {signal.entryPrice && signal.tp && signal.sl && (
                <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-mono-numbers bg-black/20 rounded p-1.5">
                  <div>
                    <span className="text-[color:var(--color-text-muted)] block">Entry</span>
                    <span className="text-white font-bold">${formatPrice(signal.entryPrice)}</span>
                  </div>
                  <div>
                    <span className="text-[color:var(--color-gain)] block">TP</span>
                    <span className="text-[color:var(--color-gain)] font-bold">${formatPrice(signal.tp)}</span>
                  </div>
                  <div>
                    <span className="text-[color:var(--color-loss)] block">SL</span>
                    <span className="text-[color:var(--color-loss)] font-bold">${formatPrice(signal.sl)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}