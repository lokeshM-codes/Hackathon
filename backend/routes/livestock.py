from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from alpha_service import get_alpha_intraday, get_alpha_news
from anomaly_detector import detector
from pump_dump_predictor import predictor
from sentiment_analyzer import analyzer
import datetime

router = APIRouter()

COMPANY_NAMES = {
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corporation",
    "TSLA": "Tesla Inc.",
    "IBM": "International Business Machines Corp.",
    "RELIANCE.BSE": "Reliance Industries Ltd.",
    "TCS.BSE": "Tata Consultancy Services Ltd."
}

@router.get("/{symbol}")
def get_live_stock_details(symbol: str, db: Session = Depends(get_db)):
    """
    Retrieves intraday 1-minute stock candles and news sentiment from Alpha Vantage,
    pipelines the data through anomaly detection and pump-and-dump classifiers,
    and returns the fully evaluated terminal state.
    """
    symbol_upper = symbol.upper().strip()
    
    # 1. Fetch data from Alpha Vantage service
    try:
        data = get_alpha_intraday(symbol_upper)
        news = get_alpha_news(symbol_upper)
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Live market connection failed. Reverting to demo mode. Detail: {str(e)}"
        )

    # 2. Parse time series candles
    time_series = data.get("Time Series (1min)", {})
    time_keys = sorted(time_series.keys())
    
    # Return last 50 candles
    time_keys = time_keys[-50:]
    if not time_keys:
        raise HTTPException(
            status_code=400, 
            detail="Alpha Vantage returned empty time series data. Reverting to demo mode."
        )

    history_ticks = []
    c_list = []
    h_list = []
    l_list = []
    o_list = []
    v_list = []
    t_list = []
    
    for tk in time_keys:
        candle = time_series[tk]
        open_val = float(candle["1. open"])
        high_val = float(candle["2. high"])
        low_val = float(candle["3. low"])
        close_val = float(candle["4. close"])
        volume_val = int(candle["5. volume"])
        
        try:
            dt = datetime.datetime.strptime(tk, "%Y-%m-%d %H:%M:%S")
            dt_str = dt.isoformat()
        except ValueError:
            dt_str = tk
            
        c_list.append(close_val)
        h_list.append(high_val)
        l_list.append(low_val)
        o_list.append(open_val)
        v_list.append(volume_val)
        t_list.append(dt_str)
        
        history_ticks.append({
            "symbol": symbol_upper,
            "price": close_val,
            "close": close_val,
            "volume": volume_val,
            "open": open_val,
            "high": high_val,
            "low": low_val,
            "timestamp": dt_str,
            "time": dt_str,
            "is_anomaly": False,
            "anomaly_score": 0.05
        })

    # 3. Compute Live Quote Metrics
    latest_price = c_list[-1]
    latest_open = o_list[-1]
    latest_high = h_list[-1]
    latest_low = l_list[-1]
    latest_volume = v_list[-1]
    
    # Baseline for price change is the first candle close in our 50-candle series
    baseline_price = c_list[0]
    change_percent = 0.0
    if baseline_price > 0:
        change_percent = ((latest_price - baseline_price) / baseline_price) * 100

    # Run Isolation Forest Anomaly Detector on the series
    anomaly_score = 0.08
    severity = "INFO"
    explanation = "Normal trading parameters verified."
    
    if len(history_ticks) >= 5:
        anomaly_score, severity, explanation = detector.detect(history_ticks)
        history_ticks[-1]["anomaly_score"] = anomaly_score
        if severity == "CRITICAL":
            history_ticks[-1]["is_anomaly"] = True

    # 4. Parse News Sentiment Feeds
    feeds_mapped = []
    total_sentiment_score = 0.0
    
    for item in news:
        title = item.get("title", "")
        summary = item.get("summary", "")
        # Alpha Vantage provides sentiment score between -1.0 (bearish) and 1.0 (bullish)
        score = float(item.get("overall_sentiment_score", 0.0))
        total_sentiment_score += score
        
        sentiment_tag = "neutral"
        if score > 0.15:
            sentiment_tag = "positive"
        elif score < -0.15:
            sentiment_tag = "negative"
            
        time_pub = item.get("time_published", "")
        dt_str = datetime.datetime.now().isoformat()
        if len(time_pub) >= 15:
            try:
                dt_str = datetime.datetime.strptime(time_pub[:15], "%Y%m%dT%H%M%S").isoformat()
            except Exception:
                pass
                
        feeds_mapped.append({
            "symbol": symbol_upper,
            "title": title,
            "content": summary,
            "sentiment": sentiment_tag,
            "score": round(score, 2),
            "source": item.get("source", "News"),
            "timestamp": dt_str
        })
        
    avg_sentiment = 0.0
    if news:
        avg_sentiment = total_sentiment_score / len(news)
        
    sentiment_label = "neutral"
    if avg_sentiment > 0.15:
        sentiment_label = "positive"
    elif avg_sentiment < -0.15:
        sentiment_label = "negative"

    # Run Random Forest Pump & Dump Predictor
    mentions_velocity = 1.0
    if len(history_ticks) >= 5:
        mean_vol = sum(h["volume"] for h in history_ticks[:-1]) / (len(history_ticks) - 1)
        if mean_vol > 0 and history_ticks[-1]["volume"] / mean_vol >= 4.0:
            mentions_velocity = min(15.0, round(history_ticks[-1]["volume"] / mean_vol, 1))

    probability, confidence, peak_time = predictor.predict(history_ticks, avg_sentiment, mentions_velocity)

    # Get company name from static mappings, or query DB, or default
    company_name = COMPANY_NAMES.get(symbol_upper)
    if not company_name:
        db_stock = db.query(models.Stock).filter(models.Stock.symbol == symbol_upper).first()
        company_name = db_stock.company_name if db_stock else f"{symbol_upper} Corp."

    # 5. Compile Live Alerts
    alerts = []
    if severity in ["CRITICAL", "WARNING"]:
        alerts.append({
            "id": 999,
            "symbol": symbol_upper,
            "title": f"LIVE_{severity}_ANOMALY",
            "severity": severity,
            "risk_score": anomaly_score,
            "explanation": f"Alpha Vantage intraday anomaly: {explanation}",
            "confidence": confidence,
            "estimated_impact_inr": round(latest_price * mentions_velocity * 100, 2),
            "timestamp": datetime.datetime.now().isoformat()
        })

    # Calculate SHAP factors list
    volume_surge_ratio = latest_volume / (sum(h["volume"] for h in history_ticks[:-1]) / (len(history_ticks) - 1)) if len(history_ticks) > 1 else 1.0
    
    factors = [
        {"factor": "Volume Deviation", "impact": f"{volume_surge_ratio:.1f}x surge", "description": "Abnormal volume spike registered relative to historical intraday candles."},
        {"factor": "Price Momentum", "impact": f"{change_percent:+.2f}%", "description": "Price acceleration over current evaluation window."},
        {"factor": "Sentiment Score", "impact": f"{avg_sentiment:+.2f}", "description": "Consolidated news/social sentiment alignment."},
    ]

    return {
        "stock": {
            "symbol": symbol_upper,
            "company_name": company_name,
            "current_price": latest_price,
            "change_percent": change_percent,
            "volume": latest_volume,
            "high": latest_high,
            "low": latest_low,
            "open": latest_open,
            "previous_close": baseline_price
        },
        "history": history_ticks,
        "prediction": {
            "symbol": symbol_upper,
            "anomaly_score": anomaly_score,
            "anomaly_severity": severity,
            "anomaly_explanation": explanation,
            "prediction_probability": probability,
            "prediction_confidence": confidence,
            "estimated_peak_time": peak_time,
            "predicted_price": round(latest_price * (1 + min(0.25, max(0.0, probability * 0.18 + momentum * 0.25 + mentions_velocity / 40))), 2),
            "mismatch_detected": analyzer.detect_mismatch(change_percent, avg_sentiment),
            "top_factors": factors
        },
        "alerts": alerts,
        "sentiment": {
            "score": round(avg_sentiment, 2),
            "label": sentiment_label,
            "feeds": feeds_mapped
        }
    }

