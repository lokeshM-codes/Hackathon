import datetime
import random
from sqlalchemy.orm import Session
from models import Stock, StockPriceHistory, Alert, SentimentFeed, SystemState
from social_simulator import generate_social_post

def tick_market(db: Session):
    """
    Ticks the market forward by 1 interval.
    If demo is running, it advances the demo state.
    Otherwise, it adds normal price fluctuations.
    """
    state = db.query(SystemState).filter(SystemState.id == 1).first()
    if not state:
        state = SystemState(id=1, current_demo_step=0, trades_analyzed=124050)
        db.add(state)
        db.commit()

    step = state.current_demo_step
    
    # Increment trades analyzed & system stats simulation
    state.trades_analyzed += random.randint(120, 280)
    state.throughput_tps = round(450.0 + random.uniform(-15, 15), 1)
    state.latency_ms = round(11.5 + random.uniform(-1.5, 3.5), 1)
    db.commit()

    if 0 < step <= 12:
        # Execute the specific step actions
        execute_demo_step(db, step, state)
        
        # Advance step automatically if it's running
        if step < 12:
            state.current_demo_step += 1
            db.commit()
    else:
        # Normal fluctuation for all stocks
        stocks = db.query(Stock).all()
        for stock in stocks:
            # Let YES_BANK and IRFC_PENNY stay static or show minor noise unless demo triggers
            if stock.symbol == "IRFC_PENNY" and step == 0:
                change_pct = random.uniform(-0.005, 0.005)
            elif stock.symbol == "YES_BANK":
                change_pct = random.uniform(-0.002, 0.002)
            else:
                change_pct = random.uniform(-0.012, 0.012)
                
            stock.current_price = round(stock.current_price * (1 + change_pct), 2)
            stock.change_percent = round(((stock.current_price - stock.base_price) / stock.base_price) * 100, 2)
            
            # Small random volume change
            vol_delta = random.randint(-4000, 4000)
            stock.volume = max(5000, stock.volume + vol_delta)
            
            # Store history point
            history_item = StockPriceHistory(
                symbol=stock.symbol,
                price=stock.current_price,
                volume=stock.volume,
                timestamp=datetime.datetime.now(),
                is_anomaly=False,
                anomaly_score=round(0.04 + random.uniform(0.0, 0.12), 2),
                is_prediction=False,
                predicted_price=stock.current_price
            )
            db.add(history_item)
            
            # Trigger social post with 12% probability
            if random.random() < 0.12:
                post_data = generate_social_post(stock.symbol)
                post = SentimentFeed(
                    symbol=post_data["symbol"],
                    title=post_data["title"],
                    content=post_data["content"],
                    sentiment=post_data["sentiment"],
                    score=post_data["score"],
                    source=post_data["source"],
                    timestamp=post_data["timestamp"]
                )
                db.add(post)
                
        db.commit()

