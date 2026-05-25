import React from 'react';
import { Clock, Activity } from 'lucide-react';

export default function AlertPanel({ alerts, selectedSymbol, onSelectStock }) {
  
  const formatTime = (timeStr) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="bg-red-500/10 border border-red-500/30 text-redalert text-[8px] font-bold px-1.5 py-0.2 rounded font-mono">CRITICAL</span>;
      case 'WARNING':
        return <span className="bg-yellow-500/10 border border-yellow-500/35 text-amberwarn text-[8px] font-bold px-1.5 py-0.2 rounded font-mono">WARNING</span>;
      default:
        return <span className="bg-blue-500/10 border border-blue-500/35 text-blue-400 text-[8px] font-bold px-1.5 py-0.2 rounded font-mono">INFO</span>;
    }
  };

  const getSeverityCardStyles = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/5 border-red-500/25 hover:border-red-500/50 critical-flash-card';
      case 'WARNING':
        return 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40';
      default:
        return 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40';
    }
  };

  return (
    <div className="terminal-card rounded-lg p-4 h-[410px] flex flex-col relative overflow-hidden">
      <div className="scanline-overlay" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-borderblue pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyanneon animate-pulse" />
          <h2 className="heading-syne font-extrabold text-[10px] tracking-widest text-slate-100 uppercase">
            Active Alerts
          </h2>
        </div>
        <span className="text-[8px] font-mono bg-borderblue px-2 py-0.5 rounded text-indigo-300 font-extrabold tracking-wider uppercase">
          Surveillance
        </span>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <span className="text-[10px] text-slate-500 font-mono">Surveillance active. No alarms.</span>
          </div>
        ) : (
          alerts.map((alert) => {
            const isSelected = selectedSymbol === alert.symbol;
            return (
              <div
                key={alert.id}
                onClick={() => onSelectStock(alert.symbol)}
                className={`p-3 rounded-md border cursor-pointer transition-all duration-200 hover:scale-[1.01] ${getSeverityCardStyles(alert.severity)} ${
                  isSelected ? 'border-cyanneon/70 shadow-glowCyan bg-[#00F5FF]/5' : ''
                }`}
              >
                {/* Row 1: Symbol/Severity left, Time right */}
                <div className="flex items-center justify-between mb-1.5 font-mono text-[9px]">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white bg-slate-800 border border-slate-700 px-1.5 py-0.2 rounded">
                      {alert.symbol}
                    </span>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatTime(alert.timestamp)}
                  </span>
                </div>

                {/* Row 2: Title */}
                <h4 className="text-[10.5px] font-extrabold text-white mb-1 leading-tight tracking-wide heading-syne uppercase">
                  {alert.title}
                </h4>

                {/* Row 3: Short description */}
                <p className="text-[9.5px] text-slate-300 leading-snug line-clamp-2 mb-2 font-sans font-medium">
                  {alert.explanation}
                </p>

                {/* Row 4: Risk indexes */}
                <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[9px] font-mono">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Risk Score:</span>
                    <span className="font-bold text-white">{(alert.risk_score * 100).toFixed(0)}%</span>
                  </div>
                  {alert.estimated_impact_inr > 0 && (
                    <div className="text-right text-[#FF8888] font-bold">
                      Loss: ₹{(alert.estimated_impact_inr / 10000000).toFixed(2)} Cr
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
