import os
import time
import urllib.request
import json
import datetime

# Zero-dependency dotenv loader
def load_dotenv(dotenv_path=".env"):
    paths = [dotenv_path, os.path.join("backend", ".env"), os.path.join("..", ".env")]
    for path in paths:
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, value = line.split("=", 1)
                            os.environ[key.strip()] = value.strip().strip('"').strip("'")
                print(f"[Finnhub Service] Mapped environment variables from: {path}")
                break
            except Exception as e:
                print(f"[Finnhub Service] Error reading {path}: {e}")

# Load environment variables
load_dotenv()

# Standard Indian NSE tickers to map if they are tracked in DB
SYMBOL_MAPPINGS = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFOSYS": "INFY.NS",
    "YES_BANK": "YESBANK.NS",
    "HDFC_BANK": "HDFCBANK.NS",
    "ITC": "ITC.NS",
    "ADANI_ENT": "ADANIENT.NS",
    "ZOMATO": "ZOMATO.NS",
    "IRFC_PENNY": "IRFC.NS"
}

def get_finnhub_quote(symbol: str):
    """
    Fetches quote data for a symbol from Finnhub.
    """
    api_key = os.getenv("FINNHUB_API_KEY", "")
    if not api_key or "YOUR_FREE_API" in api_key:
        raise ValueError("Finnhub API Key is missing or unconfigured in .env file.")

    ticker = SYMBOL_MAPPINGS.get(symbol, symbol)
    url = f"https://finnhub.io/api/v1/quote?symbol={ticker}&token={api_key}"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=5) as response:
        data = json.loads(response.read().decode())
        
    # Finnhub returns current price c=0 or None if symbol is invalid or key fails
    if data.get("c") == 0 or data.get("c") is None:
        raise ValueError(f"No price data found for symbol: {ticker}. Confirm symbol name or API key limits.")
        
    return data

def get_finnhub_candles(symbol: str):
    """
    Fetches daily candles for a symbol from Finnhub (last 50 trading days).
    """
    api_key = os.getenv("FINNHUB_API_KEY", "")
    if not api_key or "YOUR_FREE_API" in api_key:
        raise ValueError("Finnhub API Key is missing or unconfigured in .env file.")

    ticker = SYMBOL_MAPPINGS.get(symbol, symbol)
    
    end_time = int(time.time())
    # Daily resolution 'D'. Get 50 candles.
    # Look back ~75 days to guarantee 50 trading days (accounting for weekends/holidays)
    start_time = end_time - (100 * 24 * 3600)
    
    url = f"https://finnhub.io/api/v1/stock/candle?symbol={ticker}&resolution=D&from={start_time}&to={end_time}&token={api_key}"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=5) as response:
        data = json.loads(response.read().decode())
        
    if data.get("s") != "ok":
        raise ValueError(f"Failed to fetch daily candles for: {ticker}. Finnhub status: {data.get('s')}")
        
    return data

def get_finnhub_news(symbol: str):
    """
    Fetches company news headlines from Finnhub for the past 3 days.
    """
    api_key = os.getenv("FINNHUB_API_KEY", "")
    if not api_key or "YOUR_FREE_API" in api_key:
        return []
    
    ticker = SYMBOL_MAPPINGS.get(symbol, symbol)
    # Remove suffix .NS or similar for news lookups on US profile mapping if needed,
    # but let's try with ticker directly first.
    clean_ticker = ticker.split(".")[0]
    
    end_date = datetime.date.today().isoformat()
    start_date = (datetime.date.today() - datetime.timedelta(days=3)).isoformat()
    
    url = f"https://finnhub.io/api/v1/company-news?symbol={clean_ticker}&from={start_date}&to={end_date}&token={api_key}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            news_data = json.loads(response.read().decode())
        return news_data[:8] # return top 8 articles
    except Exception as e:
        print(f"[Finnhub Service] Failed to retrieve news for {clean_ticker}: {e}")
        return []
