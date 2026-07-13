'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const CRYPTO_SUGGESTIONS = [
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD',
  'AVAX-USD', 'DOGE-USD', 'DOT-USD', 'LINK-USD', 'MATIC-USD', 'SHIB-USD',
  'LTC-USD', 'BCH-USD', 'UNI-USD',
];

const STOCK_SUGGESTIONS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD',
  'INTC', 'CRM', 'NFLX', 'ADBE', 'PYPL', 'SQ', 'UBER', 'COIN',
  'JPM', 'V', 'MA', 'DIS', 'WMT', 'JNJ', 'PG', 'SPY', 'QQQ',
];

const FOREX_SUGGESTIONS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF',
  'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY',
];

export type ChartAssetType = 'crypto' | 'stocks' | 'forex';

interface SymbolSearchProps {
  assetType: ChartAssetType;
  currentSymbol: string;
  onSelect: (symbol: string) => void;
}

export function SymbolSearch({ assetType, currentSymbol, onSelect }: SymbolSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = assetType === 'crypto'
    ? CRYPTO_SUGGESTIONS
    : assetType === 'forex'
      ? FOREX_SUGGESTIONS
      : STOCK_SUGGESTIONS;

  const filtered = query
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  const handleSelect = useCallback((s: string) => {
    onSelect(s);
    setQuery('');
    setOpen(false);
  }, [onSelect]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('.symbol-search')) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="symbol-search relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={currentSymbol || 'Search symbol...'}
            className="input-field pl-9 pr-4 w-full text-sm"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/10"
            >
              <X size={14} className="text-[color:var(--color-text-muted)]" />
            </button>
          )}
        </div>

        <div className="flex gap-1">
          {filtered.slice(0, 4).map((s) => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                currentSymbol === s
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-white/5 text-[color:var(--color-text-secondary)] border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {open && filtered.length > 5 && (
        <div className="absolute top-full mt-1 z-20 glass-panel p-2 max-h-48 overflow-y-auto custom-scrollbar max-w-sm">
          {filtered.map((s) => (
            <button
              key={s}
              onClick={() => handleSelect(s)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                currentSymbol === s
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-[color:var(--color-text-secondary)] hover:bg-white/5 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}