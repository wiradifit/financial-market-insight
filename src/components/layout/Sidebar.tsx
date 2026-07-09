'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  Activity,
  LayoutDashboard,
  LineChart,
  Settings,
  Target,
  Wifi,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Crypto Signals', href: '/crypto', icon: LineChart },
  { name: 'Stock Analysis', href: '/stocks', icon: Target },
  { name: 'Forex Market', href: '/forex', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Network Monitor', href: '/network', icon: Wifi },
];

function SidebarBody({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between p-6">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Financial Insight
        </h1>
        {onNavigate && (
          <button
            type="button"
            aria-label="Close navigation"
            className="md:hidden text-[color:var(--color-text-secondary)] hover:text-white"
            onClick={onNavigate}
          >
            <X size={22} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  : 'text-[color:var(--color-text-secondary)] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon
                size={20}
                className={isActive ? 'text-blue-400' : 'text-[color:var(--color-text-secondary)]'}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5">
        <div className="text-sm font-medium text-white mb-1">Signal Engine</div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[color:var(--color-gain)] shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
          <span className="text-xs text-[color:var(--color-text-muted)]">Online</span>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const mobileNavOpen = useUIStore(s => s.mobileNavOpen);
  const setMobileNav = useUIStore(s => s.setMobileNav);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNav(false);
  }, [pathname, setMobileNav]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="glass-panel w-64 h-full hidden md:flex flex-col rounded-r-2xl rounded-l-none border-r border-y-0 border-l-0">
        <SidebarBody pathname={pathname} />
      </aside>

      {/* Mobile overlay + drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileNav(false)}
            aria-hidden
          />
          <aside className="glass-panel relative w-64 h-full flex flex-col rounded-r-2xl rounded-l-none border-r border-y-0 border-l-0">
            <SidebarBody pathname={pathname} onNavigate={() => setMobileNav(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
