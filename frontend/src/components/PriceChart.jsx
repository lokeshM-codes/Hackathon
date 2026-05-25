import React from 'react';
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function PriceChart({ stocks, selectedSymbol, history, onSelectStock }) {
  
  const handleStockChange = (e) => {
    onSelectStock(e.target.value);
  };

  const formatXAxis = (tickItem) => {
    try {
      const d = new Date(tickItem);
      // Display seconds to ensure unique timestamps for every 3-second tick
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return tickItem;
    }
  };

  const formatTooltip = (value, name) => {
    if (name === "Price") return [`₹${value.toLocaleString()}`, "Price"];
    if (name === "Volume") return [value.toLocaleString(), "Volume"];
    return [value, name];
  };

  const currentStock = stocks.find(s => s.symbol === selectedSymbol) || {};
  const isUp = currentStock.change_percent >= 0;
  const strokeColor = isUp ? '#00FF88' : '#FF4444';
  const fillGradient = isUp ? 'url(#greenGradient)' : 'url(#redGradient)';

  const latestPrice = history[history.length - 1]?.price;
  const maxVolume = history.length ? Math.max(...history.map(h => h.volume)) : 100000;

  // Custom Dot Renderer for flagged anomalies
  const RenderAnomalyDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.is_anomaly || payload.anomaly_score >= 0.75) {
      return (
        <svg key={`dot-${payload.timestamp}-${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={6} fill="#FF4444" stroke="#05070f" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={11} fill="none" stroke="#FF4444" strokeWidth={1.5} className="animate-ping" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="terminal-card rounded-lg p-4 h-[410px] flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-borderblue pb-2 mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyanneon animate-pulse" />
          <h2 className="heading-syne font-extrabold text-[10px] tracking-widest text-slate-100 uppercase">
            Market Inspector
          </h2>
        </div>

        {/* Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-indigo-300 font-bold uppercase tracking-wider">Symbol:</span>
          <select
            value={selectedSymbol}
            onChange={handleStockChange}
            className="bg-[#05070f] border border-borderblue text-white rounded px-2 py-0.5 text-[10px] font-mono font-bold focus:outline-none focus:border-cyanneon cursor-pointer"
          >
            {stocks.map(s => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} ({s.change_percent >= 0 ? '+' : ''}{s.change_percent.toFixed(1)}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Specs */}
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

      {/* Area Chart with dynamic gradient fills */}
      <div className="flex-1 w-full min-h-0 mt-1">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500">
            Waiting for ticker feed...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="95%">
            <ComposedChart data={history} margin={{ top: 10, right: 5, left: -22, bottom: 5 }}>
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4444" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#FF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
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
              
              {/* Hide the Volume axis, scale its domain so bars stay at bottom 20% */}
              <YAxis 
                yAxisId="volume" 
                orientation="right" 
                domain={[0, maxVolume * 5]} 
                hide 
              />

              <Tooltip
                contentStyle={{ background: '#0A101E', borderColor: '#263757', borderRadius: '4px' }}
                labelStyle={{ color: '#A5B4FC', fontFamily: 'JetBrains Mono', fontSize: '9px' }}
                itemStyle={{ color: '#FFF', fontFamily: 'JetBrains Mono', fontSize: '10px' }}
                formatter={formatTooltip}
              />
              
              {/* Mini Volume Bars */}
              <Bar 
                yAxisId="volume" 
                dataKey="volume" 
                fill={isUp ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 68, 68, 0.15)'}
                stroke={isUp ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)'}
                barSize={8}
              />
              
              {/* Main Area Chart */}
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill={fillGradient}
                dot={<RenderAnomalyDot />}
                activeDot={{ r: 5, fill: strokeColor, stroke: '#05070f', strokeWidth: 1.5 }}
                name="Price"
              />

              {/* Glowing Live Price Marker Reference Line */}
              {latestPrice && (
                <ReferenceLine
                  yAxisId="price"
                  y={latestPrice}
                  stroke={strokeColor}
                  strokeDasharray="3 3"
                  label={{
                    value: `Live: ₹${latestPrice}`,
                    fill: strokeColor,
                    position: 'insideRight',
                    fontSize: 8,
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 'bold',
                    className: 'bg-black px-1 rounded'
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
