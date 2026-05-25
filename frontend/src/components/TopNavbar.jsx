import React, { useState, useEffect } from 'react';
import { Shield, Brain, Activity, Database } from 'lucide-react';

export default function TopNavbar({ alertsCount, tradesCount, isDemoActive, demoStep, isOffline, isLiveMarket, onToggleLiveMarket }) {
  const [animatedTrades, setAnimatedTrades] = useState(tradesCount);

  useEffect(() => {
    const diff = tradesCount - animatedTrades;
    if (diff <= 0) return;

    const duration = 1000;
    const steps = 15;
    const stepVal = Math.ceil(diff / steps);
    const intervalTime = duration / steps;

    let current = animatedTrades;
    const timer = setInterval(() => {
      current += stepVal;
      if (current >= tradesCount) {
        setAnimatedTrades(tradesCount);
        clearInterval(timer);
      } else {
        setAnimatedTrades(current);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [tradesCount]);

  return (
    <nav className="w-full bg-[#060913] border-b border-borderblue/90 px-6 py-4 flex items-center justify-between z-50 sticky top-0 shadow-lg">
      
      {/* Brand logo & titles */}
      <div className="flex items-center gap-3.5">
        <div className="relative p-2 bg-[#00F5FF]/10 rounded border border-[#00F5FF]/45 shadow-glowCyan">
          <Shield className="w-6 h-6 text-cyanneon animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-wider text-white heading-syne flex items-center gap-2">
            MARKETGUARD <span className="text-cyanneon font-light">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">
            SEBI-Grade Surveillance Terminal
          </p>
        </div>
      </div>

      {/* Analytics specs counters */}
      <div className="hidden lg:flex items-center gap-10">
        {/* Status dot */}
        <div className="flex items-center gap-2.5 bg-[#0D1426] border border-borderblue/80 px-3.5 py-1.8 rounded-md">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isOffline ? 'bg-amberwarn shadow-glowAmber' : (isLiveMarket ? 'bg-[#00f5ff] shadow-glowCyan' : 'bg-greenok shadow-glowGreen')}`} />
          <span className="text-[10px] font-mono font-extrabold text-white uppercase tracking-widest">
            {isOffline ? 'Offline Mode (Local Fallback)' : (isLiveMarket ? '● LIVE MARKET CONNECTED' : 'Surveillance Feed: Connected')}
          </span>
        </div>

        {/* Dynamic Trades Counter */}
        <div className="flex flex-col text-right">
          <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-widest">Trades Audited</span>
          <span className="text-xl font-black text-white mono-numbers tracking-wide">
            {animatedTrades.toLocaleString()}
          </span>
        </div>

        {/* Active Alerts count */}
        <div className="flex items-center gap-3 bg-[#FF4444]/15 border border-[#FF4444]/40 px-3.5 py-1.8 rounded-md shadow-sm">
          <Activity className="w-4 h-4 text-redalert animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[9px] text-[#FF8888] font-mono font-bold uppercase tracking-widest">Active Alarms</span>
            <span className="text-sm font-black text-redalert mono-numbers">
              {alertsCount} Active
            </span>
          </div>
        </div>
      </div>

      {/* Tags and Badges */}
      <div className="flex items-center gap-3.5 font-mono">
        {/* Mode Selector Toggle */}
        <div className="flex items-center bg-[#0a0f1d] border border-borderblue/85 rounded-md p-1 gap-1">
          <button
            onClick={() => onToggleLiveMarket(false)}
            className={`px-3 py-1.5 text-[9px] font-black tracking-wider uppercase rounded transition-all ${
              !isLiveMarket 
                ? 'bg-amberwarn/20 text-[#FFB800] border border-amberwarn/40 shadow-glowAmber' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo Mode
          </button>
          <button
            onClick={() => onToggleLiveMarket(true)}
            className={`px-3 py-1.5 text-[9px] font-black tracking-wider uppercase rounded transition-all ${
              isLiveMarket 
                ? 'bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/40 shadow-glowCyan animate-pulse' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Market
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[#8B5CF6]/15 border border-[#8B5CF6]/45 px-3 py-1.5 rounded-md text-[#C084FC] shadow-sm">
          <Brain className="w-3.5 h-3.5" />
          <span className="text-[9.5px] font-black tracking-widest uppercase">
            AI Models Active
          </span>
        </div>

        {isLiveMarket ? (
          <div className="flex items-center gap-2 bg-[#00f5ff]/15 border border-[#00f5ff]/45 px-3 py-1.5 rounded-md text-cyanneon shadow-sm animate-pulse">
            <Database className="w-3.5 h-3.5" />
            <span className="text-[9.5px] font-black tracking-widest uppercase">
              LIVE MARKET
            </span>
          </div>
        ) : isDemoActive ? (
          <div className="flex items-center gap-2 bg-[#FFB800]/15 border border-[#FFB800]/45 px-3 py-1.5 rounded-md text-[#FBBF24] animate-pulse shadow-sm">
            <Database className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-[9.5px] font-black tracking-widest uppercase">
              DEMO STATE {demoStep}/12
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[#0D1426] border border-borderblue/80 px-3 py-1.5 rounded-md text-slate-300">
            <Database className="w-3.5 h-3.5" />
            <span className="text-[9.5px] font-black tracking-widest uppercase">
              Live Monitor
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
