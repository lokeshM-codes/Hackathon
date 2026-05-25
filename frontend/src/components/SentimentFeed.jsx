import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { Newspaper, MessageSquare, AlertCircle, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function SentimentFeed({ sentimentData, mismatchDetected }) {
  const [activeTab, setActiveTab] = useState('all');

  const feeds = sentimentData.feeds || [];
  const score = sentimentData.score || 0.0;
  const label = sentimentData.label || 'neutral';

  const newsFeed = feeds.filter(f => f.source === 'News');
  const socialFeed = feeds.filter(f => f.source !== 'News');

  const filteredFeeds = activeTab === 'all' 
    ? feeds 
    : activeTab === 'news' ? newsFeed : socialFeed;

  const getSentimentBadge = (sent) => {
    switch (sent) {
      case 'positive':
        return <span className="bg-emerald-500/15 border border-emerald-500/40 text-greenok text-[9px] font-black px-2 py-0.5 rounded tracking-wide">POS</span>;
      case 'negative':
        return <span className="bg-rose-500/15 border border-rose-500/40 text-redalert text-[9px] font-black px-2 py-0.5 rounded tracking-wide">NEG</span>;
      default:
        return <span className="bg-slate-500/15 border border-slate-500/30 text-slate-300 text-[9px] font-black px-2 py-0.5 rounded tracking-wide">NEU</span>;
    }
  };

  const sparklineData = feeds.slice().reverse().map((f, i) => ({
    id: i,
    score: f.score
  }));

  return (
    <div className="terminal-card rounded-lg p-5 h-[410px] flex flex-col justify-between relative overflow-hidden">
      {/* High-intensity mismatch alert warning */}
      {mismatchDetected && (
        <div className="absolute top-0 left-0 w-full bg-redalert/20 border-b border-redalert/50 text-redalert px-5 py-2.5 text-[10px] font-black tracking-widest font-mono flex items-center justify-center gap-2 critical-flash-card z-20 shadow-md">
          <AlertCircle className="w-4 h-4 animate-bounce" />
          <span>DIVERGENCE ALARM: PRICE CLIMBING WHILE SENTIMENT PLUMMETS</span>
        </div>
      )}

      {/* Header */}
      <div className={`flex items-center justify-between border-b border-borderblue/80 pb-3 mb-3 ${mismatchDetected ? 'mt-7' : ''}`}>
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-cyanneon" />
          <h2 className="heading-syne font-extrabold text-xs tracking-widest text-white uppercase">
            News & Social Signals
          </h2>
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-[#0D1426] border border-borderblue/80 rounded p-0.5 z-10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 text-[9px] font-mono rounded-sm transition-all duration-200 ${activeTab === 'all' ? 'bg-cyanneon/15 border border-cyanneon/40 text-cyanneon font-black' : 'text-slate-400 hover:text-white'}`}
          >
            ALL ({feeds.length})
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1 text-[9px] font-mono rounded-sm transition-all duration-200 ${activeTab === 'news' ? 'bg-cyanneon/15 border border-cyanneon/40 text-cyanneon font-black' : 'text-slate-400 hover:text-white'}`}
          >
            NEWS ({newsFeed.length})
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-3 py-1 text-[9px] font-mono rounded-sm transition-all duration-200 ${activeTab === 'social' ? 'bg-cyanneon/15 border border-cyanneon/40 text-cyanneon font-black' : 'text-slate-400 hover:text-white'}`}
          >
            SOCIAL ({socialFeed.length})
          </button>
        </div>
      </div>

      {/* Score and Mini Sparkline */}
      <div className="flex items-center gap-4 bg-[#0D1426]/60 border border-borderblue/60 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded flex items-center justify-center font-black mono-numbers text-sm border-2 ${
            score > 0.15 ? 'bg-emerald-500/10 border-emerald-500/40 text-greenok shadow-glowGreen' : (score < -0.15 ? 'bg-rose-500/10 border-rose-500/40 text-redalert shadow-glowRed' : 'bg-slate-500/10 border-slate-500/30 text-slate-400')
          }`}>
            {score > 0 ? '+' : ''}{score.toFixed(1)}
          </div>
          <div>
            <div className="text-[8px] font-mono text-slate-400 uppercase font-bold tracking-wider">Aggregate</div>
            <div className="text-[10px] font-extrabold text-white uppercase flex items-center gap-1 font-heading">
              {label} {score > 0.15 ? <ArrowUpRight className="w-3.5 h-3.5 text-greenok" /> : (score < -0.15 ? <ArrowDownRight className="w-3.5 h-3.5 text-redalert" /> : '')}
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex-1 h-9">
          {sparklineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <YAxis domain={[-1, 1]} hide />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke={score > 0.15 ? '#00FF88' : (score < -0.15 ? '#FF4444' : '#00F5FF')} 
                  fill={score > 0.15 ? 'rgba(0, 255, 136, 0.08)' : (score < -0.15 ? 'rgba(255, 68, 68, 0.08)' : 'rgba(0, 245, 255, 0.08)')}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-[9px] font-mono text-slate-500">No trend indicators.</span>
          )}
        </div>
      </div>

      {/* Feed List Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {filteredFeeds.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <MessageSquare className="w-6 h-6 text-slate-500 mb-2" />
            <p className="text-[10px] text-slate-400 font-mono">No matching feed items.</p>
          </div>
        ) : (
          filteredFeeds.map((feed) => (
            <div key={feed.id || `${feed.title}-${feed.timestamp}`} className="bg-[#0D1426]/40 border border-borderblue/55 rounded-lg p-3 hover:border-cyanneon/30 transition-all duration-200">
              {/* Meta */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-bold text-slate-200 bg-borderblue px-2 py-0.5 rounded border border-white/5 font-mono">
                    {feed.source}
                  </span>
                  {getSentimentBadge(feed.sentiment)}
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {new Date(feed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Title & Body */}
              <h4 className="text-[11px] font-extrabold text-white mb-1.5 leading-snug font-heading tracking-wide">
                {feed.title}
              </h4>
              <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans font-medium">
                {feed.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
