'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import type { AssetInfo } from '@/types/market';
import {
  formatCurrency,
  formatPercent,
  getChangeColor,
  timeAgo,
} from '@/lib/utils/format';

interface TickersResponse {
  data: AssetInfo[];
  timestamp: number;
}

function AssetRow({ asset }: { asset: AssetInfo }) {
  const isPositive = asset.change >= 0;
  const changeColor = getChangeColor(asset.changePercent);

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors cursor-pointer">
      <div className="flex items-center space-x-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 ${changeColor}`}
        >
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
        <div>
          <div className="font-medium text-white">{asset.symbol}</div>
          <div className="text-xs text-[color:var(--color-text-muted)] flex items-center">
            <Clock size={10} className="mr-1" />
            {timeAgo(asset.lastUpdated)}
          </div>
        </div>
      </div>

      <div className="text-right font-mono-numbers">
        <div className="font-semibold text-white">
          {formatCurrency(asset.price)}
        </div>
        <div className={`text-sm ${changeColor}`}>
          {isPositive ? '+' : ''}
          {formatCurrency(asset.change)} ({formatPercent(asset.changePercent)})
        </div>
      </div>
    </div>
  );
}

export function MarketOverviewCard() {
  const { data, isLoading, error } = useQuery<TickersResponse>({
    queryKey: ['topCrypto'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/tickers?limit=5');
      if (!res.ok) throw new Error('Failed to fetch crypto tickers');
      return res.json();
    },
    refetchInterval: 30_000,
  });

  return (
    <section className="glass-panel p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold text-white">Market Overview</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Crypto
        </span>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-16" />
                  <div className="skeleton h-3 w-12" />
                </div>
              </div>
              <div className="space-y-2 items-end flex flex-col">
                <div className="skeleton h-4 w-20" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-sm text-[color:var(--color-loss)] p-4 bg-[color:var(--color-loss-bg)] rounded-lg border border-[color:var(--color-loss-border)]">
          Failed to load market data. The exchange API may be rate-limited.
        </div>
      )}

      {data?.data && (
        <div className="space-y-1">
          {data.data.map(asset => (
            <AssetRow key={asset.symbol} asset={asset} />
          ))}
        </div>
      )}
    </section>
  );
}
