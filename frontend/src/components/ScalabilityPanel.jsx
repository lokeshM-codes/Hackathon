import React from 'react';
import { Cpu, Zap, Server, Activity, Hourglass } from 'lucide-react';

export default function ScalabilityPanel({ metrics }) {
  const throughput = metrics.throughput || 450.0;
  const latency = metrics.latency || 12.0;
  const activeStreams = metrics.active_streams || 24;
  const uptimeSeconds = metrics.uptime_seconds || 86400;
  const inferenceMs = metrics.model_inference_ms || 4.2;

  const formatUptime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="w-full bg-[#060913] border-t border-borderblue px-6 py-3.5 mt-auto z-40 shadow-2xl">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-2">
        
        {/* Throughput */}
        <div className="flex items-center gap-3.5 border-r border-borderblue/35 last:border-0 pr-4">
          <Zap className="w-4 h-4 text-cyanneon animate-pulse" />
          <div className="font-mono">
            <span className="text-[8.5px] text-slate-400 uppercase font-black tracking-wider block">Throughput</span>
            <span className="text-[13px] font-black text-white tracking-wide">
              <span className="mono-numbers">{throughput.toFixed(1)}</span> <span className="text-[10px] text-slate-400">TPS</span>
            </span>
          </div>
        </div>

        {/* Latency */}
        <div className="flex items-center gap-3.5 border-r border-borderblue/35 last:border-0 pr-4">
          <Hourglass className="w-4 h-4 text-purplemagic" />
          <div className="font-mono">
            <span className="text-[8.5px] text-slate-400 uppercase font-black tracking-wider block">Surveillance Latency</span>
            <span className="text-[13px] font-black text-white tracking-wide">
              <span className="mono-numbers">{latency.toFixed(1)}</span> <span className="text-[10px] text-slate-400">ms</span>
            </span>
          </div>
        </div>

        {/* Model Inference */}
        <div className="flex items-center gap-3.5 border-r border-borderblue/35 last:border-0 pr-4">
          <Cpu className="w-4 h-4 text-greenok" />
          <div className="font-mono">
            <span className="text-[8.5px] text-slate-400 uppercase font-black tracking-wider block">Model Inference</span>
            <span className="text-[13px] font-black text-[#00FF88] tracking-wide">
              <span className="mono-numbers">{inferenceMs.toFixed(1)}</span> <span className="text-[10px] text-greenok/70">ms</span>
            </span>
          </div>
        </div>

        {/* Active Streams */}
        <div className="flex items-center gap-3.5 border-r border-borderblue/35 last:border-0 pr-4">
          <Server className="w-4 h-4 text-amberwarn" />
          <div className="font-mono">
            <span className="text-[8.5px] text-slate-400 uppercase font-black tracking-wider block">Active Feeds</span>
            <span className="text-[13px] font-black text-white tracking-wide">
              <span className="mono-numbers">{activeStreams}</span> <span className="text-[10px] text-slate-400">NSE Streams</span>
            </span>
          </div>
        </div>

        {/* Uptime */}
        <div className="flex items-center gap-3.5 col-span-2 md:col-span-1 pr-4">
          <Activity className="w-4 h-4 text-cyanneon" />
          <div className="font-mono">
            <span className="text-[8.5px] text-slate-400 uppercase font-black tracking-wider block">System Uptime</span>
            <span className="text-[13px] font-black text-white tracking-wide mono-numbers">
              {formatUptime(uptimeSeconds)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
