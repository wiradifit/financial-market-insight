'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { AssetInfo } from '@/types/market';
import { signalApiClient } from '@/lib/data/signal-api-client';
import {
  formatCurrency,
  getChangeColor,
} from '@/lib/utils/format';

function AssetRow({ asset, kind }: { asset: AssetInfo; kind: 'crypto' | 'stocks' | 'forex' }) {
  const isPositive = asset.change >= 0;
  const changeColor = getChangeColor(asset.changePercent);

  const kindColors: Record<string, string> = {
    crypto: 'bg-purple-500/10 text-purple-400',
    stocks: 'bg-blue-500/10 text-blue-400',
    forex: 'bg-cyan-500/10 text-cyan-400',
  };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0 group hover:bg-white/[0.03] px-2 -mx-2 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 ${changeColor}`}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-white text-sm">{asset.symbol}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${kindColors[kind]}`}>
              {kind}
            </span>
          </div>
          <div className="text-[10px] text-[color:var(--color-text-muted)] truncate max-w-[140px]">
            {asset.name || asset.symbol}
          </div>
        </div>
      </div>

      <div className="text-right font-mono-numbers">
        <div className="font-semibold text-white text-sm">
          {formatCurrency(asset.price)}
        </div>
        <div className={`text-xs ${changeColor}`}>
          {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

export function MarketOverviewCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['market-overview'],
    queryFn: () => signalApiClient.getMarketOverview(),
    refetchInterval: 60_000,
  });

  return (
    <section className="glass-panel p-4 sm:p-5 bg-gradient-to-br from-blue-500/[0.03] to-purple-500/[0.03]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Market Overview</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Crypto
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Stocks
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            FX
          </span>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <div className="skeleton w-7 h-7 rounded-lg" />
                <div className="space-y-1.5">
                  <div className="skeleton h-3.5 w-16" />
                  <div className="skeleton h-2.5 w-24" />
                </div>
              </div>
              <div className="space-y-1.5 items-end flex flex-col">
                <div className="skeleton h-3.5 w-18" />
                <div className="skeleton h-2.5 w-12" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-xs text-[color:var(--color-loss)] p-3 bg-[color:var(--color-loss-bg)] rounded-lg border border-[color:var(--color-loss-border)]">
          Engine offline — data will appear when the signal engine is running.
        </div>
      )}

      {data && (
        <div className="space-y-0">
          {data.stocks.slice(0, 3).map((a) => (
            <AssetRow key={`stock-${a.symbol}`} asset={a} kind="stocks" />
          ))}
          {data.crypto.slice(0, 3).map((a) => (
            <AssetRow key={`crypto-${a.symbol}`} asset={a} kind="crypto" />
          ))}
          {data.forex.slice(0, 2).map((a) => (
            <AssetRow key={`forex-${a.symbol}`} asset={a} kind="forex" />
          ))}
        </div>
      )}
    </section>
  );
}