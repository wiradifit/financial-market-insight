'use client';

import { useState, useCallback } from 'react';
import { TradingViewChart } from '@/components/chart/TradingViewChart';
import { SignalPanel } from '@/components/chart/SignalPanel';
import { SymbolSearch } from '@/components/chart/SymbolSearch';

export default function CryptoPage() {
  const [symbol, setSymbol] = useState('BTC-USD');

  const handleSelect = useCallback((s: string) => {
    setSymbol(s);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Crypto Signals</h1>
        <p className="text-sm sm:text-base text-[color:var(--color-text-muted)]">
          Chart analysis and signal detection for cryptocurrency pairs
        </p>
      </header>

      <div className="flex items-center gap-3">
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Live TradingView
        </span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-[10px] uppercase tracking-wider text-green-500 font-semibold">Streaming</span>
      </div>

      <SymbolSearch assetType="crypto" currentSymbol={symbol} onSelect={handleSelect} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="glass-panel p-0 overflow-hidden rounded-xl border border-white/5">
            <TradingViewChart symbol={symbol} height={500} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <SignalPanel symbol={symbol} />
        </div>
      </div>
    </div>
  );
}