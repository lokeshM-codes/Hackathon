import React from 'react';
import { Play, RotateCcw, ShieldCheck, Flame, Cpu, Database, AlertCircle } from 'lucide-react';

const DEMO_STEPS = [
  { step: 1, label: "Surveillance Init", desc: "Terminal baseline established for IRFC_PENNY." },
  { step: 2, label: "Volume Spikes", desc: "Volume surges 4x gradually on railway ticker." },
  { step: 3, label: "Price Accelerates", desc: "Price jumps +19.1% on 15x volume spike." },
  { step: 4, label: "Isolation Forest Warning", desc: "Isolation Forest flags volume ratio anomalies." },
  { step: 5, label: "Momentum Warning", desc: "AI registers warning for rapid pricing spikes." },
  { step: 6, label: "Negative Sentiments", desc: "Regulator notices bulk trades; feeds turn negative." },
  { step: 7, label: "Divergence Alarm", desc: "Critical mismatch: price climbs while sentiment plummets." },
  { step: 8, label: "Insider Ring Mapping", desc: "NetworkX isolates offshore shell clearing links." },
  { step: 9, label: "XAI Weight Calculations", desc: "Explainable factors computed in real-time." },
  { step: 10, label: "PUMP_DUMP Identified", desc: "Random Forest flags coordinate manipulation (0.96)." },
  { step: 11, label: "Inference Confirmation", desc: "Terminal confidence locks at 96% verification." },
  { step: 12, label: "Surveillance Mitigation", desc: "Shield locks trade float; ₹4.2 Cr loss prevented." }
];

export default function DemoControls({ currentStep, onTriggerDemo, onResetDemo }) {
  const isRunning = currentStep > 0;

  return (
    <div className="terminal-card rounded-lg p-5 xl:h-[845px] flex flex-col justify-between overflow-hidden relative">
      <div className="scanline-overlay" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-borderblue/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyanneon animate-pulse" />
            <h2 className="heading-syne font-extrabold text-xs tracking-widest text-white uppercase">
              Mission Controller
            </h2>
          </div>
          <span className="text-[9px] font-mono bg-borderblue px-2.5 py-0.5 rounded text-indigo-300 font-bold uppercase tracking-wider">
            Scripted Run
          </span>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={onTriggerDemo}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-md font-heading font-black text-[11px] tracking-wider uppercase border transition-all duration-300 ${
              isRunning 
                ? 'bg-amberwarn/10 border-amberwarn/40 text-amberwarn cursor-not-allowed shadow-glowAmber' 
                : 'bg-cyanneon/15 border-cyanneon text-cyanneon hover:bg-cyanneon/30 hover:shadow-glowCyan hover:scale-[1.02]'
            }`}
            disabled={isRunning}
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Demo Active' : 'Start Demo'}</span>
          </button>

          <button
            onClick={onResetDemo}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-md font-heading font-black text-[11px] tracking-wider uppercase bg-[#0D1426] border border-borderblue text-slate-300 hover:bg-[#1E2A3A] hover:text-white hover:scale-[1.02] transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Terminal</span>
          </button>
        </div>
      </div>

      {/* Vertical Steps Checklist */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-mono text-[9px] border-t border-borderblue/40 pt-4 mb-3.5">
        {DEMO_STEPS.map((s) => {
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;
          const isPending = currentStep < s.step;

          let stepBorder = "border-borderblue/55 text-slate-400";
          let stepBadge = "bg-[#0D1426] border border-borderblue/80 text-slate-400";
          
          if (isActive) {
            stepBorder = "border-cyanneon shadow-glowCyan bg-[#00F5FF]/10 text-white font-bold scale-[1.01]";
            stepBadge = "bg-[#00F5FF] text-black border-cyanneon font-extrabold shadow-sm";
          } else if (isCompleted) {
            stepBorder = "border-greenok/35 bg-[#00FF88]/5 text-greenok/90";
            stepBadge = "bg-greenok text-black border-greenok font-extrabold";
          }

          return (
            <div 
              key={s.step} 
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${stepBorder}`}
            >
              {/* Counter badge */}
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] flex-shrink-0 ${stepBadge}`}>
                {s.step}
              </span>
              
              {/* Descriptions */}
              <div className="flex-1 leading-tight">
                <div className="font-extrabold flex items-center gap-2 font-heading text-[10.5px] uppercase tracking-wide">
                  {s.label}
                  {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyanneon animate-ping" />}
                  {isCompleted && <ShieldCheck className="w-3.5 h-3.5 text-greenok" />}
                </div>
                <p className="text-[9px] text-slate-400 mt-1 font-sans font-medium">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Info */}
      <div className="text-[9px] font-mono text-slate-500 text-center border-t border-borderblue/40 pt-3">
        Target: <span className="text-white font-bold">IRFC_PENNY</span> • interval: 3s ticks
      </div>
    </div>
  );
}
