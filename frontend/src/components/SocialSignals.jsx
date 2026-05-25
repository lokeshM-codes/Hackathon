import React from 'react';
import { MessageCircle, Share2, Flame, TrendingUp, AlertTriangle } from 'lucide-react';

const HYPE_KEYWORDS = [
  { term: "circuit lock", confidence: 0.95, count: 48, status: "critical" },
  { term: "to the moon", confidence: 0.89, count: 32, status: "critical" },
  { term: "multibagger", confidence: 0.81, count: 24, status: "warning" },
  { term: "easy double", confidence: 0.74, count: 18, status: "warning" },
  { term: "operator game", confidence: 0.65, count: 12, status: "info" }
];

export default function SocialSignals({ socialData }) {
  const velocity = socialData.mention_velocity || 1.0;
  const mentions = socialData.total_mentions_24h || 150;
  const trend = socialData.sentiment_trend || 'stable';
  const breakdown = socialData.platform_breakdown || { twitter: 90, reddit: 45, forums: 15 };

  const getTrendColor = (t) => {
    switch (t) {
      case 'divergent':
        return 'text-redalert bg-red-500/10 border-red-500/40 shadow-glowRed';
      case 'downward':
        return 'text-amberwarn bg-amber-500/10 border-amber-500/35';
      case 'upward':
        return 'text-greenok bg-green-500/10 border-green-500/35 shadow-glowGreen';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getVelocityColor = (v) => {
    if (v >= 10) return 'text-redalert animate-pulse';
    if (v >= 5) return 'text-amberwarn';
    return 'text-cyanneon';
  };

  return (
    <div className="terminal-card rounded-lg p-5 h-[410px] flex flex-col justify-between overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-borderblue/80 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-cyanneon" />
          <h2 className="heading-syne font-extrabold text-xs tracking-widest text-white uppercase">
            Hype Velocity
          </h2>
        </div>
        <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${getTrendColor(trend)}`}>
          Trend: {trend}
        </span>
      </div>

      {/* Main Stats: Acceleration Velocity & Total Mentions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0D1426] border border-borderblue/65 rounded-lg p-2.5 text-center font-mono">
          <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Hype Accel</div>
          <div className={`text-lg font-black flex items-center justify-center gap-1 mt-1 ${getVelocityColor(velocity)}`}>
            <Flame className="w-4 h-4" />
            <span>{velocity.toFixed(1)}x</span>
          </div>
        </div>

        <div className="bg-[#0D1426] border border-borderblue/65 rounded-lg p-2.5 text-center font-mono">
          <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">24h Volume</div>
          <div className="text-lg font-black text-white mt-1 flex items-center justify-center gap-1">
            <Share2 className="w-4 h-4 text-purplemagic" />
            <span>{mentions.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Channel Breakdown */}
      <div className="space-y-2 font-mono text-[9px] mb-4 border-b border-borderblue/35 pb-3">
        <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-cyanneon" />
          <span>Channel Breakdown</span>
        </div>
        {/* Twitter */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1 font-bold">
            <span>Twitter/X ({breakdown.twitter || 0})</span>
            <span className="text-white">
              {mentions > 0 ? ((breakdown.twitter / mentions) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#0A0E1A] rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-cyanneon rounded-full" 
              style={{ width: `${mentions > 0 ? (breakdown.twitter / mentions) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Reddit */}
        <div>
          <div className="flex justify-between text-slate-300 mb-1 font-bold">
            <span>Reddit ({breakdown.reddit || 0})</span>
            <span className="text-white">
              {mentions > 0 ? ((breakdown.reddit / mentions) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#0A0E1A] rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-purplemagic rounded-full" 
              style={{ width: `${mentions > 0 ? (breakdown.reddit / mentions) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flagged Coordinated Keywords tracker */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5">
        <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amberwarn" />
          <span>Coordinated Hype Flagged</span>
        </div>
        {HYPE_KEYWORDS.map((k, i) => {
          const isHighRisk = k.status === 'critical' && velocity >= 6.0;
          return (
            <div key={i} className="flex items-center justify-between bg-black/35 border border-borderblue/40 p-2 rounded font-mono text-[9px] hover:border-white/10 transition-all duration-200">
              <span className={`font-bold ${isHighRisk ? 'text-redalert animate-pulse' : 'text-slate-200'}`}>
                {k.term}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">c:{(k.confidence * 100).toFixed(0)}%</span>
                <span className="text-white bg-borderblue/80 px-1 py-0.2 rounded font-black">{isHighRisk ? k.count * 10 : k.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
