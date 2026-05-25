import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SENTIMENT_COLORS = {
  positive: { text: 'text-greenok', bg: 'bg-greenok/10', border: 'border-greenok/30', icon: TrendingUp },
  negative: { text: 'text-redalert', bg: 'bg-redalert/10', border: 'border-redalert/30', icon: TrendingDown },
  neutral: { text: 'text-amberwarn', bg: 'bg-amberwarn/10', border: 'border-amberwarn/30', icon: Minus },
};

function SentimentIcon({ label, size = 'w-4 h-4' }) {
  const config = SENTIMENT_COLORS[label] || SENTIMENT_COLORS.neutral;
  const Icon = config.icon;
  return <Icon className={`${size} ${config.text}`} />;
}

export default function MarketSentimentCard({
  sentimentScore = 0,
  sentimentLabel = 'neutral',
  feeds = [],
  mismatchDetected = false,
  anomalyScore = 0.08,
  probability = 0.04,
}) {
  const sentConfig = SENTIMENT_COLORS[sentimentLabel] || SENTIMENT_COLORS.neutral;
  const scorePercent = ((sentimentScore + 1) / 2 * 100).toFixed(0);
  const hasAnomaly = anomalyScore >= 0.5 || probability >= 0.5;

  return (
    <div className="glass-panel rounded-xl p-4 font-mono h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyanneon" />
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Market Sentiment</h3>
        </div>
        {mismatchDetected && (
          <span className="text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-wider bg-redalert/15 text-redalert border border-redalert/30 animate-pulse">
            DIVERGENCE
          </span>
        )}
      </div>

      <div className={`${sentConfig.bg} ${sentConfig.border} rounded-lg p-3 border mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SentimentIcon label={sentimentLabel} size="w-5 h-5" />
            <span className={`text-sm font-black uppercase tracking-wider ${sentConfig.text}`}>
              {sentimentLabel}
            </span>
          </div>
          <span className={`text-lg font-black ${sentConfig.text}`}>
            {sentimentScore > 0 ? '+' : ''}{sentimentScore.toFixed(2)}
          </span>
        </div>
        <div className="mt-2 w-full h-1.5 bg-[#101726] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${sentConfig.text.replace('text', 'bg')}`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      {hasAnomaly && (
        <div className="bg-redalert/10 border border-redalert/25 rounded-lg px-3 py-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-redalert animate-pulse" />
            <span className="text-[9px] font-bold text-redalert uppercase tracking-wider">
              Anomaly Alert: {(anomalyScore * 100).toFixed(0)}% confidence
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-borderblue">
        {feeds.length === 0 ? (
          <div className="text-[9px] text-slate-600 text-center py-4">No recent news feeds</div>
        ) : (
          feeds.slice(0, 5).map((feed, i) => (
            <div key={i} className="bg-[#05070f]/60 border border-borderblue/40 rounded-lg p-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[9px] text-slate-300 font-semibold leading-tight flex-1 line-clamp-2">
                  {feed.title}
                </p>
                {feed.score !== undefined && (
                  <span className={`text-[8px] font-black flex-shrink-0 px-1.5 py-0.5 rounded ${
                    feed.score > 0.15 ? 'text-greenok bg-greenok/10' :
                    feed.score < -0.15 ? 'text-redalert bg-redalert/10' :
                    'text-slate-400 bg-slate-400/10'
                  }`}>
                    {feed.score > 0 ? '+' : ''}{feed.score.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[7px] text-slate-600 font-bold">{feed.source || 'News'}</span>
                {feed.timestamp && (
                  <span className="text-[7px] text-slate-600">
                    {new Date(feed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}