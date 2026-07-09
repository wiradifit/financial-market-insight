'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui';

export function Header() {
  const toggleMobileNav = useUIStore(s => s.toggleMobileNav);

  return (
    <header className="glass-panel h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 border-b border-white/5 rounded-none">
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Open navigation"
          className="md:hidden mr-4 text-[color:var(--color-text-secondary)] hover:text-white"
          onClick={toggleMobileNav}
        >
          <Menu size={24} />
        </button>

        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] pointer-events-none"
            size={18}
          />
          <input
            type="search"
            placeholder="Search symbols (e.g., BTC, AAPL)"
            className="input-field pl-10 w-64 focus:w-80 transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-full hover:bg-white/5 text-[color:var(--color-text-secondary)] transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-medium text-white shadow-lg">
          W
        </div>
      </div>
    </header>
  );
}
