import threading
import time
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, SessionLocal, get_db
import models
from mock_data import seed_db
from utils.simulator import tick_market, execute_demo_step

# Initialize database schema
models.Base.metadata.create_all(bind=engine)

# Seed database with initial datasets
db = SessionLocal()
try:
    seed_db(db)
finally:
    db.close()

# Start background simulator thread to tick prices/demo steps every 3 seconds
def start_background_simulator():
    def run_sim():
        while True:
            session = SessionLocal()
            try:
                tick_market(session)
            except Exception as e:
                print(f"Market simulator run error: {e}")
            finally:
                session.close()
            time.sleep(3.0)

    thread = threading.Thread(target=run_sim, daemon=True)
    thread.start()

start_background_simulator()

# Initialize FastAPI App
app = FastAPI(
    title="MarketGuard AI Backend API",
    description="Real-time SEBI-grade AI Financial Surveillance Microservice",
    version="1.0.0"
)

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include sub-routers
from routes import stocks, alerts, analytics, graph, prediction, livestock

app.include_router(stocks.router, prefix="/api/stocks", tags=["Stocks"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(graph.router, prefix="/api/graph", tags=["Insider Graph"])
app.include_router(prediction.router, prefix="/api/prediction", tags=["ML Prediction"])
app.include_router(analytics.router, prefix="/api", tags=["System Analytics"])
app.include_router(livestock.router, prefix="/api/live-stock", tags=["Live Stock"])

@app.post("/api/trigger-demo")
def trigger_demo(db: Session = Depends(get_db)):
    """
    Triggers the 12-step cinematic pump & dump scenario on IRFC_PENNY.
    Clears any prior penny stock histories/alerts and restarts step sequence.
    """
    state = db.query(models.SystemState).filter(models.SystemState.id == 1).first()
    if not state:
        state = models.SystemState(id=1, current_demo_step=0)
        db.add(state)
        
    # Clear any previous alerts/histories for IRFC_PENNY
    db.query(models.StockPriceHistory).filter(models.StockPriceHistory.symbol == "IRFC_PENNY").delete()
    db.query(models.Alert).filter(models.Alert.symbol == "IRFC_PENNY").delete()
    db.query(models.SentimentFeed).filter(models.SentimentFeed.symbol == "IRFC_PENNY").delete()
    
    # Start sequence
    state.current_demo_step = 1
    db.commit()
    
    # Execute the first step immediately
    execute_demo_step(db, 1, state)
    
    return {
        "status": "success", 
        "message": "Pump & Dump demo sequence initiated on IRFC_PENNY.",
        "current_step": 1
    }

@app.post("/api/reset-demo")
def reset_demo(db: Session = Depends(get_db)):
    """
    Resets the database entirely to the fresh seeder state.
    """
    # Delete all data
    db.query(models.StockPriceHistory).delete()
    db.query(models.Alert).delete()
    db.query(models.SentimentFeed).delete()
    db.query(models.Stock).delete()
    db.query(models.SystemState).delete()
    db.commit()

    # Re-seed
    seed_db(db)
    
    return {
        "status": "success", 
        "message": "System database reset and seeded with initial mock data."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
