import React from 'react';
import { Cpu, ShieldCheck, AlertCircle, Sparkles, Server, CheckCircle2, XCircle } from 'lucide-react';

export default function AIExplanation({ predictionData, isDemoActive, demoStep }) {
  const anomalyScore = predictionData.anomaly_score || 0.0;
  const probability = predictionData.prediction_probability || 0.0;
  const confidence = predictionData.prediction_confidence || 0.0;
  const symbol = predictionData.symbol || 'YES_BANK';

  const isAnomalous = predictionData.anomaly_severity === "CRITICAL" || predictionData.anomaly_severity === "WARNING" || symbol === 'YES_BANK' || (symbol === 'IRFC_PENNY' && demoStep >= 4);

  // Segmented Bar Renderer
  const renderSegmentedBar = (value, colorClass, maxSegments = 10) => {
    const activeSegments = Math.round(value * maxSegments);
    return (
      <div className="flex gap-0.5 items-center">
        {Array.from({ length: maxSegments }).map((_, idx) => (
          <div 
            key={idx} 
            className={`h-2.5 w-2 rounded-sm border border-white/5 transition-all ${
              idx < activeSegments 
                ? colorClass 
                : 'bg-[#080c16]'
            }`}
          />
        ))}
      </div>
    );
  };

  // Natural Language Explainer ("Why AI Flagged This")
  const getNaturalExplanation = () => {
    if (predictionData.anomaly_explanation) {
      return predictionData.anomaly_explanation;
    }
    if (symbol === 'YES_BANK') {
      return `Price increased 35.0% with a 50x volume spike while sentiment turned sharply negative (-0.78) and connected accounts executed synchronized orders.`;
    } else if (symbol === 'IRFC_PENNY') {
      if (demoStep >= 10) {
        return `Price increased 47.7% while sentiment turned sharply negative (-0.89) and connected accounts executed synchronized order loops.`;
      } else if (demoStep >= 7) {
        return `Price increased 19.1% with regulatory warnings driving sentiment to -0.85, confirming a high-risk price-sentiment divergence.`;
      } else if (demoStep >= 4) {
        return `Abnormal volume acceleration detected (15x average) triggering active machine learning anomaly surveillance thresholds.`;
      } else if (demoStep >= 1) {
        return `Baseline tracker active. Stock indicators currently operating under warning watch lists.`;
      }
    }
    return `Price and trading volumes conform to historical baselines. No anomalous loops, coordinated accounts, or sentiment mismatches detected.`;
  };

  // Model Consensus Indicators
  const getModelAgreements = () => {
    if (predictionData.anomaly_explanation && symbol !== 'YES_BANK' && symbol !== 'IRFC_PENNY') {
      const isCritical = predictionData.anomaly_severity === 'CRITICAL';
      const isWarning = predictionData.anomaly_severity === 'WARNING';
      const hasMismatch = predictionData.mismatch_detected;
      const isPumpDump = predictionData.prediction_probability >= 0.70;
      
      return [
        { model: "Isolation Forest", status: (isCritical || isWarning) ? "FLAG" : "NORMAL", state: (isCritical || isWarning) ? "danger" : "safe" },
        { model: "Random Forest", status: isPumpDump ? "FLAG" : "NORMAL", state: isPumpDump ? "danger" : "safe" },
        { model: "LSTM Sentiment", status: hasMismatch ? "MISMATCH" : "ALIGNED", state: hasMismatch ? "danger" : "safe" },
        { model: "NetworkX Linker", status: isCritical ? "CLUSTER" : "CLEAR", state: isCritical ? "danger" : "safe" }
      ];
    }
    if (symbol === 'YES_BANK') {
      return [
        { model: "Isolation Forest", status: "FLAG", state: "danger" },
        { model: "Random Forest", status: "FLAG", state: "danger" },
        { model: "LSTM Sentiment", status: "MISMATCH", state: "danger" },
        { model: "NetworkX Linker", status: "CLEAR", state: "safe" }
      ];
    } else if (symbol === 'IRFC_PENNY') {
      return [
        { model: "Isolation Forest", status: demoStep >= 4 ? "FLAG" : "NORMAL", state: demoStep >= 4 ? "danger" : "safe" },
        { model: "Random Forest", status: demoStep >= 10 ? "FLAG" : "NORMAL", state: demoStep >= 10 ? "danger" : "safe" },
        { model: "LSTM Sentiment", status: demoStep >= 6 ? "MISMATCH" : "ALIGNED", state: demoStep >= 6 ? "danger" : "safe" },
        { model: "NetworkX Linker", status: demoStep >= 8 ? "CLUSTER" : "CLEAR", state: demoStep >= 8 ? "danger" : "safe" }
      ];
    }
    return [
      { model: "Isolation Forest", status: "NORMAL", state: "safe" },
      { model: "Random Forest", status: "NORMAL", state: "safe" },
      { model: "LSTM Sentiment", status: "ALIGNED", state: "safe" },
      { model: "NetworkX Linker", status: "CLEAR", state: "safe" }
    ];
  };

  // SHAP Feature Contribution values (positive/negative impact weight)
  const getShapFeatures = () => {
    if (predictionData.top_factors && predictionData.top_factors.length > 0 && symbol !== 'YES_BANK' && symbol !== 'IRFC_PENNY') {
      return predictionData.top_factors.map((f) => {
        const isPos = !f.impact.includes('-') && !f.impact.toLowerCase().includes('stable') && !f.impact.toLowerCase().includes('neutral');
        let val = 15;
        if (f.factor.toLowerCase().includes('volume')) val = 38;
        else if (f.factor.toLowerCase().includes('price') || f.factor.toLowerCase().includes('momentum')) val = 25;
        else if (f.factor.toLowerCase().includes('sentiment')) val = 18;
        
        return {
          name: f.factor,
          value: isPos ? val : -val,
          type: isPos ? 'positive' : 'negative'
        };
      });
    }
    if (symbol === 'YES_BANK') {
      return [
        { name: "Volume Spike (50x)", value: 45, type: "positive" },
        { name: "Sentiment Divergence", value: 32, type: "positive" },
        { name: "Option Concentration", value: 15, type: "positive" },
        { name: "Sector Alignment Buffer", value: -8, type: "negative" }
      ];
    } else if (symbol === 'IRFC_PENNY') {
      if (demoStep >= 10) {
        return [
          { name: "Volume Acceleration", value: 42, type: "positive" },
          { name: "Sentiment Mismatch", value: 28, type: "positive" },
          { name: "Shell Company Nodes", value: 22, type: "positive" },
          { name: "Float Cornering Factor", value: 12, type: "positive" }
        ];
      } else if (demoStep >= 7) {
        return [
          { name: "Price Acceleration", value: 24, type: "positive" },
          { name: "Sentiment Contrast", value: 18, type: "positive" },
          { name: "Volume Deviation", value: 15, type: "positive" },
          { name: "Network Centrality", value: -4, type: "negative" }
        ];
      } else if (demoStep >= 4) {
        return [
          { name: "Volume Deviation", value: 20, type: "positive" },
          { name: "Price Momentum", value: 10, type: "positive" },
          { name: "Sentiment Alignment", value: -5, type: "negative" },
          { name: "Network Centrality", value: -2, type: "negative" }
        ];
      }
    }
    return [
      { name: "Volume Variance", value: 4, type: "positive" },
      { name: "Price Momentum", value: -3, type: "negative" },
      { name: "Sentiment Concordance", value: -8, type: "negative" },
      { name: "Network Centrality", value: -1, type: "negative" }
    ];
  };

  const shapFeatures = getShapFeatures();
  const agreementList = getModelAgreements();
  const naturalLanguageReason = getNaturalExplanation();

  return (
    <div className="terminal-card rounded-lg p-4 h-[410px] flex flex-col justify-between overflow-y-auto font-mono text-[9px] relative">
      <div className="scanline-overlay" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-borderblue pb-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-cyanneon animate-pulse" />
          <h2 className="heading-syne font-extrabold text-[10px] tracking-widest text-slate-100 uppercase">
            Explainable AI (XAI) Panel
          </h2>
        </div>
        <span className="text-[8px] font-mono bg-borderblue px-2 py-0.5 rounded text-indigo-300 font-extrabold tracking-wider uppercase">
          Decision Audit
        </span>
      </div>

      {/* Why AI Flagged This Section */}
      <div className={`p-2.5 rounded border text-[9px] leading-relaxed mb-2.5 ${
        isAnomalous 
          ? 'bg-red-500/5 border-red-500/25 text-red-300' 
          : 'bg-[#0a101f] border-borderblue/80 text-slate-300'
      }`}>
        <div className="flex items-center gap-1.5 font-black mb-1 uppercase tracking-wider text-[8.5px] border-b border-white/5 pb-1">
          <AlertCircle className={`w-3.5 h-3.5 ${isAnomalous ? 'text-redalert' : 'text-cyanneon'}`} />
          <span>Why AI Flagged This ({symbol})</span>
        </div>
        <p className="font-sans font-medium text-slate-100 italic leading-snug">
          "{naturalLanguageReason}"
        </p>
      </div>

      {/* Quant Gauges Section */}
      <div className="grid grid-cols-2 gap-3 mb-3 bg-black/25 border border-borderblue/35 p-2 rounded">
        <div>
          <div className="text-slate-400 font-bold mb-1 uppercase text-[7.5px] flex items-center gap-1">
            <Server className="w-3 h-3 text-indigo-400" />
            <span>Anomaly Score Meter</span>
          </div>
          <div className="flex items-center justify-between">
            {renderSegmentedBar(
              anomalyScore, 
              isAnomalous ? 'bg-redalert shadow-glowRed' : 'bg-greenok shadow-glowGreen'
            )}
            <span className={`font-black ml-1.5 text-[10px] ${isAnomalous ? 'text-redalert' : 'text-greenok'}`}>
              {(anomalyScore * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div>
          <div className="text-slate-400 font-bold mb-1 uppercase text-[7.5px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Confidence Gauge</span>
          </div>
          <div className="flex items-center justify-between">
            {renderSegmentedBar(
              confidence, 
              'bg-cyanneon shadow-glowCyan'
            )}
            <span className="font-black text-cyanneon ml-1.5 text-[10px]">
              {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* SHAP Feature Contribution Bars */}
      <div className="space-y-1.5 mb-3">
        <div className="text-[8px] text-slate-400 uppercase font-black tracking-wider border-b border-white/5 pb-0.5 mb-1.5">
          SHAP Feature Contributions
        </div>
        
        {shapFeatures.map((f, i) => {
          const isPos = f.type === 'positive';
          const absVal = Math.abs(f.value);
          
          return (
            <div key={i} className="flex items-center justify-between text-[8px] gap-2">
              <span className="text-slate-300 w-24 truncate font-medium">{f.name}</span>
              
              {/* SHAP center-split style visualization */}
              <div className="flex-grow h-2 bg-[#05070f] rounded-sm relative border border-white/5 overflow-hidden flex">
                <div className="w-1/2 h-full border-r border-slate-700/60" />
                <div 
                  className={`h-full absolute top-0 ${isPos ? 'bg-redalert/85 left-1/2' : 'bg-greenok/85 right-1/2'}`}
                  style={{ 
                    width: `${absVal / 2}%`,
                    left: isPos ? '50%' : 'auto',
                    right: !isPos ? '50%' : 'auto'
                  }}
                />
              </div>

              <span className={`w-8 text-right font-black ${isPos ? 'text-redalert' : 'text-greenok'}`}>
                {isPos ? '+' : '-'}{absVal}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Model Agreement Consensus Checklist */}
      <div className="border-t border-borderblue/35 pt-2">
        <div className="text-[8px] text-slate-400 uppercase font-black tracking-wider mb-1.5">
          Model Agreement Consensus
        </div>
        <div className="grid grid-cols-2 gap-2 text-[7.5px] uppercase font-bold">
          {agreementList.map((ag, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between p-1 border rounded-[3px] ${
                ag.state === 'danger'
                  ? 'bg-red-500/5 border-red-500/20 text-redalert'
                  : 'bg-greenok/5 border-greenok/10 text-greenok'
              }`}
            >
              <span>{ag.model}</span>
              <span className="font-black tracking-widest text-[7px] bg-black/40 px-1 py-0.5 rounded flex items-center gap-0.5">
                {ag.state === 'danger' ? (
                  <XCircle className="w-2.5 h-2.5 text-redalert" />
                ) : (
                  <CheckCircle2 className="w-2.5 h-2.5 text-greenok" />
                )}
                {ag.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
