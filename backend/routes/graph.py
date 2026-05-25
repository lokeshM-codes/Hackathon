from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from insider_graph import get_analyzed_insider_graph

router = APIRouter()

@router.get("")
def get_graph(symbol: str = "YES_BANK", is_live: bool = False, db: Session = Depends(get_db)):
    """
    Returns insider network nodes and links.
    If the demo mode step is >= 8 or is_live is active, injects suspicious operator structures coordinating trades.
    """
    base_graph = get_analyzed_insider_graph()
    
    state = db.query(models.SystemState).filter(models.SystemState.id == 1).first()
    demo_step = state.current_demo_step if state else 0
    
    if is_live or demo_step >= 8:
        # Determine symbol
        target_symbol = symbol.upper().strip()
        if not is_live:
            target_symbol = "IRFC_PENNY"
            
        # Construct suspicious nodes targeting the railway stock or live active stock
        extra_nodes = [
            {"id": f"{target_symbol}_Corp", "label": target_symbol, "type": "company", "risk": "medium", "details": "Listed Equity under surveillance"},
            {"id": "Operator_X", "label": "Mauritius Alpha Ltd", "type": "shell", "risk": "critical", "details": "Operator Shell Entity"},
            {"id": "Broker_Gamma", "label": "Apex Securities", "type": "broker", "risk": "critical", "details": "Clearing channel for Operator X"},
            {"id": "Trader_P1", "label": "Rajesh Verma (Trader)", "type": "trader", "risk": "critical", "details": "Synchronized trade orders, linked account"},
            {"id": "Trader_P2", "label": "Sanjay Mehta (Trader)", "type": "trader", "risk": "critical", "details": "Linked IP Address with Rajesh Verma"},
        ]
        extra_links = [
            {"source": "Trader_P1", "target": "Operator_X", "value": 6, "relationship": "Linked IP Address Match"},
            {"source": "Trader_P2", "target": "Operator_X", "value": 6, "relationship": "Synchronized Trades"},
            {"source": "Operator_X", "target": "Broker_Gamma", "value": 7, "relationship": "Clearing Channel"},
            {"source": "Broker_Gamma", "target": f"{target_symbol}_Corp", "value": 9, "relationship": "Cornering Floating Capital"}
        ]
        
        # Merge nodes preventing duplicates
        nodes_map = {n["id"]: n for n in base_graph["nodes"]}
        for node in extra_nodes:
            nodes_map[node["id"]] = node
            
        base_graph["nodes"] = list(nodes_map.values())
        base_graph["links"] = base_graph["links"] + extra_links
        base_graph["flagged_entities"].extend(["Operator_X", "Trader_P1", "Trader_P2"])
        base_graph["cluster_risk_score"] = 0.94 if is_live else 0.96
        
    return base_graph
