import datetime
import random
from sqlalchemy.orm import Session
from models import Stock, StockPriceHistory, Alert, SentimentFeed, SystemState

STOCKS_BASE = [
    {"symbol": "RELIANCE", "company_name": "Reliance Industries Ltd.", "base_price": 2450.0, "volume": 1200000},
    {"symbol": "TCS", "company_name": "Tata Consultancy Services Ltd.", "base_price": 3210.0, "volume": 800000},
    {"symbol": "INFOSYS", "company_name": "Infosys Limited", "base_price": 1420.0, "volume": 950000},
    {"symbol": "HDFC_BANK", "company_name": "HDFC Bank Limited", "base_price": 1580.0, "volume": 1500000},
    {"symbol": "ITC", "company_name": "ITC Limited", "base_price": 420.0, "volume": 2000000},
    {"symbol": "YES_BANK", "company_name": "Yes Bank Limited", "base_price": 16.5, "volume": 5000000},
    {"symbol": "ADANI_ENT", "company_name": "Adani Enterprises Ltd.", "base_price": 2890.0, "volume": 600000},
    {"symbol": "ZOMATO", "company_name": "Zomato Limited", "base_price": 82.0, "volume": 3500000},
    {"symbol": "IRFC_PENNY", "company_name": "IRFC Penny Tracker", "base_price": 22.0, "volume": 4500000},
]

# Generate base history (50 data points per stock)
def generate_historical_prices(symbol, base_price, count=50):
    history = []
    current_time = datetime.datetime.now() - datetime.timedelta(minutes=count)
    price = base_price
    
    # Yes Bank and IRFC Penny have specific setups
    for i in range(count):
        current_time += datetime.timedelta(minutes=1)
        # Random walk
        change_pct = random.uniform(-0.015, 0.015)
        price = round(price * (1 + change_pct), 2)
        volume = int(random.uniform(0.5, 1.5) * (STOCKS_BASE[0]["volume"] / 10 if "PENNY" in symbol or symbol == "YES_BANK" else STOCKS_BASE[0]["volume"] / 20))
        
        history.append({
            "symbol": symbol,
            "price": price,
            "volume": volume,
            "timestamp": current_time,
            "is_anomaly": False,
            "anomaly_score": 0.05 + random.uniform(0.0, 0.15)
        })
    return history

INITIAL_ALERTS = [
    {
        "symbol": "YES_BANK",
        "title": "Abnormal Price-Sentiment Divergence",
        "severity": "CRITICAL",
        "risk_score": 0.94,
        "explanation": "YES_BANK price surged by 35% on a 50x volume spike despite overwhelming negative social/news sentiment. AI flags this as potential coordinated buying or short squeeze manipulation.",
        "confidence": 0.92,
        "estimated_impact_inr": 8500000.0,
        "timestamp": datetime.datetime.now() - datetime.timedelta(minutes=5)
    },
    {
        "symbol": "ADANI_ENT",
        "title": "Coordinated Insider Trading Ring",
        "severity": "CRITICAL",
        "risk_score": 0.89,
        "explanation": "Graph analysis detected high connectivity and synchronized high-volume option trades between 4 accounts connected to shell brokers prior to regulatory announcements.",
        "confidence": 0.88,
        "estimated_impact_inr": 24000000.0,
        "timestamp": datetime.datetime.now() - datetime.timedelta(minutes=18)
    },
    {
        "symbol": "RELIANCE",
        "title": "Minor Anomaly Detected",
        "severity": "INFO",
        "risk_score": 0.32,
        "explanation": "Slight upward volume deviation in block deals. Under surveillance.",
        "confidence": 0.65,
        "estimated_impact_inr": 1200000.0,
        "timestamp": datetime.datetime.now() - datetime.timedelta(minutes=32)
    },
    {
        "symbol": "IRFC_PENNY",
        "title": "Social Media Hype Accel",
        "severity": "WARNING",
        "risk_score": 0.72,
        "explanation": "Reddit and Twitter mentions of IRFC_PENNY spiked 12x in 2 hours with standard pump vocabulary (e.g. 'to the moon', 'rocket', 'next multibagger'). Price momentum starting to accelerate.",
        "confidence": 0.81,
        "estimated_impact_inr": 4500000.0,
        "timestamp": datetime.datetime.now() - datetime.timedelta(minutes=45)
    }
]

