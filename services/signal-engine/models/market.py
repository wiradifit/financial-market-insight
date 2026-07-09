from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List, Optional
from datetime import datetime

class OHLCVBar(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    timestamp: int
    open: float
    high: float
    low: float
    close: float
    volume: float

class AssetInfo(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    high24h: float
    low24h: float
    volume: float
    market_cap: Optional[float] = None
    last_updated: int

class HistoryResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    symbol: str
    interval: str
    period: str
    data: List[OHLCVBar]

class MarketOverview(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    crypto: List[AssetInfo]
    stocks: List[AssetInfo]
    forex: List[AssetInfo]
    timestamp: int
