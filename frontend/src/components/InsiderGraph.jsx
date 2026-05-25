import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, ShieldAlert, Cpu } from 'lucide-react';

export default function InsiderGraph({ graphData }) {
  const graphRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = graphData.nodes || [];
  const links = graphData.links || [];
  const clusterRisk = graphData.cluster_risk_score || 0.0;
  const flaggedCount = graphData.flagged_entities?.length || 0;

  // Apply custom force spreads to push nodes apart and keep representation clean
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-110);
      graphRef.current.d3Force('link').distance(90);
      graphRef.current.zoomToFit(200, 20);
    }
  }, [graphData]);

  // High-fidelity Canvas node painter
  const handleNodePaint = (node, ctx, globalScale) => {
    const isHovered = hoveredNode && hoveredNode.id === node.id;
    const radius = node.type === 'company' ? 10 : (node.type === 'shell' ? 8 : 6);
    const label = node.label || node.id;
    
    // Draw outer glowing halo rings
    if (node.risk === 'critical') {
      ctx.shadowColor = '#FF4444';
      ctx.shadowBlur = isHovered ? 24 : 15;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + (isHovered ? 4.5 : 2.5), 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 68, 68, 0.35)';
      ctx.fill();
      ctx.shadowBlur = 0; // Reset
    } else if (node.risk === 'medium') {
      ctx.shadowColor = '#FFB800';
      ctx.shadowBlur = isHovered ? 18 : 10;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + (isHovered ? 3.5 : 2), 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 184, 0, 0.25)';
      ctx.fill();
      ctx.shadowBlur = 0; // Reset
    } else if (isHovered) {
      ctx.shadowColor = '#00F5FF';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 245, 255, 0.2)';
      ctx.fill();
      ctx.shadowBlur = 0; // Reset
    }

    // Main Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    
    if (node.risk === 'critical') {
      ctx.fillStyle = '#FF4444';
    } else if (node.risk === 'medium') {
      ctx.fillStyle = '#FFB800';
    } else if (node.type === 'company') {
      ctx.fillStyle = '#00F5FF';
    } else if (node.type === 'shell') {
      ctx.fillStyle = '#8B5CF6';
    } else {
      ctx.fillStyle = '#3B82F6'; // Trader
    }
    
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#05070f';
    ctx.stroke();

    // Node text layout (scale dynamically based on zoom)
    const fontSize = Math.max(5, 10 / globalScale);
    ctx.font = `bold ${fontSize}px "JetBrains Mono"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = isHovered ? '#00F5FF' : '#E2E8F0';
    ctx.fillText(label, node.x, node.y + radius + 4.5);
  };

  const handleLinkColor = (link) => {
    if (link.source.risk === 'critical' || link.target.risk === 'critical' || 
        link.source.id === 'Operator_X' || link.target.id === 'Operator_X') {
      return 'rgba(255, 68, 68, 0.75)';
    }
    return 'rgba(38, 55, 87, 0.65)';
  };

  return (
    <div className="terminal-card rounded-lg p-4 h-[410px] flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-borderblue pb-2 mb-3 z-10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyanneon animate-pulse" />
          <h2 className="heading-syne font-extrabold text-[10px] tracking-widest text-slate-100 uppercase">
            Insider Entity Network
          </h2>
        </div>
        <span className="text-[8px] font-mono bg-borderblue px-2 py-0.5 rounded text-indigo-300 font-extrabold tracking-wider uppercase">
          Co-relation
        </span>
      </div>

      {/* Graph Area */}
      <div className="flex-1 w-full min-h-0 bg-black/40 border border-borderblue/35 rounded relative overflow-hidden">
        {nodes.length === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500">
            Mapping entity topologies...
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={{ nodes, links }}
            nodeCanvasObject={handleNodePaint}
            nodePointerAreaPaint={(node, color, ctx) => {
              const radius = node.type === 'company' ? 10 : (node.type === 'shell' ? 8 : 6);
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            }}
            linkColor={handleLinkColor}
            linkWidth={(link) => {
              if (link.source.risk === 'critical' || link.target.risk === 'critical') return 2.5;
              return 1.2;
            }}
            cooldownTicks={120}
            onNodeHover={(node) => setHoveredNode(node)}
            enableZoomInteraction={true}
            enablePanInteraction={true}
            height={260}
          />
        )}

        {/* HUD Overlay Panel */}
        <div className="absolute bottom-3 left-3 bg-[#05070f]/90 border border-borderblue/90 rounded p-3 w-52 pointer-events-none z-10 font-mono text-[9px] shadow-lg">
          <div className="flex items-center gap-1.5 text-redalert font-extrabold uppercase tracking-widest mb-1.5 border-b border-white/5 pb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>AI Risk Audit</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-400">Cluster Risk:</span>
            <span className={`font-black ${clusterRisk >= 0.80 ? 'text-redalert' : 'text-amberwarn'}`}>
              {(clusterRisk * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-400">Flagged Accounts:</span>
            <span className="text-white font-extrabold">{flaggedCount}</span>
          </div>
          <div className="flex justify-between mb-1.5">
            <span className="text-slate-400">Solver:</span>
            <span className="text-cyanneon font-black flex items-center gap-0.5">
              <Cpu className="w-2.5 h-2.5" /> NetworkX
            </span>
          </div>

          {/* Dynamic hover node inspector */}
          {hoveredNode ? (
            <div className="border-t border-white/10 pt-2 mt-2 text-cyanneon">
              <div className="font-extrabold text-[9.5px] uppercase truncate text-white mb-0.5">{hoveredNode.label}</div>
              <div className="text-[8px] text-slate-400 uppercase font-bold flex justify-between">
                <span>Class: {hoveredNode.type}</span>
                <span className="text-amberwarn">c: {hoveredNode.centrality}</span>
              </div>
              <p className="text-[8.5px] text-indigo-200 mt-1 leading-normal font-sans font-medium line-clamp-2">
                {hoveredNode.details}
              </p>
            </div>
          ) : (
            <div className="border-t border-white/5 pt-2 mt-2 text-slate-500 italic text-center">
              Hover nodes to audit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