INITIAL_NEWS_SOCIAL = [
    # News
    {"symbol": "YES_BANK", "title": "SEBI Launches Investigation Into Yes Bank Unusual Derivative Volumes", "content": "The market regulator has initiated an inspection of trade logs from several brokerage firms following massive block trades.", "sentiment": "negative", "score": -0.85, "source": "News"},
    {"symbol": "YES_BANK", "title": "Yes Bank Reports Flat Profit Margins, Bad Loans Remain Sticky", "content": "Q4 earnings reports disappointed institutional investors, with NPAs showing slow recovery despite internal restructure.", "sentiment": "negative", "score": -0.68, "source": "News"},
    {"symbol": "YES_BANK", "title": "Retail Option Traders Face Massive Liquidations on Volatile Expiry", "content": "Unprecedented moves in YES_BANK call contracts lead to extensive losses for option writers as price defying fundamentals surges.", "sentiment": "negative", "score": -0.42, "source": "News"},
    {"symbol": "ADANI_ENT", "title": "Adani Group Secures $1.2B Funding for New Solar Initiative", "content": "Consortium of international banks commits funding, driving long-term positive outlook for energy units.", "sentiment": "positive", "score": 0.82, "source": "News"},
    {"symbol": "RELIANCE", "title": "Reliance Retail Launches 50 New Premium Stores Across Metro Hubs", "content": "Retail wing continues aggressive expansion targeting high-margin luxury segments.", "sentiment": "positive", "score": 0.75, "source": "News"},
    {"symbol": "TCS", "title": "TCS Bags Mega Cloud Transformation Deal With European Telecom Giant", "content": "Multi-year deal worth $400M solidifies pipeline, mitigating worries of global IT budget cuts.", "sentiment": "positive", "score": 0.88, "source": "News"},
    {"symbol": "IRFC_PENNY", "title": "Small Cap Stocks Suspected of Shell Infrastructure Manipulation", "content": "Financial experts warn retail investors to stay away from penny railway trackers facing pump-and-dump behaviors.", "sentiment": "negative", "score": -0.78, "source": "News"},
    
    # Social Media posts
    {"symbol": "YES_BANK", "title": "Twitter post by @MarketWhales", "content": "YES_BANK dump is imminent. Retail options traps are wide open, do not fall for this pump. Fundamentals are broken! #Nifty50", "sentiment": "negative", "score": -0.90, "source": "Social Media"},
    {"symbol": "YES_BANK", "title": "Reddit post on r/IndiaInvestments", "content": "Why is YES_BANK going up? Profit has tanked, NPA is still bad, yet price is +35%? Feels like coordinate block operations.", "sentiment": "negative", "score": -0.75, "source": "Social Media"},
    {"symbol": "IRFC_PENNY", "title": "Reddit post on r/IndianStreetBets", "content": "IRFC_PENNY is the next multibagger! 🚀 Buy now, targets of 100+ incoming. Rocket emoji to the moon! 💎🙌", "sentiment": "positive", "score": 0.95, "source": "Social Media"},
    {"symbol": "IRFC_PENNY", "title": "Twitter post by @PennyStocksIndia", "content": "IRFC_PENNY volume breaking 10-day averages. Get in before the circuit lock. Easy 2x returns from here!", "sentiment": "positive", "score": 0.85, "source": "Social Media"},
    {"symbol": "ADANI_ENT", "title": "Twitter post by @InsideAlpha", "content": "Massive block trading noticed on ADANI_ENT right before the funding news. Suspicious accounts buying. SEBI awake? #Insider", "sentiment": "negative", "score": -0.65, "source": "Social Media"},
]

