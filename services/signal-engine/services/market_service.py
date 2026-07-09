import yfinance as yf
import asyncio
import time
from models.market import AssetInfo, OHLCVBar, HistoryResponse, MarketOverview
from cache import cache
from config import settings

class MarketService:
    @staticmethod
    async def get_asset_info(symbol: str) -> AssetInfo:
        cache_key = f"info_{symbol}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data

        def fetch_info():
            ticker = yf.Ticker(symbol)
            info = ticker.info
            history = ticker.history(period="2d")
            
            if history.empty:
                raise ValueError(f"No data found for symbol: {symbol}")
                
            current_price = history['Close'].iloc[-1]
            prev_close = history['Close'].iloc[-2] if len(history) > 1 else current_price
            change = current_price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close != 0 else 0
            
            return AssetInfo(
                symbol=symbol,
                name=info.get('shortName', symbol),
                price=current_price,
                change=change,
                change_percent=change_percent,
                high24h=history['High'].iloc[-1],
                low24h=history['Low'].iloc[-1],
                volume=history['Volume'].iloc[-1],
                market_cap=info.get('marketCap'),
                last_updated=int(time.time() * 1000)
            )

        try:
            result = await asyncio.to_thread(fetch_info)
            cache.set(cache_key, result, ttl=settings.CACHE_TTL)
            return result
        except Exception as e:
            print(f"Error fetching info for {symbol}: {e}")
            # Return dummy data on failure to prevent total crash
            return AssetInfo(
                symbol=symbol,
                name="Unknown",
                price=0,
                change=0,
                change_percent=0,
                high24h=0,
                low24h=0,
                volume=0,
                last_updated=int(time.time() * 1000)
            )

    @staticmethod
    async def get_history(symbol: str, period: str = '1mo', interval: str = '1d') -> HistoryResponse:
        cache_key = f"hist_{symbol}_{period}_{interval}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data

        def fetch_history():
            ticker = yf.Ticker(symbol)
            history = ticker.history(period=period, interval=interval)
            
            bars = []
            for index, row in history.iterrows():
                bars.append(OHLCVBar(
                    timestamp=int(index.timestamp() * 1000),
                    open=row['Open'],
                    high=row['High'],
                    low=row['Low'],
                    close=row['Close'],
                    volume=row['Volume']
                ))
            
            return HistoryResponse(
                symbol=symbol,
                interval=interval,
                period=period,
                data=bars
            )

        try:
            result = await asyncio.to_thread(fetch_history)
            cache.set(cache_key, result, ttl=settings.CACHE_TTL)
            return result
        except Exception as e:
            print(f"Error fetching history for {symbol}: {e}")
            return HistoryResponse(symbol=symbol, interval=interval, period=period, data=[])

    @staticmethod
    async def get_market_overview() -> MarketOverview:
        crypto_symbols = ["BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD"]
        stock_symbols = ["SPY", "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"]
        forex_symbols = ["EURUSD=X", "GBPUSD=X", "JPY=X"]

        async def fetch_batch(symbols):
            return await asyncio.gather(*(MarketService.get_asset_info(s) for s in symbols))

        crypto_data, stock_data, forex_data = await asyncio.gather(
            fetch_batch(crypto_symbols),
            fetch_batch(stock_symbols),
            fetch_batch(forex_symbols)
        )

        return MarketOverview(
            crypto=crypto_data,
            stocks=stock_data,
            forex=forex_data,
            timestamp=int(time.time() * 1000)
        )

    @staticmethod
    async def get_news(symbols: list) -> list:
        cache_key = f"news_{'_'.join(symbols)}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data

        def fetch_news():
            news = []
            for sym in symbols:
                ticker = yf.Ticker(sym)
                ticker_news = ticker.news
                if ticker_news:
                    for n in ticker_news:
                        n['related_symbol'] = sym
                    news.extend(ticker_news)
            
            from datetime import datetime
            
            def get_pub_time(item):
                content = item.get('content', item)
                pub_date = content.get('pubDate')
                if pub_date:
                    try:
                        pub_date = pub_date.replace('Z', '+00:00')
                        return int(datetime.fromisoformat(pub_date).timestamp())
                    except:
                        pass
                return item.get('providerPublishTime', 0)

            news.sort(key=get_pub_time, reverse=True)
            return news[:20]

        try:
            result = await asyncio.to_thread(fetch_news)
            cache.set(cache_key, result, ttl=300)
            return result
        except Exception as e:
            print(f"Error fetching news for {symbols}: {e}")
            return []