@router.get("/prediction/{symbol}")
def get_live_prediction(symbol: str, db: Session = Depends(get_db)):
    """
    Returns only the live predictive intelligence payload for the requested symbol.
    """
    symbol_upper = symbol.upper().strip()

    try:
        data = get_alpha_intraday(symbol_upper)
        news = get_alpha_news(symbol_upper)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Live market prediction failed: {str(e)}"
        )

    time_series = data.get("Time Series (1min)", {})
    time_keys = sorted(time_series.keys())[-50:]
    if not time_keys:
        raise HTTPException(status_code=400, detail="Alpha Vantage returned empty intraday series.")

    history_ticks = []
    c_list = []
    o_list = []
    v_list = []
    for tk in time_keys:
        candle = time_series[tk]
        close_val = float(candle["4. close"])
        open_val = float(candle["1. open"])
        volume_val = int(candle["5. volume"])

        try:
            dt = datetime.datetime.strptime(tk, "%Y-%m-%d %H:%M:%S")
            dt_str = dt.isoformat()
        except ValueError:
            dt_str = tk

        c_list.append(close_val)
        o_list.append(open_val)
        v_list.append(volume_val)
        history_ticks.append({
            "symbol": symbol_upper,
            "price": close_val,
            "volume": volume_val,
            "timestamp": dt_str,
            "is_anomaly": False,
            "anomaly_score": 0.0
        })

    latest_price = c_list[-1]
    baseline_price = c_list[0] if c_list else latest_price
    change_percent = ((latest_price - baseline_price) / baseline_price * 100) if baseline_price > 0 else 0.0
    momentum = (latest_price - c_list[-5]) / c_list[-5] if len(c_list) >= 5 and c_list[-5] != 0 else 0.0

    anomaly_score, severity, explanation = detector.detect(history_ticks)
    history_ticks[-1]["anomaly_score"] = anomaly_score
    if severity == "CRITICAL":
        history_ticks[-1]["is_anomaly"] = True

    feeds_mapped = []
    total_sentiment_score = 0.0
    for item in news:
        score = float(item.get("overall_sentiment_score", 0.0))
        total_sentiment_score += score
        sentiment_tag = "neutral"
        if score > 0.15:
            sentiment_tag = "positive"
        elif score < -0.15:
            sentiment_tag = "negative"

        time_pub = item.get("time_published", "")
        dt_str = datetime.datetime.now().isoformat()
        if len(time_pub) >= 15:
            try:
                dt_str = datetime.datetime.strptime(time_pub[:15], "%Y%m%dT%H%M%S").isoformat()
            except Exception:
                pass

        feeds_mapped.append({
            "symbol": symbol_upper,
            "title": item.get("title", ""),
            "content": item.get("summary", ""),
            "sentiment": sentiment_tag,
            "score": round(score, 2),
            "source": item.get("source", "News"),
            "timestamp": dt_str
        })

    avg_sentiment = round(total_sentiment_score / len(news), 2) if news else 0.0
    sentiment_label = "positive" if avg_sentiment > 0.15 else ("negative" if avg_sentiment < -0.15 else "neutral")

    mentions_velocity = 1.0
    if len(history_ticks) >= 5:
        mean_vol = sum(h["volume"] for h in history_ticks[:-1]) / max(1, len(history_ticks) - 1)
        if mean_vol > 0:
            mentions_velocity = min(15.0, round(history_ticks[-1]["volume"] / mean_vol, 1))

    probability, confidence, peak_time = predictor.predict(history_ticks, avg_sentiment, mentions_velocity)
    predicted_price = round(latest_price * (1 + min(0.25, max(0.0, probability * 0.18 + (latest_price - baseline_price) / max(1.0, baseline_price) * 0.25 + mentions_velocity / 40))), 2)

    factors = [
        {"factor": "Volume Deviation", "impact": f"{(history_ticks[-1]["volume"] / max(1, sum(h["volume"] for h in history_ticks[:-1]) / max(1, len(history_ticks) - 1))):.1f}x surge", "description": "Abnormal volume spike relative to current intraday baseline."},
        {"factor": "Price Momentum", "impact": f"{change_percent:+.2f}%", "description": "Real-time price acceleration over the evaluated window."},
        {"factor": "Sentiment Score", "impact": f"{avg_sentiment:+.2f}", "description": "Consolidated news sentiment on the live ticker."}
    ]

    return {
        "symbol": symbol_upper,
        "anomaly_score": anomaly_score,
        "anomaly_severity": severity,
        "anomaly_explanation": explanation,
        "prediction_probability": probability,
        "prediction_confidence": confidence,
        "estimated_peak_time": peak_time,
        "predicted_price": predicted_price,
        "mismatch_detected": analyzer.detect_mismatch(change_percent, avg_sentiment),
        "top_factors": factors
    }