def execute_demo_step(db: Session, step: int, state: SystemState):
    """
    Executes a deterministic step of the cinematic Pump & Dump sequence for IRFC_PENNY.
    """
    now = datetime.datetime.now()
    stock = db.query(Stock).filter(Stock.symbol == "IRFC_PENNY").first()
    if not stock:
        return

    # Keep all other stocks fluctuating normally in background
    other_stocks = db.query(Stock).filter(Stock.symbol != "IRFC_PENNY").all()
    for s in other_stocks:
        change_pct = random.uniform(-0.005, 0.005)
        s.current_price = round(s.current_price * (1 + change_pct), 2)
        s.change_percent = round(((s.current_price - s.base_price) / s.base_price) * 100, 2)
        db.add(StockPriceHistory(
            symbol=s.symbol, price=s.current_price, volume=s.volume, timestamp=now,
            is_anomaly=False, anomaly_score=0.1
        ))

    if step == 1:
        # Step 1: Normal trading begins. Reset IRFC_PENNY.
        stock.current_price = 22.0
        stock.volume = 150000
        stock.change_percent = 0.0
        db.add(StockPriceHistory(
            symbol="IRFC_PENNY", price=22.0, volume=150000, timestamp=now,
            is_anomaly=False, anomaly_score=0.12
        ))
        db.commit()

    elif step == 2:
        # Step 2: Volume surge increases gradually
        stock.current_price = 22.80
        stock.volume = 650000  # 4x volume
        stock.change_percent = 3.64
        db.add(StockPriceHistory(
            symbol="IRFC_PENNY", price=22.80, volume=650000, timestamp=now,
            is_anomaly=False, anomaly_score=0.38
        ))
        db.commit()

    elif step == 3:
        # Step 3: Price spike starts
        stock.current_price = 26.20
        stock.volume = 2200000  # 15x volume
        stock.change_percent = 19.09
        db.add(StockPriceHistory(
            symbol="IRFC_PENNY", price=26.20, volume=2200000, timestamp=now,
            is_anomaly=True, anomaly_score=0.74
        ))
        db.commit()

    elif step == 4:
        # Step 4: Volume alert appears
        alert = Alert(
            symbol="IRFC_PENNY",
            title="VOLUME_SURGE Flagged",
            severity="WARNING",
            risk_score=0.74,
            explanation="Unusual volume spike (15x over average) detected on IRFC_PENNY in under 5 minutes.",
            confidence=0.82,
            estimated_impact_inr=1500000.0,
            timestamp=now
        )
        db.add(alert)
        db.commit()

    elif step == 5:
        # Step 5: Price spike alert appears
        alert = Alert(
            symbol="IRFC_PENNY",
            title="PRICE_SPIKE Flagged",
            severity="WARNING",
            risk_score=0.79,
            explanation="Abrupt price acceleration of +19.1% within 2 minutes. Deviation exceeds historic sector volatility.",
            confidence=0.85,
            estimated_impact_inr=2200000.0,
            timestamp=now
        )
        db.add(alert)
        db.commit()

    elif step == 6:
        # Step 6: Negative news floods sentiment feed
        news = SentimentFeed(
            symbol="IRFC_PENNY",
            title="SEBI Investigates Bulk Trades in Rail Penny Shares",
            content="Regulator scans suspicious accounts registered overseas routing orders through domestic brokers.",
            sentiment="negative", score=-0.85, source="News", timestamp=now
        )
        tweet = SentimentFeed(
            symbol="IRFC_PENNY",
            title="Twitter Post by @TraderScamAlert",
            content="IRFC_PENNY has classic pump and dump signature. Do not buy! Operators will dump soon. #Nifty",
            sentiment="negative", score=-0.92, source="Social Media", timestamp=now
        )
        db.add(news)
        db.add(tweet)
        db.commit()

    elif step == 7:
        # Step 7: Sentiment mismatch detected
        alert = Alert(
            symbol="IRFC_PENNY",
            title="SENTIMENT_MISMATCH Flagged",
            severity="CRITICAL",
            risk_score=0.88,
            explanation="Price is skyrocketing (+19.1%) while news and social sentiment is deep negative (-0.89).",
            confidence=0.91,
            estimated_impact_inr=3200000.0,
            timestamp=now
        )
        db.add(alert)
        db.commit()

    elif step == 8:
        # Step 8: Insider graph lights up (handled in router / state)
        pass

    elif step == 9:
        # Step 9: AI explanation appears (handled on frontend via step mapping)
        pass

    elif step == 10:
        # Step 10: PUMP_DUMP CRITICAL alert fires
        alert = Alert(
            symbol="IRFC_PENNY",
            title="PUMP_DUMP Scheme Detected",
            severity="CRITICAL",
            risk_score=0.96,
            explanation="Coordinated Pump & Dump confirmed. AI model detects synchronized trade loops, volume anomalies, and polarity divergence.",
            confidence=0.96,
            estimated_impact_inr=42000000.0,  # ₹4.2 Crores
            timestamp=now
        )
        db.add(alert)
        
        # Target peak values
        stock.current_price = 32.50
        stock.volume = 5800000
        stock.change_percent = 47.73
        db.add(StockPriceHistory(
            symbol="IRFC_PENNY", price=32.50, volume=5800000, timestamp=now,
            is_anomaly=True, anomaly_score=0.96
        ))
        db.commit()

    elif step == 11:
        # Step 11: AI confidence reaches 96%
        pass

    elif step == 12:
        # Step 12: ₹4.2 Cr Investor Loss Prevented flashes (handled in frontend layout)
        pass
