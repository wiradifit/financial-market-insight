import { NetworkMonitor } from '@/components/network/NetworkMonitor';

export const metadata = {
  title: 'Network Monitor | Financial Insight',
  description: 'Monitor the health of the APIs and WebSockets powering the Financial Insight terminal',
};

export default function NetworkPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-none p-6 pb-2">
        <h1 className="text-2xl font-bold text-white mb-2">Network Health</h1>
        <p className="text-[color:var(--color-text-secondary)]">
          Real-time status of all external dependencies and microservices.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-6 pt-4">
        <div className="max-w-4xl">
          <NetworkMonitor />
        </div>
      </div>
    </div>
  );
}
