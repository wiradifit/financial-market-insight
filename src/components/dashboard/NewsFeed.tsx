'use client';

import { useQuery } from '@tanstack/react-query';
import { signalApiClient } from '@/lib/data/signal-api-client';
import { NewsItem } from '@/types/market';
import { formatDistanceToNow } from 'date-fns';
import { Newspaper } from 'lucide-react';

export function NewsFeed() {
  const { data: news, isLoading, error } = useQuery<NewsItem[]>({
    queryKey: ['news', 'BTC-USD,ETH-USD,SOL-USD'],
    queryFn: async () => {
      // Create a direct fetch function to avoid modifying signalApiClient heavily
      const baseUrl = process.env.NEXT_PUBLIC_SIGNAL_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/api/market/news?symbols=BTC-USD,ETH-USD,SOL-USD`);
      if (!res.ok) throw new Error('Failed to fetch news');
      return res.json();
    },
    refetchInterval: 60000, // refresh every minute
  });

  return (
    <div className="bg-surface rounded-xl border border-white/5 overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-white/5 flex items-center space-x-2">
        <Newspaper className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-white">Latest News (BTC, ETH, SOL)</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm text-center">Failed to load news</div>
        ) : !news || news.length === 0 ? (
          <div className="text-neutral text-sm text-center">No recent news found.</div>
        ) : (
          news.map((item) => {
            const id = item.id || item.uuid || Math.random().toString();
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
                key={`${id}-${item.related_symbol}`} 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {item.related_symbol.replace('-USD', '')}
                  </span>
                  <span className="text-xs text-neutral">
                    {formatDistanceToNow(dateObj, { addSuffix: true })}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-white line-clamp-2 mt-1 leading-snug">
                  {title}
                </h3>
                <div className="text-xs text-neutral mt-2">
                  {publisher}
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
