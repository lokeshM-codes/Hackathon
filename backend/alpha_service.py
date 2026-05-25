import os
import requests
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
                print(f"[Alpha Service] Mapped environment variables from: {path}")
                break
            except Exception as e:
                print(f"[Alpha Service] Error reading {path}: {e}")

# Load environment variables
load_dotenv()

def get_alpha_intraday(symbol: str):
    """
    Fetches 1-minute interval intraday stock series from Alpha Vantage.
    Returns:
        dict: Raw JSON response containing "Time Series (1min)"
    """
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    if not api_key or "YOUR_API_KEY" in api_key or api_key == "demo":
        raise ValueError("Alpha Vantage API Key is missing or unconfigured in .env file.")

    url = "https://www.alphavantage.co/query"
    params = {
        "function": "TIME_SERIES_INTRADAY",
        "symbol": symbol,
        "interval": "1min",
        "apikey": api_key
    }
    
    response = requests.get(url, params=params, timeout=10)
    if response.status_code != 200:
        raise ValueError(f"Alpha Vantage server returned HTTP status {response.status_code}")
        
    data = response.json()
    
    if "Note" in data:
        raise ValueError(f"Alpha Vantage API limit: {data['Note']}")
    if "Error Message" in data:
        raise ValueError(f"Alpha Vantage API error: {data['Error Message']}")
        
    time_series_key = "Time Series (1min)"
    if time_series_key not in data:
        # Check for limit or error message keys that might not be named standardly
        if "Information" in data:
            raise ValueError(f"Alpha Vantage message: {data['Information']}")
        keys = list(data.keys())
        raise ValueError(f"Could not find intraday time series for {symbol}. Response keys: {keys}")
        
    return data

def get_alpha_news(symbol: str):
    """
    Fetches news sentiment feeds for a symbol from Alpha Vantage.
    Returns:
        list: List of feed articles
    """
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    if not api_key or "YOUR_API_KEY" in api_key:
        return []
        
    url = "https://www.alphavantage.co/query"
    params = {
        "function": "NEWS_SENTIMENT",
        "tickers": symbol,
        "apikey": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "feed" in data:
                return data.get("feed", [])[:8] # return top 8 articles
            if "Note" in data:
                print(f"[Alpha Service] News rate limited: {data['Note']}")
    except Exception as e:
        print(f"[Alpha Service] Failed to retrieve news for {symbol}: {e}")
        
    return []
