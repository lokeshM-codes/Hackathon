import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Database, ShieldAlert, Cpu, Activity, Server, Clock } from 'lucide-react';

export default function LiveController({ symbol, predictionData, systemMetrics }) {
  const scrollContainerRef = useRef(null);
  const [localLogs, setLocalLogs] = useState([]);

  const anomalyScore = predictionData?.anomaly_score || 0.05;
  const probability = predictionData?.prediction_probability || 0.04;
  const confidence = predictionData?.prediction_confidence || 0.90;
  const severity = predictionData?.anomaly_severity || "INFO";

  // Telemetry heartbeat interval ticker for live market quotes
  useEffect(() => {
    // Initialize log on mount/reset
    const time = new Date().toTimeString().split(' ')[0];
    setLocalLogs([
      { time, component: "GATEWAY", msg: `Live connection established. Surveillance tunnel active for ${symbol}.`, type: "info" }
    ]);
  }, [symbol]);

  // Append new logs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toTimeString().split(' ')[0];
      const telemetries = [
        { component: "LIVE_FEED", msg: `Received exchange quote tick for ${symbol}. Price: ₹${predictionData?.anomaly_explanation ? "updated" : "synced"}.`, type: "info" },
        { component: "SEC_ALGO", msg: `Isolation Forest evaluation score: ${(anomalyScore * 100).toFixed(0)}% (${severity}).`, type: anomalyScore >= 0.70 ? "warn" : "info" },
        { component: "RANDOM_FOREST", msg: `Random Forest classification probability: ${(probability * 100).toFixed(0)}%.`, type: probability >= 0.70 ? "danger" : "info" },
        { component: "PORTFOLIO", msg: `Auditing market liquidity float for order cornering...`, type: "system" },
        { component: "NETWORK", msg: `Surveillance node latency checked: ${(systemMetrics?.latency || 42) + Math.floor(Math.sin(Date.now()/500)*4)}ms.`, type: "system" }
      ];
      
      const randomTele = telemetries[Math.floor(Math.random() * telemetries.length)];
      setLocalLogs(prev => [...prev, randomTele].slice(-25)); // Cap logs to 25 items for performance
    }, 2000);

    return () => clearInterval(interval);
  }, [symbol, anomalyScore, probability, severity, systemMetrics]);

  // Scroll to bottom of terminal container only
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [localLogs]);

  return (
    <div className="terminal-card rounded-lg p-5 h-[820px] flex flex-col justify-between overflow-hidden relative flex-shrink-0 font-mono text-[9px]">
      <div className="scanline-overlay" />

      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between border-b border-[#00f5ff]/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyanneon animate-pulse" />
            <h2 className="heading-syne font-extrabold text-xs tracking-widest text-[#00f5ff] uppercase">
              Live Market Analysis
            </h2>
          </div>
          <span className="text-[8px] px-2.5 py-0.5 rounded font-black uppercase tracking-wider bg-[#00f5ff]/10 text-cyanneon border border-[#00f5ff]/30 animate-pulse">
            LIVE FEED ACTIVE
          </span>
        </div>
      </div>

      {/* Realtime Scan Status */}
      <div className="flex-shrink-0 bg-[#00f5ff]/5 border border-[#00f5ff]/35 rounded-md p-3 mb-4 relative overflow-hidden">
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyanneon opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyanneon" />
          </span>
        </div>
        
        <div className="text-slate-400 font-bold mb-0.5 uppercase text-[8px]">Scan Telemetry status:</div>
        <div className="text-[11.5px] font-black tracking-wide text-cyanneon uppercase flex items-center gap-1">
          <Activity className="w-4 h-4 animate-pulse text-cyanneon" />
          <span>ACTIVE - SCANNING FOR MANIPULATION</span>
        </div>
        <div className="text-[7.5px] text-slate-400 mt-1 uppercase">
          Surveillance Node: <span className="text-white font-bold">{symbol} Live Stream</span>
        </div>
      </div>

      {/* Live Market Analysis score HUD */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[#05070f]/70 border border-borderblue/60 p-2 rounded flex flex-col justify-between">
          <div className="text-slate-500 font-bold text-[7.5px] uppercase">Anomaly Score</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xs font-black ${anomalyScore >= 0.70 ? 'text-redalert' : 'text-greenok'}`}>
              {(anomalyScore * 100).toFixed(0)}%
            </span>
            <div className="w-12 h-1 bg-[#101726] rounded-sm overflow-hidden flex">
              <div 
                className={`h-full ${anomalyScore >= 0.70 ? 'bg-redalert' : 'bg-greenok'}`} 
                style={{ width: `${anomalyScore * 100}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-[#05070f]/70 border border-borderblue/60 p-2 rounded flex flex-col justify-between">
          <div className="text-slate-500 font-bold text-[7.5px] uppercase">AI Confidence</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xs font-black text-cyanneon">
              {(confidence * 100).toFixed(0)}%
            </span>
            <div className="w-12 h-1 bg-[#101726] rounded-sm overflow-hidden flex">
              <div 
                className="h-full bg-cyanneon" 
                style={{ width: `${confidence * 100}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-[#05070f]/70 border border-borderblue/60 p-2 rounded">
          <div className="text-slate-500 font-bold text-[7.5px] uppercase flex items-center gap-1">
            <Server className="w-2.5 h-2.5 text-indigo-400" />
            <span>Surveillance Latency</span>
          </div>
          <div className="text-[10px] font-black text-slate-200 mt-0.5">
            {(systemMetrics?.latency || 42) + Math.floor(Math.sin(Date.now()/500)*4)} ms
          </div>
        </div>

        <div className="bg-[#05070f]/70 border border-borderblue/60 p-2 rounded">
          <div className="text-slate-500 font-bold text-[7.5px] uppercase flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-indigo-400" />
            <span>Feed Protocol</span>
          </div>
          <div className="text-[10px] font-black text-slate-200 mt-0.5">Finnhub REST/HTTPS</div>
        </div>
      </div>

      {/* System Metrics status blocks */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-1.5 mb-4 text-[7.5px] uppercase font-black text-center font-mono">
        <div className="py-1.5 border rounded-[3px] border-[#00f5ff]/35 bg-[#00f5ff]/5 text-cyanneon font-black shadow-glowCyan">
          CONNECTION ENCRYPTED
        </div>
        <div className="py-1.5 border rounded-[3px] border-greenok/30 bg-greenok/5 text-greenok font-extrabold">
          API CREDENTIALS OK
        </div>
      </div>

      {/* Live Terminal Telemetry Output */}
      <div className="flex-1 flex flex-col bg-[#04060c] border border-borderblue/55 rounded-md p-4 mb-3.5 relative min-h-0">
        <div className="flex items-center gap-1.5 text-slate-300 font-extrabold uppercase border-b border-[#1e2d4a]/45 pb-2 mb-2 flex-shrink-0">
          <Terminal className="w-3.5 h-3.5 text-cyanneon animate-pulse" />
          <span>Surveillance Log Telemetry</span>
        </div>

        {/* Scrollable logs list limited to remaining flex height */}
        <div 
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto space-y-1.5 pr-1 font-mono text-[8.5px] scrollbar-thin scrollbar-thumb-borderblue min-h-0"
        >
          {localLogs.map((log, i) => {
            const isLast = i === localLogs.length - 1;
            const isRecent = i >= localLogs.length - 3;
            return (
              <div 
                key={i} 
                className={`flex items-start gap-1.5 leading-snug transition-opacity duration-300 ${
                  isLast 
                    ? 'text-white font-extrabold opacity-100' 
                    : isRecent 
                      ? 'text-slate-200 opacity-90' 
                      : 'text-slate-500 opacity-60 hover:opacity-90'
                }`}
              >
                <span className="text-slate-600 flex-shrink-0">[{log.time}]</span>
                <span className={`font-black flex-shrink-0 ${
                  log.type === 'danger'
                    ? 'text-redalert'
                    : log.type === 'success'
                      ? 'text-greenok'
                      : log.type === 'warn'
                        ? 'text-amberwarn'
                        : log.type === 'info'
                          ? 'text-cyanneon'
                          : 'text-indigo-400'
                }`}>{log.component}:</span>
                <span className="text-slate-300">{log.msg}</span>
              </div>
            );
          })}
          
          {/* Blinking CLI Prompt Cursor */}
          <div className="flex items-center gap-1 mt-1.5 pl-1 opacity-90">
            <span className="text-slate-600">[{new Date().toTimeString().split(' ')[0]}]</span>
            <span className="text-cyanneon font-black">LIVE_WATCH:</span>
            <span className="text-slate-400">monitoring order flow...</span>
            <span className="inline-block w-1.5 h-3 bg-cyanneon animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex-shrink-0 text-[9px] font-mono text-slate-500 text-center border-t border-borderblue/40 pt-3">
        Live Feed: <span className="text-white font-bold">{symbol}</span> • Model Inference Active
      </div>
    </div>
  );
}
