import asyncio
import time
from typing import List
import pandas as pd
import numpy as np
import ta
from models.signals import Signal, SignalType, SignalDirection, ScanResult
from services.market_service import MarketService

class SignalService:
    @staticmethod
    async def analyze_symbol(symbol: str, period: str = '3mo', interval: str = '1d') -> List[Signal]:
        history = await MarketService.get_history(symbol, period=period, interval=interval)
        
        if not history.data or len(history.data) < 50:
            return []

        df = pd.DataFrame([bar.model_dump() for bar in history.data])
        signals = []
        current_time = int(time.time() * 1000)
        
        # Calculate RSI
        df['rsi'] = ta.momentum.RSIIndicator(df['close'], window=14).rsi()
        latest_rsi = df['rsi'].iloc[-1]
        
        if not np.isnan(latest_rsi):
            if latest_rsi < 30:
                signals.append(Signal(
                    symbol=symbol,
                    signal_type=SignalType.RSI_OVERSOLD,
                    direction=SignalDirection.BULLISH,
                    confidence=int(min((30 - latest_rsi) * 3.33, 100)), # Max confidence at RSI 0
                    indicator_values={"rsi": float(latest_rsi)},
                    timeframe=interval,
                    message=f"{symbol} RSI at {latest_rsi:.1f} — Oversold territory, potential reversal",
                    timestamp=current_time
                ))
            elif latest_rsi > 70:
                signals.append(Signal(
                    symbol=symbol,
                    signal_type=SignalType.RSI_OVERBOUGHT,
                    direction=SignalDirection.BEARISH,
                    confidence=int(min((latest_rsi - 70) * 3.33, 100)), # Max confidence at RSI 100
                    indicator_values={"rsi": float(latest_rsi)},
                    timeframe=interval,
                    message=f"{symbol} RSI at {latest_rsi:.1f} — Overbought territory, potential pullback",
                    timestamp=current_time
                ))

        # Calculate MACD
        macd = ta.trend.MACD(df['close'])
        df['macd'] = macd.macd()
        df['macd_signal'] = macd.macd_signal()
        df['macd_diff'] = macd.macd_diff()
        
        if len(df) > 1 and not np.isnan(df['macd_diff'].iloc[-1]) and not np.isnan(df['macd_diff'].iloc[-2]):
            current_diff = df['macd_diff'].iloc[-1]
            prev_diff = df['macd_diff'].iloc[-2]
            
            if prev_diff < 0 and current_diff > 0:
                signals.append(Signal(
                    symbol=symbol,
                    signal_type=SignalType.MACD_CROSSOVER,
                    direction=SignalDirection.BULLISH,
                    confidence=70,
                    indicator_values={"macd": float(df['macd'].iloc[-1]), "signal": float(df['macd_signal'].iloc[-1])},
                    timeframe=interval,
                    message=f"{symbol} MACD crossed above signal line — Bullish momentum",
                    timestamp=current_time
                ))
            elif prev_diff > 0 and current_diff < 0:
                 signals.append(Signal(
                    symbol=symbol,
                    signal_type=SignalType.MACD_DIVERGENCE,
                    direction=SignalDirection.BEARISH,
                    confidence=70,
                    indicator_values={"macd": float(df['macd'].iloc[-1]), "signal": float(df['macd_signal'].iloc[-1])},
                    timeframe=interval,
                    message=f"{symbol} MACD crossed below signal line — Bearish momentum",
                    timestamp=current_time
                ))

        # Calculate Bollinger Bands
        bb = ta.volatility.BollingerBands(df['close'], window=20, window_dev=2)
        df['bb_high'] = bb.bollinger_hband()
        df['bb_low'] = bb.bollinger_lband()
        current_close = df['close'].iloc[-1]
        
        if not np.isnan(df['bb_low'].iloc[-1]) and current_close < df['bb_low'].iloc[-1]:
             signals.append(Signal(
                    symbol=symbol,
                    signal_type=SignalType.BOLLINGER_BOUNCE,
                    direction=SignalDirection.BULLISH,
                    confidence=60,
                    indicator_values={"price": float(current_close), "lower_band": float(df['bb_low'].iloc[-1])},
                    timeframe=interval,
                    message=f"{symbol} price below lower Bollinger Band — Potential bounce",
                    timestamp=current_time
                ))
        elif not np.isnan(df['bb_high'].iloc[-1]) and current_close > df['bb_high'].iloc[-1]:
             signals.append(Signal(
                    symbol=symbol,
                    signal_type=SignalType.BOLLINGER_BOUNCE,
                    direction=SignalDirection.BEARISH,
                    confidence=60,
                    indicator_values={"price": float(current_close), "upper_band": float(df['bb_high'].iloc[-1])},
                    timeframe=interval,
                    message=f"{symbol} price above upper Bollinger Band — Potential rejection",
                    timestamp=current_time
                ))

        # Calculate SMAs
        df['sma_20'] = ta.trend.SMAIndicator(df['close'], window=20).sma_indicator()
        df['sma_50'] = ta.trend.SMAIndicator(df['close'], window=50).sma_indicator()
        
        if len(df) > 1 and not np.isnan(df['sma_50'].iloc[-1]):
            curr_20 = df['sma_20'].iloc[-1]
            prev_20 = df['sma_20'].iloc[-2]
            curr_50 = df['sma_50'].iloc[-1]
            prev_50 = df['sma_50'].iloc[-2]
            
            if prev_20 <= prev_50 and curr_20 > curr_50:
                 signals.append(Signal(
                    symbol=symbol,
                    signal_type=SignalType.SMA_GOLDEN_CROSS,
                    direction=SignalDirection.BULLISH,
                    confidence=85,
                    indicator_values={"sma20": float(curr_20), "sma50": float(curr_50)},
                    timeframe=interval,
                    message=f"{symbol} 20-period SMA crossed above 50-period SMA — Golden Cross",
                    timestamp=current_time
                ))
            elif prev_20 >= prev_50 and curr_20 < curr_50:
                 signals.append(Signal(
                    symbol=symbol,
                    signal_type=SignalType.SMA_DEATH_CROSS,
                    direction=SignalDirection.BEARISH,
                    confidence=85,
                    indicator_values={"sma20": float(curr_20), "sma50": float(curr_50)},
                    timeframe=interval,
                    message=f"{symbol} 20-period SMA crossed below 50-period SMA — Death Cross",
                    timestamp=current_time
                ))

        # Calculate Volume Spike
        df['vol_sma_20'] = df['volume'].rolling(window=20).mean()
        if len(df) > 0 and not np.isnan(df['vol_sma_20'].iloc[-1]):
            curr_vol = df['volume'].iloc[-1]
            avg_vol = df['vol_sma_20'].iloc[-1]
            if avg_vol > 0 and curr_vol > avg_vol * 2:
                signals.append(Signal(
                    symbol=symbol,
                    signal_type=SignalType.VOLUME_SPIKE,
                    direction=SignalDirection.NEUTRAL,
                    confidence=75,
                    indicator_values={"volume": float(curr_vol), "avg_volume": float(avg_vol)},
                    timeframe=interval,
                    message=f"{symbol} significant volume spike ({curr_vol/avg_vol:.1f}x average)",
                    timestamp=current_time
                ))

        # Calculate Entry, TP, and SL for all signals
        atr_indicator = ta.volatility.AverageTrueRange(high=df['high'], low=df['low'], close=df['close'], window=14)
        df['atr'] = atr_indicator.average_true_range()
        current_atr = df['atr'].iloc[-1]
        
        for s in signals:
            if s.direction in (SignalDirection.BULLISH, SignalDirection.BEARISH):
                s.entry_price = float(current_close)
                if not np.isnan(current_atr):
                    if s.direction == SignalDirection.BULLISH:
                        s.sl = float(current_close - (current_atr * 1.5))
                        s.tp = float(current_close + (current_atr * 3.0)) # 1:2 R/R
                    else: # BEARISH
                        s.sl = float(current_close + (current_atr * 1.5))
                        s.tp = float(current_close - (current_atr * 3.0))
                else:
                    if s.direction == SignalDirection.BULLISH:
                        s.sl = float(current_close * 0.95)
                        s.tp = float(current_close * 1.10)
                    else:
                        s.sl = float(current_close * 1.05)
                        s.tp = float(current_close * 0.90)

        # Fetch news and compute sentiment
        try:
            news_items = await MarketService.get_news([symbol])
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            analyzer = SentimentIntensityAnalyzer()
            
            if news_items:
                total_compound = 0
                for item in news_items:
                    content = item.get('content', item)
                    title = content.get('title', '')
                    summary = content.get('summary', '')
                    text = f"{title}. {summary}"
                    scores = analyzer.polarity_scores(text)
                    total_compound += scores['compound']
                
                avg_sentiment = total_compound / len(news_items)
                
                # Apply sentiment to signals
                for s in signals:
                    if avg_sentiment > 0.15:
                        if s.direction == SignalDirection.BULLISH:
                            s.confidence = min(100, s.confidence + 15)
                            s.message += f" (Boosted by positive news)"
                        elif s.direction == SignalDirection.BEARISH:
                            s.confidence = max(0, s.confidence - 15)
                            s.message += f" (Reduced by positive news)"
                    elif avg_sentiment < -0.15:
                        if s.direction == SignalDirection.BEARISH:
                            s.confidence = min(100, s.confidence + 15)
                            s.message += f" (Boosted by negative news)"
                        elif s.direction == SignalDirection.BULLISH:
                            s.confidence = max(0, s.confidence - 15)
                            s.message += f" (Reduced by negative news)"
        except Exception as e:
            print(f"Error computing sentiment for {symbol}: {e}")

        return signals

    @staticmethod
    async def scan_symbols(symbols: List[str], period: str = '3mo', interval: str = '1d') -> ScanResult:
        tasks = [SignalService.analyze_symbol(sym, period, interval) for sym in symbols]
        results = await asyncio.gather(*tasks)
        
        all_signals = []
        for signals in results:
            all_signals.extend(signals)
            
        all_signals.sort(key=lambda x: x.confidence, reverse=True)
        
        return ScanResult(
            symbols_scanned=len(symbols),
            signals=all_signals,
            timestamp=int(time.time() * 1000)
        )
