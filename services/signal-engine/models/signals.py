from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List, Dict
from enum import Enum

class SignalType(str, Enum):
    RSI_OVERSOLD = "RSI_OVERSOLD"
    RSI_OVERBOUGHT = "RSI_OVERBOUGHT"
    MACD_CROSSOVER = "MACD_CROSSOVER"
    MACD_DIVERGENCE = "MACD_DIVERGENCE"
    BOLLINGER_BOUNCE = "BOLLINGER_BOUNCE"
    SMA_GOLDEN_CROSS = "SMA_GOLDEN_CROSS"
    SMA_DEATH_CROSS = "SMA_DEATH_CROSS"
    VOLUME_SPIKE = "VOLUME_SPIKE"

class SignalDirection(str, Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"

class Signal(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    symbol: str
    signal_type: str
    direction: SignalDirection
    confidence: int
    indicator_values: Dict[str, float]
    timeframe: str
    message: str
    timestamp: int

class ScanResult(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    symbols_scanned: int
    signals: List[Signal]
    timestamp: int
