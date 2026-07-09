from fastapi import APIRouter, HTTPException, Query
from models.market import AssetInfo, HistoryResponse, MarketOverview
from services.market_service import MarketService

router = APIRouter(prefix="/market", tags=["Market Data"])

@router.get("/overview", response_model=MarketOverview)
async def get_overview():
    try:
        return await MarketService.get_market_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks/{symbol}", response_model=AssetInfo)
async def get_stock_info(symbol: str):
    try:
        return await MarketService.get_asset_info(symbol)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks/{symbol}/history", response_model=HistoryResponse)
async def get_stock_history(
    symbol: str, 
    period: str = Query("1mo", description="Valid periods: 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max"),
    interval: str = Query("1d", description="Valid intervals: 1m,2m,5m,15m,30m,60m,90m,1h,1d,5d,1wk,1mo,3mo")
):
    try:
        return await MarketService.get_history(symbol, period, interval)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/crypto/{symbol}", response_model=AssetInfo)
async def get_crypto_info(symbol: str):
    if not symbol.endswith("-USD"):
        symbol = f"{symbol}-USD"
    try:
        return await MarketService.get_asset_info(symbol)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/crypto/{symbol}/history", response_model=HistoryResponse)
async def get_crypto_history(
    symbol: str, 
    period: str = Query("1mo"),
    interval: str = Query("1d")
):
    if not symbol.endswith("-USD"):
        symbol = f"{symbol}-USD"
    try:
        return await MarketService.get_history(symbol, period, interval)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forex/{base}/{quote}", response_model=AssetInfo)
async def get_forex_info(base: str, quote: str):
    symbol = f"{base}{quote}=X"
    try:
        return await MarketService.get_asset_info(symbol)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news", response_model=list[dict])
async def get_news(symbols: str = Query("BTC-USD,ETH-USD,SOL-USD", description="Comma separated list of symbols")):
    try:
        sym_list = [s.strip() for s in symbols.split(",") if s.strip()]
        return await MarketService.get_news(sym_list)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
