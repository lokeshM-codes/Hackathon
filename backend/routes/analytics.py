from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import random

router = APIRouter()

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """
    Returns global system state performance and audit statistics.
    """
    state = db.query(models.SystemState).filter(models.SystemState.id == 1).first()
    if not state:
        state = models.SystemState(id=1, current_demo_step=0, trades_analyzed=124050)
        db.add(state)
        db.commit()

    stocks_count = db.query(models.Stock).count()
    alerts_count = db.query(models.Alert).count()
    critical_alerts = db.query(models.Alert).filter(models.Alert.severity == "CRITICAL").count()
    
    # Cumulative impact calculation
    total_loss_prevented = sum(a.estimated_impact_inr for a in db.query(models.Alert).all())
    
    return {
        "stocks_monitored": stocks_count,
        "active_alerts": alerts_count,
        "critical_alerts": critical_alerts,
        "trades_analyzed": state.trades_analyzed,
        "detection_accuracy": 98.4,
        "false_positive_rate": 1.2,
        "investor_loss_prevented_inr": total_loss_prevented,
        "system_metrics": {
            "throughput": state.throughput_tps,
            "latency": state.latency_ms,
            "uptime_seconds": state.uptime_seconds,
            "active_streams": 24,
            "model_inference_ms": state.model_inference_ms
        }
    }

@router.get("/heatmap")
def get_heatmap(db: Session = Depends(get_db)):
    """
    Returns a 3x3 grid of active stocks and their current risk score for heatmap visualization.
    """
    stocks = db.query(models.Stock).all()
    
    state = db.query(models.SystemState).filter(models.SystemState.id == 1).first()
    demo_step = state.current_demo_step if state else 0
    
    heatmap_data = []
    for s in stocks:
        # Determine risk score based on static scenario or current demo progress
        if s.symbol == "YES_BANK":
            risk_score = 0.94
        elif s.symbol == "ADANI_ENT":
            risk_score = 0.89
        elif s.symbol == "IRFC_PENNY":
            if demo_step >= 10:
                risk_score = 0.96
            elif demo_step >= 7:
                risk_score = 0.88
            elif demo_step >= 4:
                risk_score = 0.74
            elif demo_step >= 2:
                risk_score = 0.38
            else:
                risk_score = 0.15
        else:
            # General low fluctuations
            random.seed(s.symbol)
            risk_score = round(0.12 + random.uniform(0.0, 0.25), 2)
            
        heatmap_data.append({
            "symbol": s.symbol,
            "company_name": s.company_name,
            "current_price": s.current_price,
            "change_percent": s.change_percent,
            "risk_score": risk_score,
            "volume": s.volume
        })
        
    return heatmap_data

@router.get("/sentiment/{symbol}")
def get_sentiment(symbol: str, db: Session = Depends(get_db)):
    """
    Lists sentiment feeds (news/social) for a given symbol and provides average metrics.
    """
    feeds = db.query(models.SentimentFeed)\
        .filter(models.SentimentFeed.symbol == symbol)\
        .order_by(models.SentimentFeed.timestamp.desc())\
        .all()
        
    if not feeds:
        return {"symbol": symbol, "score": 0.0, "label": "neutral", "feeds": []}
        
    avg_score = sum(f.score for f in feeds) / len(feeds)
    
    label = "neutral"
    if avg_score > 0.20:
        label = "positive"
    elif avg_score < -0.20:
        label = "negative"
        
    return {
        "symbol": symbol,
        "score": round(avg_score, 2),
        "label": label,
        "feeds": feeds
    }

@router.get("/social/{symbol}")
def get_social_signals(symbol: str, db: Session = Depends(get_db)):
    """
    Exposes velocity of social discussions, counts, and trend directions.
    """
    state = db.query(models.SystemState).filter(models.SystemState.id == 1).first()
    demo_step = state.current_demo_step if state else 0
    
    velocity = 1.0
    mentions = random.randint(180, 290)
    sentiment_trend = "stable"
    
    # Specific demo updates for IRFC_PENNY
    if symbol == "IRFC_PENNY":
        if demo_step >= 10:
            velocity = 14.8
            mentions = 4320
            sentiment_trend = "divergent"
        elif demo_step >= 6:
            velocity = 8.4
            mentions = 2150
            sentiment_trend = "downward"
        elif demo_step >= 4:
            velocity = 3.2
            mentions = 780
            sentiment_trend = "upward"
    elif symbol == "YES_BANK":
        velocity = 12.5
        mentions = 6210
        sentiment_trend = "divergent"
    elif symbol == "ADANI_ENT":
        velocity = 2.4
        mentions = 1120
        sentiment_trend = "mixed"
        
    return {
        "symbol": symbol,
        "mention_velocity": velocity,
        "total_mentions_24h": mentions,
        "sentiment_trend": sentiment_trend,
        "platform_breakdown": {
            "twitter": int(mentions * 0.60),
            "reddit": int(mentions * 0.30),
            "forums": int(mentions * 0.10)
        }
    }
