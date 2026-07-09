from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.signals import Signal, ScanResult
from services.signal_service import SignalService

router = APIRouter(prefix="/signals", tags=["Signals"])

DEFAULT_SCAN_SYMBOLS = [
    # Top Crypto
    "BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD", "ADA-USD", "AVAX-USD", "DOGE-USD",
    "DOT-USD", "LINK-USD", "MATIC-USD", "SHIB-USD", "LTC-USD", "BCH-USD", "UNI-USD",
    
    # Top US Tech/Blue Chip Stocks
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "AMD",
    "INTC", "CRM", "NFLX", "ADBE", "PYPL", "SQ", "UBER", "COIN",
    
    # Financials & Others
    "JPM", "V", "MA", "DIS", "WMT", "JNJ", "PG"
]

@router.get("/scan", response_model=ScanResult)
async def scan_signals(
    symbols: Optional[str] = Query(None, description="Comma-separated list of symbols (e.g., BTC-USD,AAPL)"),
    period: str = Query("3mo"),
    interval: str = Query("1d")
):
    try:
        if symbols:
            symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]
        else:
            symbol_list = DEFAULT_SCAN_SYMBOLS
            
        return await SignalService.scan_symbols(symbol_list, period, interval)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{symbol}", response_model=List[Signal])
async def get_symbol_signals(
    symbol: str,
    period: str = Query("3mo"),
    interval: str = Query("1d")
):
    try:
        return await SignalService.analyze_symbol(symbol, period, interval)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
