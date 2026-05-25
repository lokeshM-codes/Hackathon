import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, ShieldAlert, Cpu, Layers, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

export default function InsiderGraph({ graphData, demoStep = 0 }) {
  const containerRef = useRef();
  const graphRef = useRef();
  
  const [dimensions, setDimensions] = useState({ width: 400, height: 260 });
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // Click node highlight lists
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const nodes = graphData.nodes || [];
  const links = graphData.links || [];
  const clusterRisk = graphData.cluster_risk_score || 0.0;
  const flaggedCount = graphData.flagged_entities?.length || 0;

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width: Math.max(100, width), height: Math.max(100, height) });
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-110);
      graphRef.current.d3Force('link').distance(75);
      graphRef.current.d3Force('center').x(dimensions.width / 2).y(dimensions.height / 2);
      
      const timer = setTimeout(() => {
        graphRef.current.zoomToFit(120, 15);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [graphData, dimensions.width, dimensions.height]);

  const handleNodeClick = (node) => {
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(null);
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    } else {
      setSelectedNode(node);
      const newHighlightNodes = new Set([node.id]);
      const newHighlightLinks = new Set();
      
      links.forEach(link => {
        const sId = typeof link.source === 'object' ? link.source.id : link.source;
        const tId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (sId === node.id) {
          newHighlightNodes.add(tId);
          newHighlightLinks.add(link);
        } else if (tId === node.id) {
          newHighlightNodes.add(sId);
          newHighlightLinks.add(link);
        }
      });
      
      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
    }
  };

  const handleBackgroundClick = () => {
    setSelectedNode(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  };

  // Node Renderer
  const handleNodePaint = (node, ctx, globalScale) => {
    const isHovered = hoveredNode && hoveredNode.id === node.id;
    const isSelected = selectedNode && selectedNode.id === node.id;
    const isFaded = selectedNode && !highlightNodes.has(node.id);
    
    ctx.globalAlpha = isFaded ? 0.15 : 1.0;
    
    // Nodes size configurations: company is slightly larger, traders are compact
    const radius = node.type === 'company' ? 7.5 : (node.type === 'shell' ? 6.5 : 5.0);
    const label = node.label || node.id;
    
    // Double Concentric Pulsing Rings for high risk/critical nodes
    if (!isFaded && (node.risk === 'critical' || node.risk === 'medium')) {
      const pulsePeriod = 1600; // ms
      const t = Date.now() % pulsePeriod;
      
      // Pulse Ring 1
      const scale1 = 1.1 + 0.4 * (t / pulsePeriod);
      const opacity1 = 0.6 * (1 - (t / pulsePeriod));
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius * scale1, 0, 2 * Math.PI);
      ctx.strokeStyle = node.risk === 'critical' 
        ? `rgba(255, 68, 68, ${opacity1})` 
        : `rgba(255, 184, 0, ${opacity1})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Pulse Ring 2 (Offset by 50% period phase)
      const t2 = (t + pulsePeriod / 2) % pulsePeriod;
      const scale2 = 1.1 + 0.4 * (t2 / pulsePeriod);
      const opacity2 = 0.6 * (1 - (t2 / pulsePeriod));
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius * scale2, 0, 2 * Math.PI);
      ctx.strokeStyle = node.risk === 'critical' 
        ? `rgba(255, 68, 68, ${opacity2})` 
        : `rgba(255, 184, 0, ${opacity2})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    
    // Risk coloring: Red=Critical, Orange=Warning, Blue=Brokers/Corps, Green=Verified traders
    if (node.risk === 'critical') {
      ctx.fillStyle = '#FF4444';
    } else if (node.risk === 'medium') {
      ctx.fillStyle = '#FFB800';
    } else if (node.type === 'company' || node.type === 'broker') {
      ctx.fillStyle = '#3B82F6';
    } else {
      ctx.fillStyle = '#00FF88';
    }
    
    ctx.fill();
    ctx.lineWidth = isSelected ? 2.0 : 1.2;
    ctx.strokeStyle = isSelected ? '#00F5FF' : '#05070f';
    ctx.stroke();

    // Node labels (render only if zoomed in or hovered)
    if (globalScale > 0.85 || isHovered || isSelected) {
      const fontSize = Math.max(5, 8.5 / globalScale);
      ctx.font = isSelected || isHovered ? `bold ${fontSize}px "JetBrains Mono"` : `${fontSize}px "JetBrains Mono"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isSelected || isHovered ? '#00F5FF' : '#E2E8F0';
      ctx.fillText(label, node.x, node.y + radius + 3.5);
    }
    
    ctx.globalAlpha = 1.0;
  };

  const handleLinkColor = (link) => {
    const isFaded = selectedNode && !highlightLinks.has(link);
    if (isFaded) return 'rgba(38, 55, 87, 0.05)';

    const sRisk = link.source.risk || '';
    const tRisk = link.target.risk || '';
    if (sRisk === 'critical' || tRisk === 'critical' || 
        link.source.id === 'Operator_X' || link.target.id === 'Operator_X') {
      return 'rgba(255, 68, 68, 0.75)';
    }
    return 'rgba(51, 65, 85, 0.5)';
  };

  // Convert technical relationship words to descriptive edge labels
  const getCleanRelationshipLabel = (rel) => {
    if (!rel) return '';
    const r = rel.toLowerCase();
    if (r.includes('ip address') || r.includes('shared ip')) return 'Shared IP';
    if (r.includes('synchronized') || r.includes('coordinated')) return 'Synchronized Orders';
    if (r.includes('clearing') || r.includes('transfer')) return 'Circular Funds';
    if (r.includes('cornering') || r.includes('volume') || r.includes('transaction')) return 'Repeated Trades';
    if (r.includes('beneficiary') || r.includes('owner') || r.includes('insider')) return 'Insider Account';
    return rel;
  };

  // Generate dynamic incident logs based on active state and demoStep
  const getTimelineEvents = () => {
    const events = [];
    if (demoStep === 0) {
      // Yes bank baseline or standard
      events.push({ time: "14:20", text: "Derivatives loop open", status: "info" });
      events.push({ time: "14:24", text: "Volume spike 50x logged", status: "warn" });
      events.push({ time: "14:27", text: "Divergence alert triggered", status: "critical" });
      events.push({ time: "14:30", text: "Centrality audit completed", status: "success" });
    } else {
      // IRFC Penny demo sequence timeline
      if (demoStep >= 1) events.push({ time: "14:02:11", text: "Surveillance baseline established", status: "info" });
      if (demoStep >= 2) events.push({ time: "14:02:14", text: "Volume starts 4x gradual surge", status: "info" });
      if (demoStep >= 3) events.push({ time: "14:02:18", text: "Price acceleration (+19%)", status: "warn" });
      if (demoStep >= 4) events.push({ time: "14:02:22", text: "Isolation Forest anomaly flag", status: "warn" });
      if (demoStep >= 6) events.push({ time: "14:02:26", text: "Sentiment turns negative (-0.89)", status: "warn" });
      if (demoStep >= 8) events.push({ time: "14:02:30", text: "Mauritius Alpha Ltd shell mapped", status: "critical" });
      if (demoStep >= 10) events.push({ time: "14:02:35", text: "Random Forest flags Manipulation", status: "critical" });
      if (demoStep >= 12) events.push({ time: "14:02:40", text: "SURVEILLANCE SHIELD ACTIVE", status: "success" });
    }
    // Return sorted newest first
    return events.slice().reverse().slice(0, 4); 
  };

  const estExposure = clusterRisk >= 0.85 ? "₹42.0 Cr" : (clusterRisk >= 0.70 ? "₹12.5 Cr" : "₹1.2 Cr");
  const timelineEvents = getTimelineEvents();

  return (
    <div className="terminal-card rounded-lg p-4 h-[410px] flex flex-col justify-between overflow-hidden relative">
      <div className="scanline-overlay" />

      {/* Header section with subtitle */}
      <div className="flex items-center justify-between border-b border-borderblue pb-2.5 mb-2.5 z-10">
        <div>
          <h2 className="heading-syne font-extrabold text-[10.5px] tracking-widest text-slate-100 uppercase flex items-center gap-1.5">
            <Network className="w-4 h-4 text-cyanneon animate-pulse" />
            Surveillance Network Topology
          </h2>
          <p className="text-[8.5px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider font-bold">
            AI-detected suspicious relationship graph
          </p>
        </div>
        
        {clusterRisk >= 0.85 ? (
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/40 px-2 py-0.5 rounded text-redalert text-[8px] font-black animate-pulse uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>AI Suspicious Cluster Detected</span>
          </div>
        ) : (
          <span className="text-[8px] font-mono bg-borderblue px-2 py-0.5 rounded text-indigo-300 font-extrabold tracking-wider uppercase">
            Surveillance Shield
          </span>
        )}
      </div>

      {/* Symmetrical 2-Column Split: Graph Canvas (Left) and Incident Panel (Right) */}
      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* LEFT COLUMN: Responsive Canvas viewport */}
        <div ref={containerRef} className="flex-grow bg-[#04060b] border border-borderblue/35 rounded relative overflow-hidden bg-grid-pattern">
          {/* Moving background grid */}
          <div className="absolute inset-0 bg-[#04060b] opacity-80" />
          <div className="absolute inset-0 bg-scanlines opacity-5 pointer-events-none" />

          {nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500 z-10 relative">
              Loading relation topologies...
            </div>
          ) : (
            <ForceGraph2D
              ref={graphRef}
              graphData={{ nodes, links }}
              width={dimensions.width}
              height={dimensions.height}
              nodeCanvasObject={handleNodePaint}
              nodePointerAreaPaint={(node, color, ctx) => {
                const radius = node.type === 'company' ? 7.5 : (node.type === 'shell' ? 6.5 : 5.0);
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
              }}
              linkColor={handleLinkColor}
              linkWidth={(link) => {
                const isSelected = selectedNode && highlightLinks.has(link);
                return isSelected ? 2.5 : 1.2;
              }}
              // Flow Direction Arrow Settings
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={0.5}
              // Flow Particles simulating order/funds flow
              linkDirectionalParticles={(link) => {
                const isFaded = selectedNode && !highlightLinks.has(link);
                if (isFaded) return 0;
                const sRisk = link.source.risk || '';
                const tRisk = link.target.risk || '';
                return (sRisk === 'critical' || tRisk === 'critical') ? 5 : 2;
              }}
              linkDirectionalParticleWidth={(link) => {
                const sRisk = link.source.risk || '';
                const tRisk = link.target.risk || '';
                return (sRisk === 'critical' || tRisk === 'critical') ? 2.5 : 1.5;
              }}
              linkDirectionalParticleSpeed={(link) => {
                const baseSpeed = 0.012;
                const sRisk = link.source.risk || '';
                const tRisk = link.target.risk || '';
                return ((sRisk === 'critical' || tRisk === 'critical') ? baseSpeed * 1.8 : baseSpeed) + (link.value * 0.001);
              }}
              linkDirectionalParticleColor={(link) => {
                const sRisk = link.source.risk || '';
                const tRisk = link.target.risk || '';
                return (sRisk === 'critical' || tRisk === 'critical') ? '#FF4444' : '#00F5FF';
              }}
              // Custom Canvas Link Overlay for edge labels
              linkCanvasObject={(link, ctx, globalScale) => {
                if (globalScale < 1.3) return; // Only draw labels when zoomed in enough to prevent overlapping clutter
                const start = link.source;
                const end = link.target;
                if (typeof start !== 'object' || typeof end !== 'object') return;

                const rawRel = link.relationship || 'Coordinated Orders';
                const label = getCleanRelationshipLabel(rawRel);

                const textX = (start.x + end.x) / 2;
                const textY = (start.y + end.y) / 2;

                const fontSize = 3.5 / globalScale;
                ctx.font = `${fontSize}px "JetBrains Mono"`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const textWidth = ctx.measureText(label).width;
                const badgePaddingX = 2 / globalScale;
                const badgePaddingY = 1.2 / globalScale;
                
                ctx.fillStyle = '#060a16';
                ctx.fillRect(
                  textX - textWidth / 2 - badgePaddingX,
                  textY - fontSize / 2 - badgePaddingY,
                  textWidth + badgePaddingX * 2,
                  fontSize + badgePaddingY * 2
                );

                ctx.strokeStyle = (link.source.risk === 'critical' || link.target.risk === 'critical') 
                  ? 'rgba(255, 68, 68, 0.4)' 
                  : 'rgba(30, 42, 58, 0.6)';
                ctx.lineWidth = 0.5 / globalScale;
                ctx.strokeRect(
                  textX - textWidth / 2 - badgePaddingX,
                  textY - fontSize / 2 - badgePaddingY,
                  textWidth + badgePaddingX * 2,
                  fontSize + badgePaddingY * 2
                );

                ctx.fillStyle = (link.source.risk === 'critical' || link.target.risk === 'critical') 
                  ? '#FF4444' 
                  : '#A5B4FC';
                ctx.fillText(label, textX, textY);
              }}
              linkCanvasObjectMode={() => 'after'}
              cooldownTicks={120}
              onNodeClick={handleNodeClick}
              onBackgroundClick={handleBackgroundClick}
              onNodeHover={(node) => setHoveredNode(node)}
              enableZoomInteraction={true}
              enablePanInteraction={true}
            />
          )}

          {/* Hover Node Tooltip Card - Premium HUD styling */}
          {hoveredNode && (
            <div className="absolute top-2 left-2 bg-[#060a16]/95 border border-[#1e2d4a]/90 rounded-md p-3 w-52 pointer-events-none z-20 font-mono text-[9px] shadow-2xl backdrop-blur-md">
              <div className="border-b border-[#1e2d4a]/85 pb-1.5 mb-2 flex items-center justify-between">
                <span className="font-black text-slate-100 uppercase tracking-wider text-[9.5px] truncate max-w-[120px]">
                  {hoveredNode.label}
                </span>
                <span className={`px-1.5 py-0.5 rounded-[3px] text-[7.5px] font-extrabold uppercase tracking-wide border ${
                  hoveredNode.risk === 'critical' 
                    ? 'bg-red-500/10 text-redalert border-redalert/30' 
                    : hoveredNode.risk === 'medium'
                      ? 'bg-amberwarn/10 text-amberwarn border-amberwarn/30'
                      : 'bg-greenok/10 text-greenok border-greenok/30'
                }`}>
                  {hoveredNode.risk === 'critical' ? 'CRITICAL' : hoveredNode.risk === 'medium' ? 'WARNING' : 'SECURE'}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>ENTITY ROLE:</span>
                  <span className="text-white font-extrabold uppercase">{hoveredNode.type}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>RISK SCORE:</span>
                  <span className={`font-black ${hoveredNode.risk === 'critical' ? 'text-redalert' : 'text-amberwarn'}`}>
                    {(hoveredNode.centrality * 200).toFixed(0)}/100
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TRADE VOL:</span>
                  <span className="text-white font-extrabold">₹{(hoveredNode.centrality * 10).toFixed(1)} Cr</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>LINKED ACCOUNTS:</span>
                  <span className="text-cyanneon font-extrabold">{(hoveredNode.centrality * 8).toFixed(0)}</span>
                </div>
                {hoveredNode.details && (
                  <div className="border-t border-[#1e2d4a]/45 pt-1.5 mt-1.5 text-[8.5px] text-slate-400 leading-normal italic">
                    "{hoveredNode.details}"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Color Legend HUD overlay */}
          <div className="absolute bottom-2 left-2 bg-[#05070f]/90 border border-borderblue/90 rounded px-2 py-1.5 pointer-events-none z-10 font-mono text-[7px] shadow-md flex gap-2.5 items-center">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-redalert" />
              <span className="text-slate-400 font-bold">Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFB800]" />
              <span className="text-slate-400 font-bold">Warning</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-slate-400 font-bold">Broker</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-greenok" />
              <span className="text-slate-400 font-bold">Verified</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Incident Summary & Dynamic Activity Timeline */}
        <div className="w-56 bg-[#05070f]/40 border border-borderblue/55 rounded p-3 flex flex-col justify-between font-mono text-[9px] relative flex-shrink-0">
          
          {/* Summary Panel details */}
          <div>
            <div className="flex items-center gap-1 text-slate-100 font-extrabold border-b border-borderblue/40 pb-1.5 mb-2.5 uppercase tracking-wide">
              <Layers className="w-3.5 h-3.5 text-cyanneon" />
              <span>Incident Summary</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="text-redalert font-extrabold uppercase leading-snug">
                Pump-and-dump cluster flagged
              </div>
              <div className="flex justify-between text-slate-400">
                <span>exposure:</span>
                <span className="text-white font-black">{estExposure}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>connected nodes:</span>
                <span className="text-white font-bold">{flaggedCount} entities</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>confidence index:</span>
                <span className="text-greenok font-black">{(clusterRisk * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Chronological live timeline */}
          <div className="border-t border-borderblue/40 pt-2.5 mt-2 flex-1 flex flex-col justify-end">
            <div className="flex items-center gap-1 text-slate-300 font-bold uppercase tracking-wider mb-2">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Surveillance Log</span>
            </div>
            
            <div className="space-y-2 max-h-[130px] overflow-hidden">
              {timelineEvents.map((ev, i) => (
                <div key={i} className="flex gap-2 text-[8px] items-start border-l-2 border-borderblue/40 pl-1.5 ml-1">
                  <span className="text-indigo-300 font-bold">{ev.time}</span>
                  <span className={`truncate ${
                    ev.status === 'critical' 
                      ? 'text-redalert font-bold' 
                      : ev.status === 'success'
                        ? 'text-greenok font-bold'
                        : ev.status === 'warn'
                          ? 'text-amberwarn'
                          : 'text-slate-400'
                  }`}>
                    {ev.text}
                  </span>
                </div>
              ))}
              {timelineEvents.length === 0 && (
                <div className="text-slate-500 italic text-[7.5px]">Awaiting system signals...</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Explanation text below the graph */}
      <div className="text-[8.5px] text-slate-400 font-mono mt-2.5 border-t border-borderblue/35 pt-2.5 text-center leading-normal">
        * The AI identifies hidden trading relationships and coordinated activity between market participants. Click nodes to isolate connected flows.
      </div>
    </div>
  );
}