# Insider graph node structure mock data
# We can load this into memory / serve from router or database
MOCK_INSIDER_GRAPH = {
    "nodes": [
        # Targets
        {"id": "Adani_Corp", "label": "ADANI_ENT", "type": "company", "risk": "medium", "details": "Listed Entity"},
        {"id": "Acme_Shell_1", "label": "Acme Holdings (Mauritius)", "type": "shell", "risk": "critical", "details": "Shell Entity"},
        {"id": "Acme_Shell_2", "label": "Apex Fund (Cayman)", "type": "shell", "risk": "critical", "details": "Shell Entity"},
        
        # Brokers
        {"id": "Broker_Alpha", "label": "Alpha Brokerage", "type": "broker", "risk": "medium", "details": "Direct Market Access Provider"},
        {"id": "Broker_Beta", "label": "Vanguard Global Broker", "type": "broker", "risk": "low", "details": "Clearing Broker"},
        
        # Traders/Insiders
        {"id": "Trader_A", "label": "Rohan Gupta (Ex-Director)", "type": "trader", "risk": "critical", "details": "Former insider, synchronized buying patterns"},
        {"id": "Trader_B", "label": "Anjali Shah (Associate)", "type": "trader", "risk": "critical", "details": "Daughter of Board member, account active on Expiry"},
        {"id": "Trader_C", "label": "Vikram Mehta (Trader)", "type": "trader", "risk": "medium", "details": "Coordinated with Acme Shell 1"},
        {"id": "Trader_D", "label": "Sanjay Rao (Retail)", "type": "trader", "risk": "low", "details": "Standard retail activity"},
        {"id": "Trader_E", "label": "Karan Johar (HNW)", "type": "trader", "risk": "low", "details": "Standard high net worth investor"},
    ],
    "links": [
        {"source": "Trader_A", "target": "Acme_Shell_1", "value": 5, "relationship": "Beneficiary Owner"},
        {"source": "Trader_B", "target": "Acme_Shell_2", "value": 5, "relationship": "Beneficiary Owner"},
        {"source": "Acme_Shell_1", "target": "Broker_Alpha", "value": 3, "relationship": "Clearing Channel"},
        {"source": "Acme_Shell_2", "target": "Broker_Alpha", "value": 3, "relationship": "Clearing Channel"},
        {"source": "Broker_Alpha", "target": "Adani_Corp", "value": 8, "relationship": "High Volume Transactions"},
        {"source": "Trader_C", "target": "Broker_Alpha", "value": 2, "relationship": "Coordinated Orders"},
        {"source": "Trader_D", "target": "Broker_Beta", "value": 1, "relationship": "Retail Order Flow"},
        {"source": "Broker_Beta", "target": "Adani_Corp", "value": 3, "relationship": "Regular Order Flow"},
        {"source": "Trader_E", "target": "Broker_Beta", "value": 2, "relationship": "Regular Order Flow"}
    ]
}

def seed_db(db: Session):
    # Check if seeded
    if db.query(Stock).first():
        return # Already seeded
    
    # 1. Add stocks
    for s in STOCKS_BASE:
        stock = Stock(
            symbol=s["symbol"],
            company_name=s["company_name"],
            base_price=s["base_price"],
            current_price=s["base_price"],
            volume=s["volume"],
            change_percent=0.0
        )
        db.add(stock)
    
    # 2. Add history
    for s in STOCKS_BASE:
        histories = generate_historical_prices(s["symbol"], s["base_price"], 50)
        
        # Inject Yes Bank special scenario at the end of the history
        if s["symbol"] == "YES_BANK":
            # Change the last 5 ticks to represent a huge spike
            # To show a 35% jump and 50x volume spike
            last_idx = len(histories) - 1
            histories[last_idx]["price"] = round(s["base_price"] * 1.35, 2)
            histories[last_idx]["volume"] = s["volume"] * 50
            histories[last_idx]["is_anomaly"] = True
            histories[last_idx]["anomaly_score"] = 0.94
            
            # update stock current details
            db.query(Stock).filter(Stock.symbol == "YES_BANK").update({
                "current_price": round(s["base_price"] * 1.35, 2),
                "volume": s["volume"] * 50,
                "change_percent": 35.0
            })
            
        for h in histories:
            hist_item = StockPriceHistory(
                symbol=h["symbol"],
                price=h["price"],
                volume=h["volume"],
                timestamp=h["timestamp"],
                is_anomaly=h["is_anomaly"],
                anomaly_score=h["anomaly_score"],
                is_prediction=False,
                predicted_price=h["price"]
            )
            db.add(hist_item)

    # 3. Add alerts
    for a in INITIAL_ALERTS:
        alert = Alert(
            symbol=a["symbol"],
            title=a["title"],
            severity=a["severity"],
            risk_score=a["risk_score"],
            explanation=a["explanation"],
            confidence=a["confidence"],
            estimated_impact_inr=a["estimated_impact_inr"],
            timestamp=a["timestamp"]
        )
        db.add(alert)
        
    # 4. Add Sentiment
    for i, sf in enumerate(INITIAL_NEWS_SOCIAL):
        sentiment = SentimentFeed(
            symbol=sf["symbol"],
            title=sf["title"],
            content=sf["content"],
            sentiment=sf["sentiment"],
            score=sf["score"],
            source=sf["source"],
            timestamp=datetime.datetime.now() - datetime.timedelta(minutes=i * 5)
        )
        db.add(sentiment)
        
    # 5. Add SystemState
    state = SystemState(
        id=1,
        current_demo_step=0,
        trades_analyzed=124050,
        latency_ms=12.4,
        throughput_tps=450.0,
        uptime_seconds=86400,
        model_inference_ms=4.2
    )
    db.add(state)
    
    db.commit()
