from fastapi import APIRouter, HTTPException
from finnhub_service import get_finnhub_quote, get_finnhub_candles, get_finnhub_company_news
import datetime

router = APIRouter()

COMPANY_NAMES = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "TSLA": "Tesla Inc.",
    "GOOGL": "Alphabet Inc.",
    "AMZN": "Amazon.com Inc.",
    "NVDA": "NVIDIA Corporation",
    "META": "Meta Platforms Inc.",
    "IBM": "International Business Machines Corp.",
    "RELIANCE.BSE": "Reliance Industries Ltd.",
    "TCS.BSE": "Tata Consultancy Services Ltd.",
    "INFY": "Infosys Ltd.",
    "HDFCBANK.BSE": "HDFC Bank Ltd.",
}


@router.get("/quote/{symbol}")
def get_quote(symbol: str):
    """Fast quote-only endpoint returning current price, change, volume."""
    symbol_upper = symbol.upper().strip()
    try:
        quote = get_finnhub_quote(symbol_upper)
        company_name = COMPANY_NAMES.get(symbol_upper, f"{symbol_upper} Corp.")
        return {
            "symbol": symbol_upper,
            "company_name": company_name,
            "current_price": quote.get("c", 0),
            "change_percent": round(((quote.get("c", 0) - quote.get("pc", 0)) / max(quote.get("pc", 1), 1)) * 100, 2),
            "change": round(quote.get("d", 0), 2),
            "high": quote.get("h", 0),
            "low": quote.get("l", 0),
            "open": quote.get("o", 0),
            "previous_close": quote.get("pc", 0),
            "volume": int(quote.get("v", 0)),
            "timestamp": datetime.datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Quote fetch failed: {str(e)}")


@router.get("/candles/{symbol}")
def get_candles(symbol: str, resolution: str = "5", minutes: int = 780):
    """Returns OHLCV candle data for charting."""
    symbol_upper = symbol.upper().strip()
    try:
        candles = get_finnhub_candles(symbol_upper, resolution, minutes)
        return {"symbol": symbol_upper, "candles": candles, "count": len(candles)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Candle fetch failed: {str(e)}")


@router.get("/news/{symbol}")
def get_news(symbol: str):
    """Returns recent news for a symbol."""
    symbol_upper = symbol.upper().strip()
    try:
        news = get_finnhub_company_news(symbol_upper)
        return {"symbol": symbol_upper, "news": news, "count": len(news)}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"News fetch failed: {str(e)}")