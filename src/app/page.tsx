import { ActiveModulesCard } from '@/components/dashboard/ActiveModulesCard';
import { MarketOverviewCard } from '@/components/dashboard/MarketOverviewCard';
import { SignalFeed } from '@/components/dashboard/SignalFeed';
import { CryptoWatchlist } from '@/components/dashboard/CryptoWatchlist';
import { NewsFeed } from '@/components/dashboard/NewsFeed';

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-[color:var(--color-text-muted)]">
          Welcome to your Financial Market Insight terminal.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-6 lg:col-span-1">
          <CryptoWatchlist />
          <MarketOverviewCard />
          <ActiveModulesCard />
        </div>

        <div className="lg:col-span-2 h-[70vh] lg:h-[calc(100vh-12rem)] min-h-[420px] lg:min-h-[600px] flex flex-col gap-4">
          <SignalFeed />
        </div>
        
        <div className="lg:col-span-1 h-[70vh] lg:h-[calc(100vh-12rem)]">
          <NewsFeed />
        </div>
      </div>
    </div>
  );
}
