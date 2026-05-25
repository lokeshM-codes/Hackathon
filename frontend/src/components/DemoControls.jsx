import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ShieldCheck, Database, Terminal, ShieldAlert, Cpu, Layers, Activity } from 'lucide-react';

const DEMO_PHASES = [
  "Baseline Monitoring",
  "Volume Spike Detection",
  "Momentum Analysis",
  "Insider Link Discovery",
  "Sentiment Divergence",
  "Cross-Broker Correlation",
  "AI Risk Escalation",
  "Pump-Dump Probability",
  "Retail Exposure Analysis",
  "XAI Validation",
  "Regulatory Risk Alert",
  "Mitigation Complete"
];

export default function DemoControls({ currentStep, onTriggerDemo, onResetDemo }) {
  const isRunning = currentStep > 0;
  const scrollContainerRef = useRef(null);
  const [localLogs, setLocalLogs] = useState([]);

  // Dynamic incident scores that fluctuate slightly to feel alive
  const getDynamicMetrics = () => {
    if (currentStep === 0) {
      return { threat: 8, confidence: 90, exposure: "₹0.0 Cr", entities: 1 };
    }
    
    const threatScores = [12, 24, 38, 55, 64, 72, 82, 88, 91, 96, 96, 96];
    const confidenceScores = [50, 60, 70, 81, 83, 85, 89, 91, 93, 96, 96, 96];
    
    let threat = threatScores[currentStep - 1];
    let confidence = confidenceScores[currentStep - 1];
    
    // Add small realistic fluctuation of +/- 1% to make it feel alive!
    if (currentStep > 0 && currentStep < 10) {
      threat += Math.floor(Math.sin(Date.now() / 800) * 1.5);
      confidence += Math.floor(Math.cos(Date.now() / 800) * 1.2);
    }
    
    let exposure = "₹1.2 Cr";
    if (currentStep >= 8) {
      exposure = "₹42.0 Cr";
    } else if (currentStep >= 4) {
      exposure = "₹12.5 Cr";
    }
    
    let entities = 1;
    if (currentStep >= 8) {
      entities = 5;
    }
    
    return { 
      threat: Math.min(100, Math.max(0, threat)), 
      confidence: Math.min(100, Math.max(0, confidence)), 
      exposure, 
      entities 
    };
  };

  // Get specific logs for a demo step
  const getLogsForStep = (step) => {
    const time = new Date().toTimeString().split(' ')[0];
    switch (step) {
      case 1:
        return [
          { time, component: "SEC_ALGO", msg: "Established surveillance target: IRFC_PENNY.", type: "system" },
          { time, component: "MONITOR", msg: "Scanning order streams for float anomalies...", type: "system" }
        ];
      case 2:
        return [
          { time, component: "VOLUME_ENGINE", msg: "Abnormal volume spike detected (3.2x normal baseline).", type: "info" }
        ];
      case 3:
        return [
          { time, component: "MOMENTUM_AI", msg: "Price acceleration flagged: +19.1% momentum spike.", type: "warn" }
        ];
      case 4:
        return [
          { time, component: "ISOLATION_FOREST", msg: "Anomaly detected! Score exceeds watch limits.", type: "warn" },
          { time, component: "SEC_ALGO", msg: "Upgrading target watch priority to WARNING.", type: "warn" }
        ];
      case 5:
        return [
          { time, component: "RISK_ENGINE", msg: "Rate-of-change velocity exceeds historic thresholds.", type: "warn" }
        ];
      case 6:
        return [
          { time, component: "SENTIMENT_AI", msg: "Scraped negative press feeds: SEBI scans broker logs.", type: "warn" }
        ];
      case 7:
        return [
          { time, component: "SURVEILLANCE", msg: "CRITICAL Price-Sentiment divergence confirmed.", type: "danger" }
        ];
      case 8:
        return [
          { time, component: "NETWORK_GRAPH", msg: "Insider mapping link discovered: Mauritius Alpha Ltd.", type: "danger" },
          { time, component: "NETWORK_GRAPH", msg: "Identified clearing channel link: Apex Securities.", type: "danger" }
        ];
      case 9:
        return [
          { time, component: "XAI_CORE", msg: "SHAP risk factor: Float cornering is primary driver.", type: "system" }
        ];
      case 10:
        return [
          { time, component: "RANDOM_FOREST", msg: "Coordinated PUMP_DUMP scheme verified (96% probability).", type: "danger" }
        ];
      case 11:
        return [
          { time, component: "REGULATOR_ALERT", msg: "Surveillance notice broadcasted. Mitigation lock queued.", type: "system" }
        ];
      case 12:
        return [
          { time, component: "SURVEILLANCE_SHIELD", msg: "MITIGATION COMPLETE. Blocked floating capital.", type: "success" },
          { time, component: "SURVEILLANCE_SHIELD", msg: "Surveillance lock engaged. ₹4.2 Cr retail losses prevented.", type: "success" }
        ];
      default:
        return [];
    }
  };

  // Sync step changes to append specific logs
  useEffect(() => {
    if (currentStep === 0) {
      setLocalLogs([
        { time: new Date().toTimeString().split(' ')[0], component: "SYS", msg: "Surveillance terminal initialized. Active scan list: RELIANCE, YES_BANK, IRFC_PENNY.", type: "system" }
      ]);
    } else {
      const stepLogs = getLogsForStep(currentStep);
      setLocalLogs(prev => {
        // Prevent duplicate step appends on double polling
        const hasStepLog = prev.some(l => l.step === currentStep);
        if (hasStepLog) return prev;
        
        const markedLogs = stepLogs.map(l => ({ ...l, step: currentStep }));
        return [...prev, ...markedLogs].slice(-25); // Limit logs for rendering performance
      });
    }
  }, [currentStep]);

  // Telemetry heartbeat interval ticker (runs constantly)
  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toTimeString().split(' ')[0];
      if (currentStep > 0) {
        // Active threat investigation telemetry
        const telemetries = [
          { component: "PORTFOLIO", msg: "Auditing block transaction routing arrays...", type: "system" },
          { component: "SEC_ALGO", msg: "Running Isolation Forest multidimensional sweep...", type: "system" },
          { component: "NETWORK", msg: "Analyzing IP cross-referencing latency hashes...", type: "system" },
          { component: "SENTIMENT", msg: "Parsing retail message board discussion boards...", type: "system" },
          { component: "EXPLAIN_AI", msg: "Recalculating SHAP factor force indices...", type: "system" }
        ];
        const randomTele = telemetries[Math.floor(Math.random() * telemetries.length)];
        setLocalLogs(prev => [...prev, { time, ...randomTele }].slice(-25));
      } else {
        // Routine scans
        const routines = [
          { component: "SYS_MONITOR", msg: "RELIANCE tracking metrics normal. Anomaly score: 0.05", type: "info" },
          { component: "SYS_MONITOR", msg: "TCS derivatives baseline checked. Anomaly score: 0.08", type: "info" },
          { component: "SYS_MONITOR", msg: "INFOSYS order flows verified. Anomaly score: 0.04", type: "info" },
          { component: "SYS_MONITOR", msg: "HDFC_BANK trade latency within 4.2ms limit.", type: "info" },
          { component: "SYS_MONITOR", msg: "ITC volume distributions stable.", type: "info" }
        ];
        const randomRoutine = routines[Math.floor(Math.random() * routines.length)];
        setLocalLogs(prev => [...prev, { time, ...randomRoutine }].slice(-25));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentStep]);

  // Scroll to bottom of terminal container only (avoids page jumps)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [localLogs]);

  // Render Status badge colors
  const getStatusColor = (stateIdx) => {
    // 0: Monitoring (steps 1-3)
    // 1: Detection (steps 4-7)
    // 2: Audit (steps 8-11)
    // 3: Mitigation (step 12)
    const mapping = [
      { start: 1, end: 3 },
      { start: 4, end: 7 },
      { start: 8, end: 11 },
      { start: 12, end: 12 }
    ];
    
    if (currentStep === 0) return "text-slate-600 border-slate-800 bg-transparent";
    
    const { start, end } = mapping[stateIdx];
    if (currentStep > end) {
      return "text-greenok border-greenok/30 bg-greenok/5 font-extrabold";
    } else if (currentStep >= start && currentStep <= end) {
      return "text-cyanneon border-cyanneon/50 bg-[#00f5ff]/10 shadow-glowCyan font-black animate-pulse";
    } else {
      return "text-slate-600 border-slate-800/40 bg-transparent";
    }
  };

  const getProgressWidth = () => {
    if (currentStep === 0) return 0;
    return ((currentStep - 1) / 11) * 100;
  };

  const metrics = getDynamicMetrics();
  const activePhaseName = currentStep > 0 ? DEMO_PHASES[currentStep - 1] : "STANDBY - ACTIVE SCANS";

  return (
    <div className="terminal-card rounded-lg p-5 h-[820px] flex flex-col justify-between overflow-hidden relative flex-shrink-0">
      <div className="scanline-overlay" />

      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between border-b border-borderblue/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyanneon animate-pulse" />
            <h2 className="heading-syne font-extrabold text-xs tracking-widest text-white uppercase">
              Mission Controller
            </h2>
          </div>
          <span className={`text-[8px] font-mono px-2.5 py-0.5 rounded font-black uppercase tracking-wider ${
            currentStep >= 12
              ? 'bg-greenok/10 text-greenok border border-greenok/30'
              : currentStep >= 10
                ? 'bg-redalert/10 text-redalert border border-redalert/30 animate-pulse'
                : 'bg-borderblue text-indigo-300'
          }`}>
            {currentStep > 0 ? `STEP ${currentStep}/12` : 'STANDBY'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={onTriggerDemo}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-md font-heading font-black text-[11px] tracking-wider uppercase border transition-all duration-300 ${
              isRunning 
                ? 'bg-amberwarn/10 border-amberwarn/40 text-amberwarn cursor-not-allowed shadow-glowAmber' 
                : 'bg-[#00f5ff]/15 border-cyanneon text-[#00f5ff] hover:bg-cyanneon/30 hover:shadow-glowCyan hover:scale-[1.02]'
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

      {/* 12 Investigation Phases List */}
      <div className="flex-shrink-0 bg-black/40 border border-borderblue/55 rounded-md p-3 mb-4 font-mono text-[9px] relative overflow-hidden">
        <div className="text-slate-400 font-bold mb-2 uppercase tracking-wider border-b border-borderblue/30 pb-1 flex items-center justify-between">
          <span>Surveillance Phases</span>
          <span className="text-[7.5px] text-cyanneon font-black animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyanneon animate-ping" />
            LIVE SCAN
          </span>
        </div>
        <div className="space-y-1 max-h-[145px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-borderblue">
          {DEMO_PHASES.map((phase, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            const isPending = currentStep < stepNum;
            
            let statusColor = "border-slate-800/40 text-slate-500 bg-transparent";
            let dotColor = "bg-slate-850 border border-slate-700";
            if (isActive) {
              statusColor = currentStep >= 10 
                ? "border-redalert bg-redalert/10 text-white shadow-glowRed scale-[1.01] font-black" 
                : "border-cyanneon bg-cyanneon/10 text-white shadow-glowCyan scale-[1.01] font-black";
              dotColor = currentStep >= 10 ? "bg-redalert animate-pulse" : "bg-cyanneon animate-pulse";
            } else if (isCompleted) {
              statusColor = "border-greenok/30 bg-greenok/5 text-greenok/80 font-semibold";
              dotColor = "bg-greenok shadow-glowGreen";
            }

            return (
              <div 
                key={phase} 
                className={`flex items-center justify-between p-1 px-2 rounded-[3px] border transition-all duration-300 ${statusColor}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-[7px] font-mono px-1 rounded-sm ${
                    isActive 
                      ? (currentStep >= 10 ? 'bg-redalert text-black font-black' : 'bg-cyanneon text-black font-black')
                      : isCompleted
                        ? 'bg-greenok/20 text-greenok font-bold'
                        : 'bg-slate-850 text-slate-500'
                  }`}>
                    {stepNum.toString().padStart(2, '0')}
                  </span>
                  <span className="text-[8.5px] tracking-wide truncate max-w-[170px]">
                    {phase}
                  </span>
                </div>
                
                {/* Status dot */}
                <div className="flex items-center">
                  {isActive ? (
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentStep >= 10 ? 'bg-redalert' : 'bg-cyanneon'}`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStep >= 10 ? 'bg-redalert' : 'bg-cyanneon'}`} />
                    </span>
                  ) : (
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Live Changing Incident Score HUD */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[#05070f]/70 border border-borderblue/60 p-2 rounded flex flex-col justify-between">
          <div className="text-slate-500 font-bold text-[7.5px] uppercase">Threat Score</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xs font-black ${metrics.threat >= 80 ? 'text-redalert' : metrics.threat >= 40 ? 'text-amberwarn' : 'text-greenok'}`}>
              {metrics.threat}%
            </span>
            <div className="w-12 h-1 bg-[#101726] rounded-sm overflow-hidden flex">
              <div 
                className={`h-full ${metrics.threat >= 80 ? 'bg-redalert' : metrics.threat >= 40 ? 'bg-amberwarn' : 'bg-greenok'}`} 
                style={{ width: `${metrics.threat}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-[#05070f]/70 border border-borderblue/60 p-2 rounded flex flex-col justify-between">
          <div className="text-slate-500 font-bold text-[7.5px] uppercase">AI Confidence</div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xs font-black text-cyanneon">
              {metrics.confidence}%
            </span>
            <div className="w-12 h-1 bg-[#101726] rounded-sm overflow-hidden flex">
              <div 
                className="h-full bg-cyanneon" 
                style={{ width: `${metrics.confidence}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-[#05070f]/70 border border-borderblue/60 p-2 rounded">
          <div className="text-slate-500 font-bold text-[7.5px] uppercase">Est. Exposure</div>
          <div className="text-[10px] font-black text-slate-200 mt-0.5">{metrics.exposure}</div>
        </div>

        <div className="bg-[#05070f]/70 border border-borderblue/60 p-2 rounded">
          <div className="text-slate-500 font-bold text-[7.5px] uppercase">Linked Entities</div>
          <div className="text-[10px] font-black text-slate-200 mt-0.5">{metrics.entities} accounts</div>
        </div>
      </div>

      {/* Dynamic Status Flow Pill badges */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-1.5 mb-4 text-[7.5px] uppercase font-black text-center font-mono">
        {["Monitoring", "Detection", "Audit", "Mitigation"].map((label, idx) => (
          <div 
            key={label}
            className={`py-1.5 border rounded-[3px] transition-all duration-300 ${getStatusColor(idx)}`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Progress timeline line tracker */}
      <div className="flex-shrink-0 mb-4 px-1.5">
        <div className="relative w-full h-1 bg-[#151e33] rounded-full">
          <div 
            className="absolute top-0 left-0 h-1 bg-cyanneon shadow-glowCyan transition-all duration-500 rounded-full"
            style={{ width: `${getProgressWidth()}%` }}
          />
          {/* Active progress head pulse */}
          {currentStep > 0 && (
            <div 
              className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-glowCyan -top-[3px] transition-all duration-500"
              style={{ left: `calc(${getProgressWidth()}% - 5px)` }}
            />
          )}
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
          className="flex-grow overflow-y-auto max-h-[190px] h-[190px] space-y-1.5 pr-1 font-mono text-[8px] scrollbar-thin scrollbar-thumb-borderblue min-h-0"
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
            <span className="text-cyanneon font-black">SYS_LOG:</span>
            <span className="text-slate-400">awaiting packets...</span>
            <span className="inline-block w-1.5 h-3 bg-cyanneon animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex-shrink-0 text-[9px] font-mono text-slate-500 text-center border-t border-borderblue/40 pt-3">
        Interval: <span className="text-white font-bold">3s Tick System</span> • Live Telemetry Streams
      </div>
    </div>
  );
}
