'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import type { Signal } from '@/types/market';
import { signalApiClient } from '@/lib/data/signal-api-client';
import { timeAgo } from '@/lib/utils/format';

function directionStyles(direction: Signal['direction']) {
  switch (direction) {
    case 'BULLISH':
      return {
        icon: <ArrowUpRight size={20} />,
        badge:
          'bg-gradient-to-br from-[color:var(--color-gain-bg)] to-transparent text-[color:var(--color-gain)] border border-[color:var(--color-gain-border)]',
        glow: 'bg-[color:var(--color-gain)]',
      };
    case 'BEARISH':
      return {
        icon: <ArrowDownRight size={20} />,
        badge:
          'bg-gradient-to-br from-[color:var(--color-loss-bg)] to-transparent text-[color:var(--color-loss)] border border-[color:var(--color-loss-border)]',
        glow: 'bg-[color:var(--color-loss)]',
      };
    default:
      return {
        icon: <Activity size={20} />,
        badge:
          'bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-400 border border-blue-500/20',
        glow: 'bg-blue-500',
      };
  }
}

function confidenceColor(confidence: number): string {
  if (confidence >= 80) return 'text-[color:var(--color-gain)]';
  if (confidence >= 60) return 'text-white';
  return 'text-[color:var(--color-text-muted)]';
}

function formatIndicatorValue(value: number): string {
  return Math.abs(value) < 1000 ? value.toFixed(2) : value.toString();
}

function formatPrice(p: number): string {
  if (p < 0.01) return p.toPrecision(4);
  if (p < 1000) return p.toFixed(2);
  return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SignalItem({ signal }: { signal: Signal }) {
  const styles = directionStyles(signal.direction);

  return (
    <article className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-20 ${styles.glow}`}
      />

      <header className="flex items-start justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${styles.badge}`}
          >
            {styles.icon}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-white text-lg">{signal.symbol}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[color:var(--color-text-secondary)]">
                {signal.timeframe}
              </span>
            </div>
            <div className="text-sm font-medium text-[color:var(--color-text-secondary)] mt-0.5">
              {(signal.signalType || (signal as any).signal_type || '').replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end space-x-1">
            <span className="text-sm text-[color:var(--color-text-muted)]">
              Confidence:
            </span>
            <span
              className={`font-bold font-mono-numbers ${confidenceColor(signal.confidence)}`}
            >
              {signal.confidence}%
            </span>
          </div>
          <div className="text-xs text-[color:var(--color-text-muted)] mt-1">
            {timeAgo(signal.timestamp)}
          </div>
        </div>
      </header>

      <p className="mt-4 text-sm text-[color:var(--color-text-secondary)] bg-black/20 p-3 rounded-lg border border-white/5 relative z-10">
        {signal.message}
      </p>

      {signal.entryPrice && signal.tp && signal.sl && (
        <div className="mt-3 flex items-center justify-between gap-3 relative z-10 bg-white/5 p-3 rounded-lg border border-white/5 font-mono-numbers">
           <div className="flex-1 flex flex-col items-center">
             <span className="text-[10px] text-[color:var(--color-text-muted)] uppercase tracking-wider mb-1 font-sans font-semibold">Entry</span>
             <span className="text-white font-bold">${formatPrice(signal.entryPrice)}</span>
           </div>
           <div className="w-px h-6 bg-white/10"></div>
           <div className="flex-1 flex flex-col items-center">
             <span className="text-[10px] text-[color:var(--color-gain)] uppercase tracking-wider mb-1 font-sans font-semibold">Take Profit</span>
             <span className="text-[color:var(--color-gain)] font-bold">${formatPrice(signal.tp)}</span>
           </div>
           <div className="w-px h-6 bg-white/10"></div>
           <div className="flex-1 flex flex-col items-center">
             <span className="text-[10px] text-[color:var(--color-loss)] uppercase tracking-wider mb-1 font-sans font-semibold">Stop Loss</span>
             <span className="text-[color:var(--color-loss)] font-bold">${formatPrice(signal.sl)}</span>
           </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 relative z-10">
        {Object.entries(signal.indicatorValues).map(([key, value]) => (
          <div
            key={key}
            className="text-xs px-2 py-1 rounded bg-white/5 text-[color:var(--color-text-secondary)] border border-white/5"
          >
            <span className="opacity-70 mr-1">{key.toUpperCase()}:</span>
            <span className="text-white font-medium font-mono-numbers">
              {typeof value === 'number' ? formatIndicatorValue(value) : value}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-white/5 bg-white/5 animate-pulse"
        >
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-24 bg-white/10 rounded" />
              <div className="h-4 w-32 bg-white/5 rounded" />
            </div>
            <div className="h-5 w-16 bg-white/10 rounded" />
          </div>
          <div className="mt-4 h-16 w-full bg-black/20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  message,
  tone = 'muted',
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  tone?: 'muted' | 'error';
}) {
  const wrapperCls =
    tone === 'error'
      ? 'bg-[color:var(--color-loss-bg)] text-[color:var(--color-loss)]'
      : 'bg-white/5 text-[color:var(--color-text-muted)]';

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${wrapperCls}`}
      >
        {icon}
      </div>
      <h3 className="text-white font-medium">{title}</h3>
      <p className="text-sm text-[color:var(--color-text-muted)] mt-2 max-w-xs">
        {message}
      </p>
    </div>
  );
}

export function SignalFeed() {
  const { data, isLoading, error } = useQuery<Signal[]>({
    queryKey: ['signals'],
    queryFn: async () => {
      const result = await signalApiClient.scanSignals();
      return result?.signals ?? [];
    },
    refetchInterval: 60_000,
  });

  const showEmpty = !isLoading && !error && data && data.length === 0;

  return (
    <section className="glass-panel p-4 sm:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Live Signal Feed</h2>
          <p className="text-sm text-[color:var(--color-text-muted)] mt-1">
            AI-generated technical analysis signals
          </p>
        </div>
        <button className="flex items-center space-x-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
          <span>View All</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {isLoading && <LoadingSkeleton />}

        {error && (
          <EmptyState
            icon={<AlertCircle size={24} />}
            title="Signal Engine Offline"
            message="Make sure the Python signal service is running on port 8000."
            tone="error"
          />
        )}

        {showEmpty && (
          <EmptyState
            icon={<Activity size={24} />}
            title="No Active Signals"
            message="The market is currently quiet based on your defined indicators."
          />
        )}

        {data?.map((signal, idx) => (
          <SignalItem
            key={`${signal.symbol}-${signal.signalType}-${idx}`}
            signal={signal}
          />
        ))}
      </div>
    </section>
  );
}
