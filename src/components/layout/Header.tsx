'use client';

import { BellRing, BarChart3, Menu, Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/stores/ui';
import { useNotificationStore } from '@/lib/stores/notifications';

const QUICK_SYMBOLS: { label: string; route: string }[] = [
  { label: 'BTC-USD', route: '/crypto' },
  { label: 'ETH-USD', route: '/crypto' },
  { label: 'AAPL', route: '/stocks' },
  { label: 'NVDA', route: '/stocks' },
  { label: 'EURUSD', route: '/forex' },
];

export function Header() {
  const toggleMobileNav = useUIStore(s => s.toggleMobileNav);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const unsentCount = useNotificationStore(s => s.alerts.filter(a => !a.sent).length);

  const handleSymbol = (symbol: string) => {
    setSearchOpen(false);
    setQuery('');

    if (symbol.includes('-USD') || symbol === 'BTC' || symbol === 'ETH') {
      router.push(`/crypto?symbol=${encodeURIComponent(symbol)}`);
    } else if (symbol.length <= 8 && !symbol.includes('=')) {
      router.push(`/stocks?symbol=${encodeURIComponent(symbol)}`);
    } else {
      router.push(`/forex?symbol=${encodeURIComponent(symbol)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) handleSymbol(query.trim().toUpperCase());
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('.header-search')) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <header className="glass-panel h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 border-b border-white/5 rounded-none">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open navigation"
          className="md:hidden text-[color:var(--color-text-secondary)] hover:text-white transition-colors"
          onClick={toggleMobileNav}
        >
          <Menu size={24} />
        </button>

        <div className="header-search relative hidden md:block">
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-sm text-[color:var(--color-text-secondary)] hover:bg-white/10 hover:text-white transition-colors min-w-[240px]"
          >
            <Search size={16} className="text-[color:var(--color-text-muted)]" />
            <span>Search symbols...</span>
          </button>

          {searchOpen && (
            <div className="absolute top-full mt-2 left-0 glass-panel p-4 min-w-[320px] space-y-3 z-50 shadow-lg">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Search size={16} className="text-[color:var(--color-text-muted)] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value.toUpperCase())}
                  placeholder="BTC, AAPL, EURUSD..."
                  className="input-field w-full text-sm"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1 rounded hover:bg-white/10"
                  >
                    <X size={14} className="text-[color:var(--color-text-muted)]" />
                  </button>
                )}
              </form>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_SYMBOLS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => router.push(s.route)}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[color:var(--color-text-secondary)] hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => router.push('/settings')}
          className="relative p-2 rounded-xl hover:bg-white/5 text-[color:var(--color-text-secondary)] hover:text-white transition-colors"
        >
          <BellRing size={20} />
          {unsentCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              {unsentCount > 9 ? '9+' : unsentCount}
            </span>
          )}
        </button>

        <button
          aria-label="Chart view"
          onClick={() => router.push('/crypto')}
          className="p-2 rounded-xl hover:bg-white/5 text-[color:var(--color-text-secondary)] hover:text-white transition-colors"
        >
          <BarChart3 size={20} />
        </button>

        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
          FM
        </div>
      </div>
    </header>
  );
}