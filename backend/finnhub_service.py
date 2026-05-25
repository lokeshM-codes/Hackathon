import os
import requests
import datetime
import time
from alpha_service import load_dotenv

load_dotenv()

FINNHUB_BASE_URL = "https://finnhub.io/api/v1"


def _get_api_key():
    api_key = os.getenv("FINNHUB_API_KEY", "")
    if not api_key or "YOUR_API_KEY" in api_key:
        raise ValueError("Finnhub API Key is missing or unconfigured in .env file.")
    return api_key


def get_finnhub_quote(symbol: str):
    api_key = _get_api_key()
    url = f"{FINNHUB_BASE_URL}/quote"
    params = {"symbol": symbol, "token": api_key}
    response = requests.get(url, params=params, timeout=10)
    if response.status_code != 200:
        raise ValueError(f"Finnhub quote returned HTTP {response.status_code}")
    data = response.json()
    if not data or "c" not in data:
        raise ValueError("Finnhub quote did not return quote payload.")
    return data


def get_finnhub_candles(symbol: str, resolution: str = "1", minutes: int = 120):
    api_key = _get_api_key()
    to_ts = int(time.time())
    from_ts = max(0, to_ts - (minutes * 60))
    url = f"{FINNHUB_BASE_URL}/stock/candle"
    params = {
        "symbol": symbol,
        "resolution": resolution,
        "from": from_ts,
        "to": to_ts,
        "token": api_key
    }
    response = requests.get(url, params=params, timeout=10)
    if response.status_code != 200:
        raise ValueError(f"Finnhub candles returned HTTP {response.status_code}")
    data = response.json()
    if data.get("s") != "ok":
        raise ValueError(f"Finnhub candles error: {data.get('s', 'unknown')}")

    candles = []
    for i in range(len(data.get("t", []))):
        candles.append({
            "timestamp": datetime.datetime.utcfromtimestamp(data["t"][i]).isoformat(),
            "open": data["o"][i],
            "high": data["h"][i],
            "low": data["l"][i],
            "close": data["c"][i],
            "volume": data["v"][i]
        })
    return candles


def get_finnhub_company_news(symbol: str):
    api_key = _get_api_key()
    today = datetime.date.today()
    from_date = today - datetime.timedelta(days=7)
    url = f"{FINNHUB_BASE_URL}/company-news"
    params = {
        "symbol": symbol,
        "from": from_date.isoformat(),
        "to": today.isoformat(),
        "token": api_key
    }
    response = requests.get(url, params=params, timeout=10)
    if response.status_code != 200:
        raise ValueError(f"Finnhub company news returned HTTP {response.status_code}")
    data = response.json()
    if not isinstance(data, list):
        raise ValueError("Finnhub company news did not return a feed list.")

    feed = []
    for item in data[:8]:
        title = item.get("headline", "")
        summary = item.get("summary", "")
        text = f"{title} {summary}".lower()
        score = 0.0
        if any(keyword in text for keyword in ["upgrade", "beats", "bull", "stronger", "outperform"]):
            score = 0.45
        elif any(keyword in text for keyword in ["downgrade", "miss", "bear", "weak", "underperform"]):
            score = -0.45

        time_value = item.get("datetime")
        if isinstance(time_value, (int, float)):
            try:
                time_published = datetime.datetime.utcfromtimestamp(int(time_value)).isoformat()
            except Exception:
                time_published = today.isoformat()
        else:
            time_published = str(time_value or today.isoformat())

        feed.append({
            "title": title,
            "summary": summary,
            "source": item.get("source", "News"),
            "time_published": time_published,
            "overall_sentiment_score": score,
            "url": item.get("url", "")
        })
    return feed
