'use client';

import { useState, useEffect } from 'react';
import { Activity, Server, Wifi, WifiOff, Globe, Database, ArrowRight } from 'lucide-react';

interface NetworkService {
  id: string;
  name: string;
  type: 'http' | 'ws';
  url: string;
  status: 'checking' | 'online' | 'offline';
  latency?: number;
  lastChecked?: Date;
  icon: any;
}

const INITIAL_SERVICES: NetworkService[] = [
  {
    id: 'nextjs-api',
    name: 'Next.js Frontend API',
    type: 'http',
    url: '/api/crypto/tickers', // Just a quick endpoint to ping
    status: 'checking',
    icon: Server
  },
  {
    id: 'python-engine',
    name: 'Python Signal Engine',
    type: 'http',
    url: 'http://localhost:8000/health',
    status: 'checking',
    icon: Database
  },
  {
    id: 'kraken-ws',
    name: 'Kraken Live WebSocket',
    type: 'ws',
    url: 'wss://ws.kraken.com',
    status: 'checking',
    icon: Activity
  },
  {
    id: 'yahoo-finance',
    name: 'Yahoo Finance Feed',
    type: 'http',
    url: 'https://query2.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=1d',
    status: 'checking',
    icon: Globe
  }
];

export function NetworkMonitor() {
  const [services, setServices] = useState<NetworkService[]>(INITIAL_SERVICES);

  const checkHttp = async (service: NetworkService): Promise<Partial<NetworkService>> => {
    const start = Date.now();
    try {
      // Use no-cors for external APIs like Yahoo just to see if they resolve and respond
      const res = await fetch(service.url, { method: 'GET', mode: service.url.startsWith('http://localhost') || service.url.startsWith('/') ? 'cors' : 'no-cors' });
      const latency = Date.now() - start;
      return { status: 'online', latency, lastChecked: new Date() };
    } catch (error) {
      return { status: 'offline', lastChecked: new Date() };
    }
  };

  const checkWs = (service: NetworkService): Promise<Partial<NetworkService>> => {
    return new Promise((resolve) => {
      const start = Date.now();
      try {
        const ws = new WebSocket(service.url);
        
        const timeout = setTimeout(() => {
          ws.close();
          resolve({ status: 'offline', lastChecked: new Date() });
        }, 5000);

        ws.onopen = () => {
          clearTimeout(timeout);
          const latency = Date.now() - start;
          ws.close();
          resolve({ status: 'online', latency, lastChecked: new Date() });
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          ws.close();
          resolve({ status: 'offline', lastChecked: new Date() });
        };
      } catch (err) {
        resolve({ status: 'offline', lastChecked: new Date() });
      }
    });
  };

  const runCheck = async () => {
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' })));
    
    for (const service of INITIAL_SERVICES) {
      let result: Partial<NetworkService>;
      if (service.type === 'http') {
        result = await checkHttp(service);
      } else {
        result = await checkWs(service);
      }
      
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, ...result } : s));
    }
  };

  useEffect(() => {
    runCheck();
    const interval = setInterval(runCheck, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-white font-bold text-lg">Live Network Monitor</h2>
          <p className="text-sm text-[color:var(--color-text-secondary)]">Checking connectivity for all core APIs</p>
        </div>
        <button 
          onClick={runCheck}
          className="px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl text-sm font-medium transition-colors"
        >
          Refresh Now
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => {
          const Icon = service.icon;
          return (
            <div key={service.id} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <Icon size={20} className={service.status === 'online' ? 'text-blue-400' : service.status === 'offline' ? 'text-red-400' : 'text-gray-400 animate-pulse'} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{service.name}</h3>
                    <div className="flex items-center space-x-2 text-xs text-[color:var(--color-text-muted)] mt-1">
                      <span className="uppercase tracking-wider font-mono-numbers">{service.type}</span>
                      <span>•</span>
                      <span className="truncate max-w-[150px] sm:max-w-[200px]" title={service.url}>{service.url}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center space-x-2 mb-1">
                    {service.status === 'online' && (
                      <>
                        <span className="text-xs font-mono-numbers font-medium text-[color:var(--color-gain)]">
                          {service.latency}ms
                        </span>
                        <div className="w-2 h-2 rounded-full bg-[color:var(--color-gain)] shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                      </>
                    )}
                    {service.status === 'checking' && (
                      <>
                        <span className="text-xs text-[color:var(--color-text-muted)]">Pinging...</span>
                        <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)] animate-pulse" />
                      </>
                    )}
                    {service.status === 'offline' && (
                      <>
                        <span className="text-xs text-[color:var(--color-loss)]">Offline</span>
                        <div className="w-2 h-2 rounded-full bg-[color:var(--color-loss)] shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                      </>
                    )}
                  </div>
                  {service.lastChecked && (
                    <span className="text-[10px] text-[color:var(--color-text-muted)]">
                      Last checked {service.lastChecked.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
