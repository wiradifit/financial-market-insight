from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import time

from config import settings
from routers import market_data, signals

# Rate limiting
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])

app = FastAPI(
    title="Financial Market Insight - Signal Engine",
    description="Microservice for market data fetching and technical analysis signal generation",
    version="1.0.0"
)

# Setup rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# Include routers
app.include_router(market_data.router, prefix="/api")
app.include_router(signals.router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "signal-engine", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=True
    )
