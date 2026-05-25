import random
from datetime import datetime
from sqlalchemy.orm import Session
from models import SentimentFeed

TWITTER_TEMPLATES = [
    "Retail option buyers are loading up on {symbol} calls. Short squeeze incoming? 🔥",
    "Massive block trade detected on {symbol}. Institutional buying or insider operation?",
    "Is {symbol} the next multibagger? Volume is breaking all records today!",
    "SEBI should audit accounts trading {symbol} today. Unusual volume spikes.",
    "Accumulating {symbol} on this dip. Strong tech indicators showing support.",
    "Unprecedented option volume on {symbol} prior to expiry.",
    "Fundamentals of {symbol} are broken, yet price is defying gravity. Retail trap?",
]

REDDIT_TEMPLATES = [
    "My detailed DD on {symbol} - why it's going to 2x this week 🚀🚀",
    "Beware of the {symbol} hype. The volume is completely synthetic and coordinated.",
    "Anyone else noticed coordinated buying clusters on {symbol} options?",
    "{symbol} is looking like a prime pump and dump target. Stay safe retail bros.",
    "Why is volume on {symbol} up 15x today? No corporate filings yet.",
    "Option premium pricing for {symbol} suggests massive volatility is imminent.",
    "Strong hands holding {symbol}. To the moon! 💎🙌",
]

def generate_social_post(symbol: str) -> dict:
    """
    Generates a realistic social media post (Twitter or Reddit) for a given symbol
    with calculated sentiment score and source.
    """
    source = random.choice(["Twitter", "Reddit"])
    templates = TWITTER_TEMPLATES if source == "Twitter" else REDDIT_TEMPLATES
    content = random.choice(templates).format(symbol=symbol)
    
    # Calculate simple keyword sentiment
    if any(w in content.lower() for w in ["trap", "suspicious", "pump", "dump", "warn", "broken"]):
        sentiment = "negative"
        score = random.uniform(-0.85, -0.45)
    elif any(w in content.lower() for w in ["multibagger", "moon", "squeeze", "🔥", "🚀", "buy", "holding"]):
        sentiment = "positive"
        score = random.uniform(0.5, 0.95)
    else:
        sentiment = "neutral"
        score = random.uniform(-0.15, 0.15)
        
    return {
        "symbol": symbol,
        "title": f"{source} post by user @MarketVigilant" if source == "Twitter" else f"Reddit discussion in r/IndianStreetBets",
        "content": content,
        "sentiment": sentiment,
        "score": round(score, 2),
        "source": source,
        "timestamp": datetime.now()
    }
