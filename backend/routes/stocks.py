from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("")
def get_stocks(db: Session = Depends(get_db)):
    """
    Returns list of all active stocks under surveillance.
    """
    return db.query(models.Stock).all()

@router.get("/{symbol}")
def get_stock_details(symbol: str, db: Session = Depends(get_db)):
    """
    Returns details and historical ticks for charting.
    """
    stock = db.query(models.Stock).filter(models.Stock.symbol == symbol).first()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock symbol {symbol} not found in tracking list.")

    # Retrieve latest 50 history ticks sorted chronologically
    history = db.query(models.StockPriceHistory)\
        .filter(models.StockPriceHistory.symbol == symbol)\
        .order_by(models.StockPriceHistory.timestamp.desc())\
        .limit(50)\
        .all()
    
    # Reverse so the frontend receives them in oldest -> newest chronological order
    history.reverse()

    return {
        "stock": stock,
        "history": history
    }
