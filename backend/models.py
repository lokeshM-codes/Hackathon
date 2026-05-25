from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base

class Stock(Base):
    __tablename__ = "stocks"

    symbol = Column(String, primary_key=True, index=True)
    company_name = Column(String)
    base_price = Column(Float)
    current_price = Column(Float)
    volume = Column(Integer)
    change_percent = Column(Float)

class StockPriceHistory(Base):
    __tablename__ = "stock_price_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    symbol = Column(String, index=True)
    price = Column(Float)
    volume = Column(Integer)
    timestamp = Column(DateTime(timezone=True), default=func.now())
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)
    is_prediction = Column(Boolean, default=False)
    predicted_price = Column(Float, default=0.0)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    symbol = Column(String, index=True)
    title = Column(String)
    severity = Column(String)  # INFO, WARNING, CRITICAL
    risk_score = Column(Float)
    timestamp = Column(DateTime(timezone=True), default=func.now())
    explanation = Column(String)
    confidence = Column(Float)
    estimated_impact_inr = Column(Float)

class SentimentFeed(Base):
    __tablename__ = "sentiment_feed"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    symbol = Column(String, index=True)
    title = Column(String)
    content = Column(String)
    sentiment = Column(String)  # positive, negative, neutral
    score = Column(Float)
    source = Column(String)  # news, twitter, reddit, etc.
    timestamp = Column(DateTime(timezone=True), default=func.now())

class SystemState(Base):
    __tablename__ = "system_state"

    id = Column(Integer, primary_key=True, default=1)
    current_demo_step = Column(Integer, default=0)
    trades_analyzed = Column(Integer, default=124050)
    latency_ms = Column(Float, default=12.4)
    throughput_tps = Column(Float, default=450.0)
    uptime_seconds = Column(Integer, default=86400)
    model_inference_ms = Column(Float, default=4.2)
