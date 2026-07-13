'use client';

import { useQuery } from '@tanstack/react-query';
import { NewsItem } from '@/types/market';
import { formatDistanceToNow } from 'date-fns';
import { Newspaper, ExternalLink } from 'lucide-react';

const DEFAULT_SYMBOLS = 'BTC-USD,ETH-USD,SOL-USD';

export function NewsFeed({ symbols }: { symbols?: string }) {
  const symList = symbols || DEFAULT_SYMBOLS;

  const { data: news, isLoading, error } = useQuery<NewsItem[]>({
    queryKey: ['news', symList],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_SIGNAL_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/market/news?symbols=${encodeURIComponent(symList)}`);
      if (!res.ok) throw new Error('Failed to fetch news');
      return res.json();
    },
    refetchInterval: 60_000,
  });

  const displaySymbols = symList.split(',').slice(0, 3).map((s) => s.replace('-USD', '')).join(', ');

  return (
    <div className="glass-panel p-4 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Newspaper size={16} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">News</h2>
            <p className="text-[10px] text-[color:var(--color-text-muted)]">{displaySymbols}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 animate-pulse space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-12 bg-white/10 rounded" />
                  <div className="h-3 w-16 bg-white/10 rounded" />
                </div>
                <div className="h-3.5 w-full bg-white/10 rounded" />
                <div className="h-3.5 w-3/4 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-xs text-[color:var(--color-loss)] p-3 rounded-lg bg-[color:var(--color-loss-bg)] border border-[color:var(--color-loss-border)] text-center">
            Unable to load news
          </div>
        )}

        {!isLoading && !error && (!news || news.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Newspaper size={24} className="text-[color:var(--color-text-muted)] mb-2" />
            <p className="text-xs text-[color:var(--color-text-muted)]">No recent news found</p>
          </div>
        )}

        {news?.map((item) => {
          const id = item.id || item.uuid || `${item.title}-${item.related_symbol}`;
          const title = item.content?.title || item.title || '';
          const publisher = item.content?.provider?.displayName || item.publisher || '';
          const link = item.content?.clickThroughUrl?.url || item.link || '#';

          let dateObj = new Date();
          if (item.content?.pubDate) {
            dateObj = new Date(item.content.pubDate);
          } else if (item.providerPublishTime) {
            dateObj = new Date(item.providerPublishTime * 1000);
          }

          return (
            <a
              key={id}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.03] hover:border-white/[0.08] transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                  {item.related_symbol.replace('-USD', '')}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-[color:var(--color-text-muted)]">
                  {publisher}
                  <span className="text-[color:var(--color-text-muted)]/50">•</span>
                  <span>{formatDistanceToNow(dateObj, { addSuffix: true })}</span>
                </div>
              </div>
              <p className="text-xs text-white/80 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                {title}
              </p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[color:var(--color-text-muted)]/60 group-hover:text-[color:var(--color-text-muted)]/80 transition-colors">
                <ExternalLink size={10} />
                <span>Read more</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}