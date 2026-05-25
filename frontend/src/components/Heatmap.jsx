import React from 'react';
import { Grid, Eye } from 'lucide-react';

export default function Heatmap({ heatmapData, selectedSymbol, onSelectStock }) {
  
  const getRiskColorClasses = (score) => {
    if (score >= 0.85) {
      return {
        bg: 'bg-red-950/15 border-red-500/70',
        border: 'border-redalert',
        text: 'text-redalert',
        glow: 'shadow-glowRed critical-flash-card',
        label: 'CRITICAL'
      };
    } else if (score >= 0.70) {
      return {
        bg: 'bg-yellow-950/10 border-yellow-500/50',
        border: 'border-amberwarn',
        text: 'text-amberwarn',
        glow: 'shadow-glowAmber',
        label: 'WARNING'
      };
    } else if (score >= 0.40) {
      return {
        bg: 'bg-[#1E2A3A]/25 border-purple-500/35',
        border: 'border-purplemagic/50',
        text: 'text-purplemagic',
        glow: 'hover:shadow-purple-500/15',
        label: 'ELEVATED'
      };
    } else {
      return {
        bg: 'bg-emerald-950/5 border-emerald-500/30',
        border: 'border-greenok/40',
        text: 'text-greenok',
        glow: 'hover:shadow-green-500/5',
        label: 'STABLE'
      };
    }
  };

  return (
    <div className="terminal-card rounded-lg p-4 h-[410px] flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-borderblue pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-cyanneon" />
          <h2 className="heading-syne font-extrabold text-[10px] tracking-widest text-slate-100 uppercase">
            Risk Matrix (3x3)
          </h2>
        </div>
        <span className="text-[8px] font-mono bg-borderblue px-2 py-0.5 rounded text-indigo-300 font-extrabold tracking-wider uppercase">
          Surveillance
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2.5 flex-1">
        {heatmapData.length === 0 ? (
          <div className="col-span-3 h-full flex items-center justify-center font-mono text-xs text-slate-500">
            Rendering risk matrix...
          </div>
        ) : (
          heatmapData.slice(0, 9).map((stock) => {
            const styles = getRiskColorClasses(stock.risk_score);
            const isSelected = selectedSymbol === stock.symbol;
            
            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className={`relative flex flex-col justify-between p-2.5 rounded border cursor-pointer transition-all duration-300 hover:scale-[1.03] ${styles.bg} ${styles.border} ${styles.glow} ${
                  isSelected ? 'border-cyanneon ring-1 ring-cyanneon/30' : ''
                }`}
              >
                {/* Symbol */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">
                    {stock.symbol.replace('_PENNY', '')}
                  </span>
                  {isSelected && <Eye className="w-3 h-3 text-cyanneon" />}
                </div>

                {/* Risk percentage */}
                <div className="my-1">
                  <span className="text-[7px] font-mono text-slate-400 uppercase tracking-wide block">Risk index</span>
                  <div className="text-base font-black tracking-tighter mono-numbers text-white flex items-baseline leading-none mt-0.5">
                    {(stock.risk_score * 100).toFixed(0)}
                    <span className="text-[8px] font-normal text-slate-400 ml-0.5">%</span>
                  </div>
                </div>

                {/* Severity Badge */}
                <div className="flex items-center justify-between border-t border-white/5 pt-1.5 mt-0.5">
                  <span className={`text-[7px] font-bold font-mono tracking-wider px-1 py-0.2 rounded bg-black/30 border border-white/5 uppercase leading-none ${styles.text}`}>
                    {styles.label.slice(0, 4)}
                  </span>
                  <span className={`text-[8px] font-mono font-bold ${
                    stock.change_percent >= 0 ? 'text-greenok' : 'text-redalert'
                  }`}>
                    {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
