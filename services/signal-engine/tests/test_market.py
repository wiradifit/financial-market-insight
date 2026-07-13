import pytest
import asyncio
from unittest.mock import patch, MagicMock
import sys
sys.path.insert(0, '.')

from services.market_service import MarketService
from models.market import OHLCVBar, AssetInfo, HistoryResponse, MarketOverview


class TestMarketService:
    @pytest.fixture
    def service(self):
        return MarketService()

    @patch('services.market_service.asyncio.to_thread')
    @patch('services.market_service.yf')
    def test_get_asset_info_returns_asset(self, mock_yf, mock_to_thread, service):
        mock_ticker = MagicMock()
        mock_ticker.info = {
            'symbol': 'AAPL', 'shortName': 'Apple Inc.',
            'currentPrice': 200.0, 'marketCap': 2_000_000_000_000,
        }
        import pandas as pd
        h = pd.DataFrame({
            'Close': [200.0, 202.0],
            'High': [202.0, 203.0],
            'Low': [199.0, 200.0],
            'Volume': [10000000, 11000000],
        }, index=pd.DatetimeIndex(['2024-01-01', '2024-01-02']))
        mock_ticker.history.return_value = h
        mock_yf.Ticker.return_value = mock_ticker

        mock_to_thread.return_value = AssetInfo(
            symbol='AAPL', name='Apple Inc.',
            price=202.0, change=2.0, change_percent=1.0,
            high24h=203.0, low24h=200.0,
            volume=11000000.0, market_cap=2_000_000_000_000,
            last_updated=1700000000
        )

        result = asyncio.run(MarketService.get_asset_info('AAPL'))
        assert result.symbol == 'AAPL'
        assert result.price == 202.0

    @patch('services.market_service.asyncio.to_thread')
    @patch('services.market_service.yf')
    def test_get_history_returns_bars(self, mock_yf, mock_to_thread, service):
        bars = [OHLCVBar(timestamp=1000000, open=100.0, high=105.0, low=95.0, close=102.0, volume=1000)]
        mock_to_thread.return_value = HistoryResponse(
            symbol='AAPL', data=bars, period='1d', interval='1h'
        )
        result = asyncio.run(MarketService.get_history('AAPL', period='1d', interval='1h'))
        assert result.symbol == 'AAPL'
        assert len(result.data) == 1

    @patch('services.market_service.asyncio.to_thread')
    @patch('services.market_service.yf')
    def test_get_news_returns_list(self, mock_yf, mock_to_thread, service):
        mock_to_thread.return_value = [{'title': 'Test', 'related_symbol': 'BTC-USD'}]
        result = asyncio.run(MarketService.get_news(['BTC-USD']))
        assert isinstance(result, list)

    @patch('services.market_service.MarketService.get_asset_info')
    def test_get_market_overview(self, mock_get_info, service):
        mock_asset = AssetInfo(
            symbol='TEST', name='Test', price=100.0, change=0.0, change_percent=0.0,
            high24h=0.0, low24h=0.0, volume=0.0, last_updated=1700000000
        )
        mock_get_info.return_value = mock_asset

        result = asyncio.run(MarketService.get_market_overview())
        assert isinstance(result, MarketOverview)
        assert len(result.crypto) == 4
        assert len(result.stocks) == 6
        assert len(result.forex) == 3