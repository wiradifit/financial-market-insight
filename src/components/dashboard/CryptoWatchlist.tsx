'use client';

import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils/format';
import { ArrowDownRight, ArrowUpRight, Activity, Wifi, WifiOff } from 'lucide-react';
import { AssetInfo } from '@/types/market';
import { useEffect, useState, useRef } from 'react';

export function CryptoWatchlist() {
  const [livePrices, setLivePrices] = useState<Record<string, { price: number; changePercent: number }>>({});
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  const { data: assets, isLoading } = useQuery<AssetInfo[]>({
    queryKey: ['crypto-watchlist'],
    queryFn: async () => {
      // Fetch specifically BTC, ETH, SOL from the backend for initial data
      const baseUrl = process.env.NEXT_PUBLIC_SIGNAL_API_URL || 'http://localhost:8000';
      const symbols = ['BTC-USD', 'ETH-USD', 'SOL-USD'];
      const promises = symbols.map(sym => 
        fetch(`${baseUrl}/api/market/crypto/${sym}`).then(res => res.json())
      );
      return Promise.all(promises);
    },
    refetchInterval: false, // We'll rely on WS for updates after initial load
    staleTime: Infinity,
  });

  useEffect(() => {
    // Connect to Kraken public WebSocket stream for live ticker updates (Binance is blocked by ISP)
    const ws = new WebSocket('wss://ws.kraken.com');
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
      ws.send(JSON.stringify({
        event: 'subscribe',
        pair: ['XBT/USD', 'ETH/USD', 'SOL/USD'],
        subscription: { name: 'ticker' }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        
        // Kraken ticker payload is an array: [channelID, data, channelName, pair]
        if (Array.isArray(parsed) && parsed[2] === 'ticker') {
          const data = parsed[1];
          const pair = parsed[3];
          
          const symbolMap: Record<string, string> = {
            'XBT/USD': 'BTC-USD',
            'ETH/USD': 'ETH-USD',
            'SOL/USD': 'SOL-USD'
          };
          
          const mappedSymbol = symbolMap[pair];
          if (mappedSymbol && data.c && data.o) {
            const currentPrice = parseFloat(data.c[0]);
            // Kraken provides open price [today, last 24h]. We use last 24h (index 1) for 24h change
            const openPrice = parseFloat(data.o[1] || data.o[0]); 
            const changePercent = ((currentPrice - openPrice) / openPrice) * 100;
            
            setLivePrices(prev => ({
              ...prev,
              [mappedSymbol]: { price: currentPrice, changePercent }
            }));
          }
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    ws.onerror = () => {
      setWsStatus('error');
    };

    ws.onclose = () => {
      if (wsStatus !== 'error') {
        setWsStatus('error');
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="bg-surface rounded-xl border border-white/5 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-white">Live Price Feed</h2>
        </div>
        
        {/* WebSocket Health Indicator */}
        <div className="flex items-center space-x-1.5" title={`WebSocket Status: ${wsStatus}`}>
          {wsStatus === 'connected' ? (
            <div className="flex items-center space-x-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-green-500 font-bold hidden sm:inline-block">Live</span>
            </div>
          ) : wsStatus === 'connecting' ? (
            <Wifi className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
          ) : (
             <div className="flex items-center space-x-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-red-500 font-bold hidden sm:inline-block">Offline</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex-1">
        {isLoading && !assets ? (
           <div className="flex justify-center items-center h-32">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
           </div>
        ) : (
          <div className="space-y-4">
            {assets?.map((asset) => {
              // Merge live WS data with initial REST data
              const liveData = livePrices[asset.symbol];
              const displayPrice = liveData?.price || asset.price;
              const displayChange = liveData?.changePercent || asset.changePercent;
              const isPositive = displayChange >= 0;
              
              // Simple flash animation trigger based on price updates
              const key = `${asset.symbol}-${displayPrice}`;

              return (
                <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
                      {asset.symbol.replace('-USD', '')}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{asset.name || asset.symbol.replace('-USD', '')}</h3>
                      <p className="text-xs text-neutral">{asset.symbol}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div 
                      key={key} 
                      className={`font-bold text-white tracking-tight animate-in fade-in duration-300 ${liveData ? (isPositive ? 'text-green-400' : 'text-red-400') : ''} transition-colors`}
                    >
                      {formatCurrency(displayPrice)}
                    </div>
                    <div className={`flex items-center justify-end text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      <span>{Math.abs(displayChange).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
