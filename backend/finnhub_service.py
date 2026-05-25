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


FINNHUB_RESOLUTIONS = ["5", "15", "30", "60", "D"]


def get_finnhub_candles(symbol: str, resolution: str = "5", minutes: int = 780):
    api_key = _get_api_key()
    to_ts = int(time.time())
    from_ts = max(0, to_ts - (minutes * 60))
    url = f"{FINNHUB_BASE_URL}/stock/candle"

    resolutions_to_try = [resolution] + [r for r in FINNHUB_RESOLUTIONS if r != resolution]

    last_error = None
    for res in resolutions_to_try:
        try:
            params = {
                "symbol": symbol,
                "resolution": res,
                "from": from_ts,
                "to": to_ts,
                "token": api_key
            }
            response = requests.get(url, params=params, timeout=10)
            if response.status_code != 200:
                last_error = ValueError(f"Finnhub candles returned HTTP {response.status_code} for resolution {res}")
                continue
            data = response.json()
            if data.get("s") != "ok":
                last_error = ValueError(f"Finnhub candles error: {data.get('s', 'unknown')} for resolution {res}")
                continue

            raw_timestamps = data.get("t", [])
            if len(raw_timestamps) == 0:
                last_error = ValueError(f"Finnhub returned empty candle array for resolution {res}")
                continue

            candles = []
            for i in range(len(raw_timestamps)):
                candles.append({
                    "timestamp": datetime.datetime.utcfromtimestamp(raw_timestamps[i]).isoformat(),
                    "open": data["o"][i],
                    "high": data["h"][i],
                    "low": data["l"][i],
                    "close": data["c"][i],
                    "volume": data["v"][i]
                })
            return candles
        except Exception as e:
            last_error = e
            continue

    raise last_error or ValueError(f"All Finnhub resolutions failed for {symbol}")


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
