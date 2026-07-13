import { ActiveModulesCard } from '@/components/dashboard/ActiveModulesCard';
import { MarketOverviewCard } from '@/components/dashboard/MarketOverviewCard';
import { SignalFeed } from '@/components/dashboard/SignalFeed';
import { CryptoWatchlist } from '@/components/dashboard/CryptoWatchlist';
import { NewsFeed } from '@/components/dashboard/NewsFeed';

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Real-time market data, signal analysis, and news aggregation
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-1 space-y-4">
          <CryptoWatchlist />
          <ActiveModulesCard />
        </div>

        <div className="xl:col-span-2 flex flex-col gap-4 min-h-[500px]">
          <SignalFeed />
        </div>

        <div className="xl:col-span-2 space-y-4">
          <MarketOverviewCard />
          <div className="flex-1 min-h-[400px]">
            <NewsFeed />
          </div>
        </div>
      </div>
    </div>
  );
}