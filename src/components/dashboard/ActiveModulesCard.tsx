interface ModuleStatus {
  name: string;
  state: 'online' | 'idle' | 'error';
  detail: string;
}

const MODULES: ModuleStatus[] = [
  { name: 'Binance CCXT Stream', state: 'online', detail: 'Connected' },
  { name: 'TA Signal Engine', state: 'online', detail: 'Running' },
  { name: 'Stock Data (Yahoo)', state: 'idle', detail: 'Idle' },
];

const stateStyles: Record<ModuleStatus['state'], string> = {
  online:
    'bg-[color:var(--color-gain)] shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse',
  idle: 'bg-[color:var(--color-text-muted)]',
  error:
    'bg-[color:var(--color-loss)] shadow-[0_0_8px_rgba(239,68,68,0.5)]',
};

export function ActiveModulesCard() {
  return (
    <section className="glass-panel p-4 sm:p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
      <h2 className="text-lg font-semibold text-white mb-4">Active Modules</h2>
      <ul className="space-y-3">
        {MODULES.map(mod => {
          const dim = mod.state === 'idle';
          return (
            <li
              key={mod.name}
              className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-2 h-2 rounded-full ${stateStyles[mod.state]}`}
                />
                <span
                  className={`text-sm font-medium text-white ${
                    dim ? 'opacity-50' : ''
                  }`}
                >
                  {mod.name}
                </span>
              </div>
              <span
                className={`text-xs text-[color:var(--color-text-muted)] ${
                  dim ? 'opacity-50' : ''
                }`}
              >
                {mod.detail}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
