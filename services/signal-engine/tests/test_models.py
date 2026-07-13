import pytest
import sys
sys.path.insert(0, '.')

from config import Settings
from cache import SimpleCache
from models.market import OHLCVBar, AssetInfo, MarketOverview
from models.signals import SignalType, SignalDirection, Signal, ScanResult


class TestSettings:
    def test_default_values(self):
        s = Settings()
        assert s.HOST == "0.0.0.0"
        assert s.PORT == 8000
        assert s.RATE_LIMIT == "100/minute"
        assert s.CACHE_TTL == 60

    def test_cors_origins_default(self):
        s = Settings()
        assert s.CORS_ORIGINS == "http://localhost:3000"

    def test_cors_origins_custom(self):
        s = Settings(CORS_ORIGINS="http://aa.com,http://bb.com")
        assert s.cors_origins_list == ["http://aa.com", "http://bb.com"]


class TestSimpleCache:
    def test_set_and_get(self):
        cache = SimpleCache()
        cache.set("key1", "value1", ttl=60)
        assert cache.get("key1") == "value1"

    def test_expiration(self):
        cache = SimpleCache()
        cache.set("key1", "value1", ttl=-1)
        assert cache.get("key1") is None

    def test_missing_key(self):
        cache = SimpleCache()
        assert cache.get("nonexistent") is None

    def test_overwrite(self):
        cache = SimpleCache()
        cache.set("key1", "old")
        cache.set("key1", "new")
        assert cache.get("key1") == "new"

    def test_set_no_ttl(self):
        cache = SimpleCache()
        cache.set("permanent", "data")
        assert cache.get("permanent") == "data"

    def test_clear(self):
        cache = SimpleCache()
        cache.set("k1", "v1")
        cache.set("k2", "v2")
        cache.clear()
        assert cache.get("k1") is None
        assert cache.get("k2") is None

    def test_delete(self):
        cache = SimpleCache()
        cache.set("k1", "v1")
        cache.set("k2", "v2")
        cache.delete("k1")
        assert cache.get("k1") is None
        assert cache.get("k2") == "v2"

    def test_delete_missing(self):
        cache = SimpleCache()
        cache.delete("nope")


class TestOHLCVBar:
    def test_creation(self):
        bar = OHLCVBar(timestamp=1000, open=100.0, high=110.0, low=95.0, close=105.0, volume=1000)
        assert bar.open == 100.0
        assert bar.close == 105.0
        assert bar.volume == 1000


class TestAssetInfo:
    def test_creation(self):
        asset = AssetInfo(
            symbol="BTC-USD", name="Bitcoin",
            price=50000.0, change=500.0, change_percent=1.0,
            high24h=51000.0, low24h=49000.0,
            volume=1000.0, last_updated=1700000000
        )
        assert asset.symbol == "BTC-USD"
        assert asset.price == 50000.0
        assert asset.market_cap is None

    def test_with_market_cap(self):
        asset = AssetInfo(
            symbol="BTC-USD", name="Bitcoin",
            price=50000.0, change=500.0, change_percent=1.0,
            high24h=51000.0, low24h=49000.0,
            volume=1000.0, market_cap=1_000_000_000_000.0,
            last_updated=1700000000
        )
        assert asset.market_cap == 1_000_000_000_000.0

    def test_camel_alias(self):
        asset = AssetInfo(
            symbol="BTC-USD", name="Bitcoin",
            price=50000.0, change=500.0, changePercent=1.0,
            high24h=51000.0, low24h=49000.0,
            volume=1000.0, lastUpdated=1700000000
        )
        assert asset.change_percent == 1.0
        assert asset.last_updated == 1700000000


class TestMarketOverview:
    def test_creation(self):
        overview = MarketOverview(crypto=[], stocks=[], forex=[], timestamp=1700000000)
        assert overview.crypto == []
        assert overview.stocks == []


class TestSignalType:
    def test_enum_values(self):
        assert SignalType.RSI_OVERSOLD.value == "RSI_OVERSOLD"
        assert SignalType.MACD_CROSSOVER.value == "MACD_CROSSOVER"
        assert SignalType.BOLLINGER_BOUNCE.value == "BOLLINGER_BOUNCE"


class TestSignalDirection:
    def test_enum_values(self):
        assert SignalDirection.BULLISH.value == "BULLISH"
        assert SignalDirection.BEARISH.value == "BEARISH"
        assert SignalDirection.NEUTRAL.value == "NEUTRAL"


class TestSignal:
    def test_full_signal(self):
        signal = Signal(
            symbol="BTC-USD",
            signal_type=SignalType.RSI_OVERSOLD,
            direction=SignalDirection.BULLISH,
            confidence=85,
            indicator_values={"RSI": 25.0},
            timeframe="1h",
            message="RSI oversold",
            timestamp=1700000000,
            entry_price=62000.0,
            tp=65000.0,
            sl=60000.0,
        )
        assert signal.confidence == 85
        assert signal.entry_price == 62000.0

    def test_minimal_signal(self):
        signal = Signal(
            symbol="ETH-USD",
            signal_type=SignalType.MACD_CROSSOVER,
            direction=SignalDirection.BEARISH,
            confidence=60,
            indicator_values={},
            timeframe="4h",
            message="MACD bearish",
            timestamp=1700000000
        )
        assert signal.entry_price is None

    def test_camel_alias(self):
        signal = Signal(
            symbol="BTC-USD",
            signalType="RSI_OVERSOLD",
            direction=SignalDirection.BULLISH,
            confidence=70,
            indicatorValues={},
            timeframe="1d",
            message="test",
            timestamp=1000,
        )
        assert signal.signal_type == "RSI_OVERSOLD"


class TestScanResult:
    def test_creation(self):
        result = ScanResult(symbols_scanned=37, signals=[], timestamp=1000000)
        assert result.symbols_scanned == 37

    def test_with_signal(self):
        signal = Signal(
            symbol="BTC-USD",
            signal_type=SignalType.RSI_OVERSOLD,
            direction=SignalDirection.BULLISH,
            confidence=85,
            indicator_values={"RSI": 25.0},
            timeframe="1h",
            message="RSI oversold",
            timestamp=1700000000,
        )
        result = ScanResult(symbols_scanned=1, signals=[signal], timestamp=1000000)
        assert len(result.signals) == 1