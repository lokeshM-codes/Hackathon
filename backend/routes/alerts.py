from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter()

@router.get("")
def get_alerts(db: Session = Depends(get_db)):
    """
    Lists all triggered market manipulation/insider trading alerts, sorted by timestamp descending.
    """
    return db.query(models.Alert).order_by(models.Alert.timestamp.desc()).all()

@router.get("/{alert_id}")
def get_alert_by_id(alert_id: int, db: Session = Depends(get_db)):
    """
    Retrieves detailed breakdown of a single alert.
    """
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert with ID {alert_id} not found.")
    return alert
