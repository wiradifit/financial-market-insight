'use client';

import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils/format';
import { ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';
import { AssetInfo } from '@/types/market';
import { useEffect, useState, useRef } from 'react';

export function CryptoWatchlist() {
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; changePercent: number }>>({});
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  const { data: assets, isLoading } = useQuery<AssetInfo[]>({
    queryKey: ['crypto-watchlist'],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_SIGNAL_API_URL || 'http://localhost:8000';
      const symbols = ['BTC-USD', 'ETH-USD', 'SOL-USD'];
      const promises = symbols.map((sym) =>
        fetch(`${baseUrl}/api/market/crypto/${sym}`).then((res) => res.json())
      );
      return Promise.all(promises);
    },
    refetchInterval: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    const ws = new WebSocket('wss://ws.kraken.com');
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
      ws.send(JSON.stringify({
        event: 'subscribe',
        pair: ['XBT/USD', 'ETH/USD', 'SOL/USD'],
        subscription: { name: 'ticker' },
      }));
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (Array.isArray(parsed) && parsed[2] === 'ticker') {
          const data = parsed[1];
          const pair = parsed[3];
          const symbolMap: Record<string, string> = {
            'XBT/USD': 'BTC-USD',
            'ETH/USD': 'ETH-USD',
            'SOL/USD': 'SOL-USD',
          };
          const mappedSymbol = symbolMap[pair];
          if (mappedSymbol && data.c && data.o) {
            const currentPrice = parseFloat(data.c[0]);
            const openPrice = parseFloat(data.o[1] || data.o[0]);
            const changePercent = ((currentPrice - openPrice) / openPrice) * 100;
            setLivePrices((prev) => ({
              ...prev,
              [mappedSymbol]: { price: currentPrice, changePercent },
            }));
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => setWsStatus('error');
    ws.onclose = () => {
      if (wsStatus !== 'error') setWsStatus('error');
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="glass-panel p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Activity size={16} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Live Price Feed</h2>
            <p className="text-[10px] text-[color:var(--color-text-muted)]">
              BTC • ETH • SOL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5" title={`WebSocket: ${wsStatus}`}>
          {wsStatus === 'connected' ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-green-500 font-bold hidden sm:inline">
                Live
              </span>
            </>
          ) : wsStatus === 'connecting' ? (
            <span className="text-[10px] text-[color:var(--color-text-muted)]">connecting...</span>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[10px] uppercase tracking-wider text-red-500 font-bold hidden sm:inline">
                Offline
              </span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && !assets ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-400" />
          </div>
        ) : (
          assets?.map((asset) => {
            const liveData = livePrices[asset.symbol];
            const displayPrice = liveData?.price || asset.price;
            const displayChange = liveData?.changePercent || asset.changePercent;
            const isPositive = displayChange >= 0;

            return (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.03] hover:border-white/[0.08] transition-all hover-lift"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white text-sm">
                    {asset.symbol.replace('-USD', '')}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{asset.name || asset.symbol.replace('-USD', '')}</div>
                    <div className="text-[10px] text-[color:var(--color-text-muted)]">{asset.symbol}</div>
                  </div>
                </div>

                <div className="text-right font-mono-numbers">
                  <div className={`font-bold text-sm ${liveData ? (isPositive ? 'text-green-400' : 'text-red-400') : 'text-white'} transition-colors duration-300`}>
                    {formatCurrency(displayPrice)}
                  </div>
                  <div className={`flex items-center justify-end text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{Math.abs(displayChange).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
