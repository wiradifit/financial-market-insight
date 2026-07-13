import pytest
import asyncio
import sys
sys.path.insert(0, '.')

from services.signal_service import SignalService
from models.signals import SignalType, SignalDirection, ScanResult


class TestSignalServiceAnalyzeSymbol:
    def test_insufficient_data_returns_empty(self):
        result = asyncio.run(SignalService.analyze_symbol("INVALID", period='1d', interval='1m'))
        assert result == []