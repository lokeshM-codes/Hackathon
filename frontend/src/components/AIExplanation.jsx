import React from 'react';
import { Cpu, ShieldCheck, HelpCircle } from 'lucide-react';

export default function AIExplanation({ predictionData, isDemoActive, demoStep }) {
  
  const anomalyScore = predictionData.anomaly_score || 0.0;
  const probability = predictionData.prediction_probability || 0.0;
  const confidence = predictionData.prediction_confidence || 0.0;
  const factors = predictionData.top_factors || [];

  let lossPrevented = "₹0.12 Cr";
  if (predictionData.symbol === "YES_BANK") {
    lossPrevented = "₹0.85 Cr";
  } else if (predictionData.symbol === "ADANI_ENT") {
    lossPrevented = "₹2.40 Cr";
  } else if (predictionData.symbol === "IRFC_PENNY") {
    if (demoStep >= 10) {
      lossPrevented = "₹4.20 Cr";
    } else if (demoStep >= 7) {
      lossPrevented = "₹0.32 Cr";
    } else if (demoStep >= 4) {
      lossPrevented = "₹0.15 Cr";
    } else {
      lossPrevented = "₹0.00 Cr";
    }
  }

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence * circumference);

  const getImpactColor = (impact) => {
    const imp = impact.toLowerCase();
    if (imp.includes('critical')) return 'text-redalert bg-red-500/10 border-red-500/35';
    if (imp.includes('high')) return 'text-amberwarn bg-amber-500/10 border-amber-500/30';
    return 'text-[#8B5CF6] bg-purple-500/10 border-purple-500/25';
  };

  return (
    <div className="terminal-card rounded-lg p-5 h-[410px] flex flex-col justify-between overflow-y-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-borderblue/80 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyanneon" />
          <h2 className="heading-syne font-extrabold text-xs tracking-widest text-white uppercase">
            Explainable AI (XAI)
          </h2>
        </div>
        <span className="text-[9px] font-mono bg-borderblue px-2 py-0.5 rounded text-indigo-300 font-bold uppercase tracking-wider">
          Decision Trees
        </span>
      </div>

      {/* Main Stats Block: Radial Gauge + Critical Metrics */}
      <div className="flex items-center gap-4 bg-black/40 border border-borderblue/50 p-3 rounded-lg mb-3">
        {/* Radial Confidence Gauge */}
        <div className="relative w-18 h-18 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="36" cy="36" r={radius} stroke="#1E2A3A" strokeWidth="4.5" fill="transparent" />
            <circle 
              cx="36" 
              cy="36" 
              r={radius} 
              stroke={probability >= 0.80 ? '#FF4444' : '#00F5FF'} 
              strokeWidth="5.5" 
              fill="transparent" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center font-mono">
            <span className="text-sm font-black text-white">{(confidence * 100).toFixed(0)}%</span>
            <span className="text-[7px] text-slate-400 uppercase tracking-wider font-bold">Confidence</span>
          </div>
        </div>

        {/* Anomaly & Risk stats */}
        <div className="flex-1 grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Anomaly Score</div>
            <div className={`text-base font-black ${anomalyScore >= 0.75 ? 'text-redalert' : 'text-cyanneon'}`}>
              {(anomalyScore * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider font-mono">P&D Risk</div>
            <div className={`text-base font-black ${probability >= 0.70 ? 'text-redalert' : 'text-greenok'}`}>
              {(probability * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Top factors contributing to flag */}
      <div className="space-y-2 flex-1 min-h-0 mb-3.5 overflow-y-auto pr-1">
        {factors.map((f, i) => (
          <div key={i} className="bg-[#0E1426] border border-borderblue/60 p-2.5 rounded text-[10px] font-mono hover:border-cyanneon/20 transition-all duration-200">
            <div className="flex justify-between items-center mb-1">
              <span className="font-extrabold text-slate-200">{f.factor}</span>
              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${getImpactColor(f.impact)}`}>
                {f.impact}
              </span>
            </div>
            <p className="text-slate-300 text-[10px] leading-relaxed font-sans">{f.description}</p>
          </div>
        ))}
      </div>

      {/* Footer System Impact */}
      <div className="border-t border-borderblue/80 pt-3 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Surveillance Save</span>
          <span className={`text-sm font-black ${probability >= 0.85 ? 'text-greenok animate-pulse' : 'text-white'}`}>
            {lossPrevented} Saved
          </span>
        </div>
        
        {/* Mitigation status */}
        <div className="flex items-center gap-1.5 bg-[#00FF88]/15 border border-[#00FF88]/40 px-3 py-1.5 rounded text-greenok text-[9px] font-black uppercase tracking-widest shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Guard</span>
        </div>
      </div>
    </div>
  );
}
