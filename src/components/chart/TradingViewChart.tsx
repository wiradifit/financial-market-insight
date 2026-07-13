'use client';

import { useEffect, useRef, memo } from 'react';

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => { remove: () => void };
    };
  }
}

interface TradingViewChartProps {
  symbol: string;
  theme?: 'dark' | 'light';
  autosize?: boolean;
  height?: number;
  width?: string;
}

let scriptPromise: Promise<void> | null = null;

function loadTradingView(): Promise<void> {
  if (window.TradingView?.widget) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Failed to load TradingView'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

function TradingViewChartInner({
  symbol,
  theme = 'dark',
  autosize = true,
  height = 500,
  width = '100%',
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadTradingView()
      .then(() => {
        if (cancelled || !containerRef.current || !window.TradingView?.widget) return;

        widgetRef.current?.remove();

        const formattedSymbol = symbol.includes(':') ? symbol : symbol.includes('-USD')
          ? `COINBASE:${symbol.replace('-USD', 'USD')}`
          : symbol.includes('=X')
            ? `OANDA:${symbol.replace('=X', '')}`
            : `NASDAQ:${symbol}`;

        widgetRef.current = new window.TradingView.widget({
          symbol: formattedSymbol,
          interval: 'D',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          container_id: containerRef.current.id,
          autosize,
          height,
          width,
          studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies', 'BB@tv-basicstudies', 'MASimple@tv-basicstudies'],
          watchlist: [formattedSymbol],
          details: true,
          hotlist: true,
          calendar: false,
        } as Record<string, unknown>);
      })
      .catch(() => {
        console.warn('[TradingView] Script failed to load');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, theme]);

  useEffect(() => {
    return () => {
      widgetRef.current?.remove();
    };
  }, []);

  const containerId = `tv-chart-${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return (
    <div
      id={containerId}
      ref={containerRef}
      className="w-full"
      style={{ minHeight: height }}
    />
  );
}

export const TradingViewChart = memo(TradingViewChartInner);