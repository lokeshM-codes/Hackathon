import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const SIGNAL_CONFIG = {
  STRONG_BUY: { label: 'STRONG BUY', color: 'text-greenok', bg: 'bg-greenok/15', border: 'border-greenok/40', glow: 'shadow-glowGreen' },
  BUY: { label: 'BUY', color: 'text-emerald-400', bg: 'bg-emerald-400/12', border: 'border-emerald-400/35', glow: '' },
  HOLD: { label: 'HOLD', color: 'text-amberwarn', bg: 'bg-amberwarn/12', border: 'border-amberwarn/35', glow: '' },
  SELL: { label: 'SELL', color: 'text-redalert', bg: 'bg-redalert/12', border: 'border-redalert/35', glow: '' },
  STRONG_SELL: { label: 'STRONG SELL', color: 'text-red-600', bg: 'bg-red-600/15', border: 'border-red-600/40', glow: 'shadow-glowRed' },
};

function getSignal(anomalyScore, probability) {
  if (anomalyScore >= 0.7 || probability >= 0.7) return SIGNAL_CONFIG.STRONG_SELL;
  if (anomalyScore >= 0.5 || probability >= 0.5) return SIGNAL_CONFIG.SELL;
  if (anomalyScore <= 0.15 && probability <= 0.2) return SIGNAL_CONFIG.STRONG_BUY;
  if (anomalyScore <= 0.3 && probability <= 0.35) return SIGNAL_CONFIG.BUY;
  return SIGNAL_CONFIG.HOLD;
}

export default function StockHeader({
  symbol,
  companyName,
  currentPrice,
  changePercent,
  high,
  low,
  open,
  volume,
  previousClose,
  anomalyScore = 0.08,
  probability = 0.04,
  confidence = 0.9,
  isLiveMarket,
}) {
  const isUp = changePercent >= 0;
  const changeColor = isUp ? 'text-greenok' : 'text-redalert';
  const arrowIcon = isUp
    ? <TrendingUp className="w-5 h-5" />
    : <TrendingDown className="w-5 h-5" />;
  const signal = getSignal(anomalyScore, probability);

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-lg px-3 py-2">
          {isLiveMarket && (
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-greenok opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-greenok" />
            </span>
          )}
          <span className="text-lg font-black text-white tracking-tight">{symbol}</span>
        </div>
        <div className="hidden sm:block">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Company</div>
          <div className="text-sm font-semibold text-slate-200">{companyName}</div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Market Price</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white tabular-nums tracking-tight">
              {currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center gap-1 ${changeColor} bg-opacity-20 px-2 py-0.5 rounded-md text-sm font-extrabold ${isUp ? 'bg-greenok/10' : 'bg-redalert/10'}`}>
              {arrowIcon}
              <span>{isUp ? '+' : ''}{changePercent?.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className={`px-3 py-2 rounded-lg border ${signal.bg} ${signal.border} ${signal.glow} text-center`}>
          <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">AI Signal</div>
          <div className={`text-xs font-black ${signal.color} tracking-wider`}>{signal.label}</div>
        </div>
      </div>

      <div className="w-full flex flex-wrap gap-x-6 gap-y-1 mt-2 text-[10px] text-slate-400 border-t border-borderblue/40 pt-3">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-cyanneon" />
          <span className="font-bold text-slate-500">O:</span>
          <span className="font-semibold text-slate-200">{open?.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-greenok">H:</span>
          <span className="font-semibold text-slate-200">{high?.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-redalert">L:</span>
          <span className="font-semibold text-slate-200">{low?.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500">C:</span>
          <span className="font-semibold text-slate-200">{previousClose?.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-purplemagic">Vol:</span>
          <span className="font-semibold text-slate-200">{volume?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}