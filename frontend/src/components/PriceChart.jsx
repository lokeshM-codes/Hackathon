import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Line } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

export default function PriceChart({ stocks, selectedSymbol, history, onSelectStock, isLiveMarket, isLoading, error, fallbackWarning }) {
  
  const handleStockChange = (e) => {
    onSelectStock(e.target.value);
  };

  const formatXAxis = (tickItem) => {
    try {
      const d = new Date(tickItem);
      // For daily live candles, show date instead of time
      if (isLiveMarket) {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return tickItem;
    }
  };

  const currentStock = stocks.find(s => s.symbol === selectedSymbol) || {};
  const isUp = currentStock.change_percent >= 0;
  const themeColor = isUp ? '#00FF88' : '#FF4444';

  // Convert raw price ticks into candlestick data (Open, Close, High, Low)
  const candleHistory = history.map((h, index) => {
    const close = h.price;
    const open = h.open !== undefined ? h.open : (index > 0 ? history[index - 1].price : h.price);
    const high = h.high !== undefined ? h.high : (Math.max(open, close) + (Math.random() * (Math.abs(close - open) || close * 0.0006) * 0.5));
    const low = h.low !== undefined ? h.low : (Math.min(open, close) - (Math.random() * (Math.abs(close - open) || close * 0.0006) * 0.5));
    const isGreen = close >= open;

    return {
      ...h,
      open,
      close,
      high,
      low,
      bodyRange: [Math.min(open, close), Math.max(open, close)],
      wickRange: [low, high],
      isGreen
    };
  });

  const latestPrice = history[history.length - 1]?.price;
  const maxVolume = history.length ? Math.max(...history.map(h => h.volume)) : 100000;

  // Custom detailed candlestick tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const timeStr = isLiveMarket 
        ? new Date(data.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
        : new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return (
        <div className="bg-[#0A101E] border border-borderblue p-3 rounded-md shadow-2xl text-[10px] font-mono space-y-1 z-50">
          <div className="text-cyanneon font-black border-b border-white/5 pb-1 mb-1.5">{timeStr}</div>
          <div className="flex justify-between gap-5">
            <span className="text-slate-400">Open:</span>
            <span className="text-white font-bold">₹{data.open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-5">
            <span className="text-slate-400">High:</span>
            <span className="text-slate-300 font-bold">₹{data.high.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-5">
            <span className="text-slate-400">Low:</span>
            <span className="text-slate-300 font-bold">₹{data.low.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-5">
            <span className="text-slate-400">Close:</span>
            <span className="text-white font-bold">₹{data.close.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-5 border-t border-white/5 pt-1.5 mt-1.5">
            <span className="text-slate-400">Volume:</span>
            <span className="text-purplemagic font-extrabold">{data.volume.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Dot Renderer for anomalies overlay
  const RenderAnomalyDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.is_anomaly || payload.anomaly_score >= 0.75) {
      return (
        <svg key={`anomaly-${payload.timestamp}-${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={6} fill="#FF4444" stroke="#05070f" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={12} fill="none" stroke="#FF4444" strokeWidth={1.5} className="animate-ping" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="terminal-card rounded-lg p-4 h-[410px] flex flex-col justify-between overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-borderblue pb-2 mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyanneon animate-pulse" />
          <h2 className="heading-syne font-extrabold text-[10px] tracking-widest text-slate-100 uppercase">
            Market Candlestick Chart
          </h2>
        </div>

        {/* Dropdown or Search Selector */}
        <div className="flex items-center gap-2 font-mono">
          {isLiveMarket ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-[#00f5ff] font-bold uppercase tracking-wider">Search Symbol:</span>
              <input
                type="text"
                placeholder="e.g. AAPL, TSLA"
                defaultValue={selectedSymbol}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSelectStock(e.target.value.toUpperCase().trim());
                  }
                }}
                className="bg-[#05070f] border border-borderblue text-white rounded px-2.5 py-0.5 w-24 text-[10px] font-mono focus:outline-none focus:border-cyanneon placeholder-slate-600 font-bold"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">Inspect Stock:</span>
              <select
                value={selectedSymbol}
                onChange={handleStockChange}
                className="bg-[#05070f] border border-borderblue text-white rounded px-2.5 py-0.5 text-[10px] font-mono font-bold focus:outline-none focus:border-cyanneon cursor-pointer hover:border-white/20 transition-all duration-200"
              >
                {stocks.map(s => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol.replace('_PENNY', '')} ({s.change_percent >= 0 ? '+' : ''}{s.change_percent.toFixed(1)}%)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Stock specs */}
      <div className="flex items-baseline justify-between px-1 mb-1">
        <div>
          <span className="text-xl font-black heading-syne tracking-wide text-white mr-2">
            {selectedSymbol}
          </span>
          <span className="text-[10px] font-mono text-slate-400 font-bold">
            {currentStock.company_name}
          </span>
        </div>
        <div className="text-right font-mono">
          <span className="text-lg font-bold text-white mr-2">
            ₹{currentStock.current_price?.toLocaleString()}
          </span>
          <span
            className={`text-xs font-black ${
              isUp ? 'text-greenok' : 'text-redalert'
            }`}
          >
            {isUp ? '▲' : '▼'} {Math.abs(currentStock.change_percent || 0).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Fallback Warning Banner */}
      {fallbackWarning && !isLoading && !error && (
        <div className="mx-1 my-1 px-3 py-1.5 bg-[#FFB800]/10 border border-[#FFB800]/35 text-[#FFB800] text-[8px] font-mono rounded flex items-center gap-1.5 animate-pulse">
          <span className="font-extrabold flex-shrink-0">⚠️ API FALLBACK:</span>
          <span>{fallbackWarning}</span>
        </div>
      )}

      {/* Candlestick Composed Chart */}
      <div className="flex-1 w-full min-h-0 mt-1">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center font-mono text-[10px] text-redalert p-4 text-center gap-2">
            <span className="font-black text-xs">⚠️ Live Feed Error</span>
            <span>{error}</span>
          </div>
        ) : isLoading ? (
          <div className="h-full flex flex-col items-center justify-center font-mono text-[10px] text-cyanneon gap-2">
            <Activity className="w-5 h-5 animate-spin text-cyanneon" />
            <span>Fetching live stock ticks...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500">
            Waiting for ticker feed...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="95%">
            <ComposedChart data={candleHistory} margin={{ top: 10, right: 5, left: -22, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(38, 55, 87, 0.2)" vertical={false} />
              
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis} 
                stroke="#1E2A3A" 
                tick={{ fill: '#64748B', fontSize: 8, fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} 
              />
              
              <YAxis 
                yAxisId="price" 
                domain={['dataMin * 0.998', 'dataMax * 1.002']} 
                orientation="left"
                stroke="#1E2A3A" 
                tick={{ fill: '#64748B', fontSize: 8, fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}
              />
              
              <YAxis 
                yAxisId="volume" 
                orientation="right" 
                domain={[0, maxVolume * 5]} 
                hide 
              />

              <Tooltip content={<CustomTooltip />} />
              
              {/* Volume bars (bottom panel) */}
              <Bar 
                yAxisId="volume" 
                dataKey="volume" 
                fill={isUp ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 68, 68, 0.15)'}
                stroke={isUp ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)'}
                barSize={8}
              />
              
              {/* Candlestick Wicks (High to Low range) */}
              <Bar yAxisId="price" dataKey="wickRange" barSize={1.5} fill="none">
                {candleHistory.map((entry, index) => (
                  <Cell key={`wick-${index}`} fill={entry.isGreen ? '#00FF88' : '#FF4444'} stroke={entry.isGreen ? '#00FF88' : '#FF4444'} />
                ))}
              </Bar>

              {/* Candlestick Bodies (Open to Close range) */}
              <Bar yAxisId="price" dataKey="bodyRange" barSize={8} fill="none">
                {candleHistory.map((entry, index) => (
                  <Cell key={`body-${index}`} fill={entry.isGreen ? '#00FF88' : '#FF4444'} stroke={entry.isGreen ? '#00FF88' : '#FF4444'} />
                ))}
              </Bar>

              {/* Anomaly Dot Overlay (Close ticks) */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke="none"
                dot={<RenderAnomalyDot />}
                activeDot={false}
                name="Anomaly"
              />

              {/* Live Price line */}
              {latestPrice && (
                <ReferenceLine
                  yAxisId="price"
                  y={latestPrice}
                  stroke={themeColor}
                  strokeDasharray="3 3"
                  label={{
                    value: `Live: ₹${latestPrice.toFixed(2)}`,
                    fill: themeColor,
                    position: 'insideRight',
                    fontSize: 8,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 'bold',
                    className: 'bg-black px-1 rounded shadow-md'
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
