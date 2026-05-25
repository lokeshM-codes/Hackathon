import networkx as nx
from mock_data import MOCK_INSIDER_GRAPH

def get_analyzed_insider_graph():
    """
    Constructs a NetworkX graph from mock insider data, performs graph analyses,
    detects centralities/clusters, and returns structured JSON for react-force-graph.
    """
    G = nx.Graph()
    
    # Populate NetworkX Nodes & Edges
    for node in MOCK_INSIDER_GRAPH["nodes"]:
        G.add_node(node["id"], **node)
        
    for link in MOCK_INSIDER_GRAPH["links"]:
        G.add_edge(link["source"], link["target"], weight=link["value"], relationship=link["relationship"])
        
    # Run NetworkX analyses
    degree_centrality = nx.degree_centrality(G)
    
    # Find cliques or highly connected components
    cliques = list(nx.find_cliques(G))
    
    # Format nodes with enriched analysis metadata
    analyzed_nodes = []
    flagged_entities = []
    
    for node_id, attrs in G.nodes(data=True):
        centrality = degree_centrality.get(node_id, 0.0)
        risk = attrs.get("risk", "low")
        
        # Enrich risk classifications based on centrality
        if attrs.get("type") == "shell":
            risk = "critical"
        elif attrs.get("type") == "trader" and centrality >= 0.3:
            risk = "critical"
            
        analyzed_nodes.append({
            "id": node_id,
            "label": attrs.get("label", node_id),
            "type": attrs.get("type", "trader"),
            "risk": risk,
            "details": attrs.get("details", ""),
            "centrality": round(centrality, 3)
        })
        
        if risk in ["critical", "high"]:
            flagged_entities.append(node_id)
            
    # Calculate a composite Cluster Risk Score
    # Formula factors in shell counts, average degree centrality of the network, and flagged nodes ratio
    shells = len([n for n in analyzed_nodes if n["type"] == "shell"])
    avg_centrality = sum(degree_centrality.values()) / len(degree_centrality) if degree_centrality else 0
    cluster_risk_score = round(min(0.99, 0.4 + (shells * 0.15) + (avg_centrality * 0.8)), 2)
    
    return {
        "nodes": analyzed_nodes,
        "links": MOCK_INSIDER_GRAPH["links"],
        "flagged_entities": flagged_entities,
        "cluster_risk_score": cluster_risk_score,
        "clique_count": len(cliques)
    }
