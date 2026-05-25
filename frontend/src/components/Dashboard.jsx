import React, { useState, useEffect, useCallback } from 'react';
import TopNavbar from './TopNavbar';
import AlertPanel from './AlertPanel';
import TradingViewChart from './TradingViewChart';
import StockHeader from './StockHeader';
import MarketSentimentCard from './MarketSentimentCard';
import Heatmap from './Heatmap';
import InsiderGraph from './InsiderGraph';
import AIExplanation from './AIExplanation';
import SocialSignals from './SocialSignals';
import ScalabilityPanel from './ScalabilityPanel';
import DemoControls from './DemoControls';
import LiveController from './LiveController';
import * as api from '../services/api';
import { ShieldCheck, Award, Activity } from 'lucide-react';

function toLWT(time) {
  const d = new Date(time);
  return Math.floor(d.getTime() / 1000);
}

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('YES_BANK');
  const [stocks, setStocks] = useState([]);
  const [activeStockDetails, setActiveStockDetails] = useState({ stock: {}, history: [] });
  const [alerts, setAlerts] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [sentimentData, setSentimentData] = useState({ feeds: [], score: 0.0, label: 'neutral' });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [predictionData, setPredictionData] = useState({ top_factors: [] });
  const [socialData, setSocialData] = useState({});
  const [analytics, setAnalytics] = useState({ system_metrics: {} });
  const [crosshairData, setCrosshairData] = useState(null);

  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [isLiveMarket, setIsLiveMarket] = useState(false);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const [fallbackWarning, setFallbackWarning] = useState(null);

  let lastTime = 0;
  const candleData = Array.isArray(activeStockDetails.history) && activeStockDetails.history.length > 0
    ? activeStockDetails.history.map((h, index) => {
        const history = activeStockDetails.history;
        const close = Number(h.close || h.price) || 0;
        let open = h.open;
        let high = h.high;
        let low = h.low;

        // If open, high, low are not defined or are all equal to close, simulate realistic candles
        if (
          open === undefined ||
          high === undefined ||
          low === undefined ||
          (open === close && high === close && low === close)
        ) {
          if (index > 0) {
            open = Number(history[index - 1].close || history[index - 1].price) || close;
          } else {
            open = close * 0.998;
          }

          if (open === close) {
            open = close * 0.9995;
          }

          const maxOC = Math.max(open, close);
          const minOC = Math.min(open, close);
          const diff = maxOC - minOC;
          
          // Use a deterministic seed based on index to prevent flickering on re-renders
          const seed = (index + 1) * 35.79;
          const rand1 = Math.abs(Math.sin(seed));
          const rand2 = Math.abs(Math.cos(seed));

          high = maxOC + diff * 0.2 + close * 0.0015 * rand1;
          low = minOC - diff * 0.2 - close * 0.0015 * rand2;
        }

        // Parse time safely
        let time = toLWT(h.timestamp);
        if (isNaN(time) || time <= 0) {
          // fallback to sequential times if timestamp is invalid
          const baseTime = Math.floor(Date.now() / 1000) - (history.length - index) * 60;
          time = baseTime;
        }

        // Ensure time is strictly increasing to prevent lightweight-charts runtime crash
        if (time <= lastTime) {
          time = lastTime + 1;
        }
        lastTime = time;

        return {
          time,
          open: parseFloat(Number(open || close).toFixed(2)),
          high: parseFloat(Number(high || close).toFixed(2)),
          low: parseFloat(Number(low || close).toFixed(2)),
          close: parseFloat(Number(close).toFixed(2)),
          volume: Number(h.volume) || 0,
        };
      })
    : [];

  const handleToggleLiveMarket = (val) => {
    if (val) {
      setIsLoadingLive(true);
      setIsChartLoading(true);
      setChartError(null);
      setFallbackWarning(null);
      setIsDemoActive(false);
      setDemoStep(0);
      setSelectedSymbol('AAPL');
      setActiveStockDetails({ stock: {}, history: [] });
      setIsLiveMarket(true);
    } else {
      setIsLiveMarket(false);
      setIsChartLoading(false);
      setChartError(null);
      setFallbackWarning(null);
      setSelectedSymbol('YES_BANK');
      setActiveStockDetails({ stock: {}, history: [] });
    }
  };

  useEffect(() => {
    const loadData = () => {
      if (isLiveMarket) {
        if (activeStockDetails.history.length === 0 || activeStockDetails.stock.symbol !== selectedSymbol) {
          setIsChartLoading(true);
        }
        api.fetchLiveStock(selectedSymbol)
          .then(stockRes => {
            setIsLoadingLive(false);
            setIsChartLoading(false);
            setChartError(null);
            const stockData = stockRes.data;
            const normalizedHistory = Array.isArray(stockData.history)
              ? stockData.history.map(h => ({
                  ...h,
                  timestamp: h.timestamp || h.time || h.display_time || new Date().toISOString(),
                  time: h.time || h.display_time || h.timestamp || new Date().toISOString()
                }))
              : [];
            setFallbackWarning(stockData.fallback_warning || stockData.fallbackWarning || null);
            setActiveStockDetails({ stock: stockData.stock || {}, history: normalizedHistory });
            setAlerts(stockData.alerts || []);
            setSentimentData(stockData.sentiment || {});
            setStocks(prev => {
              const exists = prev.some(s => s.symbol === stockData.stock?.symbol);
              if (exists) {
                return prev.map(s => s.symbol === stockData.stock.symbol ? stockData.stock : s);
              }
              return stockData.stock ? [...prev, stockData.stock] : prev;
            });
            if (stockData.prediction) {
              setPredictionData(stockData.prediction);
            }
          })
          .catch(err => {
            setIsLoadingLive(false);
            setIsChartLoading(false);
            setFallbackWarning(null);
            const errMsg = err.response?.data?.detail || err.message;
            setChartError(errMsg);
          });

        api.fetchLivePrediction(selectedSymbol)
          .then(predRes => setPredictionData(predRes.data))
          .catch(() => {});

        api.fetchHeatmap(selectedSymbol, true).then(res => setHeatmapData(res.data));
        api.fetchGraph(selectedSymbol, true).then(res => setGraphData(res.data));
        api.fetchSocial(selectedSymbol).then(res => setSocialData(res.data));
        api.fetchAnalytics().then(res => {
          setAnalytics(res.data);
          if (api.getIsOffline()) {
            setIsOffline(true);
          } else {
            setIsOffline(false);
          }
        });
      } else {
        setIsChartLoading(false);
        setChartError(null);
        setFallbackWarning(null);
        api.fetchStocks().then(res => setStocks(res.data));
        api.fetchAlerts().then(res => setAlerts(res.data));
        api.fetchHeatmap(selectedSymbol, false).then(res => setHeatmapData(res.data));
        api.fetchGraph(selectedSymbol, false).then(res => setGraphData(res.data));
        api.fetchAnalytics().then(res => {
          setAnalytics(res.data);
          if (api.getIsOffline()) {
            const clientStep = api.getClientDemoStep();
            setDemoStep(clientStep);
            setIsDemoActive(clientStep > 0);
            setIsOffline(true);
          } else {
            setIsOffline(false);
            const serverStep = res.data.current_demo_step || 0;
            if (serverStep === 0) {
              setDemoStep(0);
              setIsDemoActive(false);
            } else if (!isDemoActive) {
              setDemoStep(serverStep);
              setIsDemoActive(true);
            }
          }
        });
        api.fetchStockDetails(selectedSymbol).then(res => setActiveStockDetails(res.data));
        api.fetchSentiment(selectedSymbol).then(res => setSentimentData(res.data));
        api.fetchPrediction(selectedSymbol).then(res => setPredictionData(res.data));
        api.fetchSocial(selectedSymbol).then(res => setSocialData(res.data));
      }
    };

    loadData();
    const interval = setInterval(loadData, isLiveMarket ? 5000 : 3000);
    return () => clearInterval(interval);
  }, [selectedSymbol, isLiveMarket, isDemoActive]);

  useEffect(() => {
    if (!isDemoActive || isLiveMarket || isOffline) return;

    const interval = setInterval(() => {
      if (demoStep < 12) {
        const nextStep = demoStep + 1;
        setDemoStep(nextStep);
        api.setDemoStep(nextStep).then(() => {
          api.fetchStockDetails('IRFC_PENNY').then(res => setActiveStockDetails(res.data));
          api.fetchAlerts().then(res => setAlerts(res.data));
          api.fetchAnalytics().then(res => setAnalytics(res.data));
          api.fetchSentiment('IRFC_PENNY').then(res => setSentimentData(res.data));
          api.fetchPrediction('IRFC_PENNY').then(res => setPredictionData(res.data));
          api.fetchSocial('IRFC_PENNY').then(res => setSocialData(res.data));
          api.fetchGraph('IRFC_PENNY', false).then(res => setGraphData(res.data));
          api.fetchHeatmap('IRFC_PENNY', false).then(res => setHeatmapData(res.data));
        }).catch(err => {
          console.error("Failed to advance demo step on backend:", err);
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isDemoActive, demoStep, isLiveMarket, isOffline]);

  const handleSelectStock = (symbol) => {
    setSelectedSymbol(symbol);
    if (isLiveMarket) {
      setIsChartLoading(true);
      setChartError(null);
      setFallbackWarning(null);
    }
  };

  const handleTriggerDemo = () => {
    api.triggerDemo().then(res => {
      setIsDemoActive(true);
      setDemoStep(1);
      setSelectedSymbol('IRFC_PENNY');
    });
  };

  const handleResetDemo = () => {
    api.resetDemo().then(() => {
      setIsDemoActive(false);
      setDemoStep(0);
      setSelectedSymbol('YES_BANK');
    });
  };

  const currentStock = activeStockDetails.stock || {};
  const stockPrediction = predictionData || {};

  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col relative font-mono select-none">

      <TopNavbar
        alertsCount={alerts.length}
        tradesCount={analytics.trades_analyzed || 124050}
        isDemoActive={isDemoActive}
        demoStep={demoStep}
        isOffline={isOffline}
        isLiveMarket={isLiveMarket}
        onToggleLiveMarket={handleToggleLiveMarket}
      />

      {demoStep === 12 && (
        <div className="w-full bg-[#00FF88]/20 border-y border-[#00FF88]/60 py-3.5 px-6 text-center shadow-glowGreen animate-pulse flex items-center justify-center gap-3.5 z-50">
          <Award className="w-6 h-6 text-greenok animate-bounce" />
          <span className="heading-syne font-black text-sm tracking-widest text-greenok uppercase">
            Surveillance Shield Active: ₹4.2 Crore Retail Investor Loss Prevented!
          </span>
          <ShieldCheck className="w-5 h-5 text-greenok" />
        </div>
      )}

      <main className="flex-1 p-4 xl:p-6 grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6 min-h-0 items-start">

        {/* === LEFT COLUMN (9/12) === */}
        <div className="xl:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">

          {isLiveMarket && (
            <div className="md:col-span-3">
              <StockHeader
                symbol={currentStock.symbol || selectedSymbol}
                companyName={currentStock.company_name || `${selectedSymbol} Corp.`}
                currentPrice={currentStock.current_price}
                changePercent={currentStock.change_percent}
                high={currentStock.high}
                low={currentStock.low}
                open={currentStock.open}
                volume={currentStock.volume}
                previousClose={currentStock.previous_close}
                anomalyScore={stockPrediction.anomaly_score}
                probability={stockPrediction.prediction_probability}
                confidence={stockPrediction.prediction_confidence}
                isLiveMarket={isLiveMarket}
              />
            </div>
          )}

          <div className="md:col-span-1">
            <AlertPanel
              alerts={alerts}
              selectedSymbol={selectedSymbol}
              onSelectStock={handleSelectStock}
            />
          </div>

          <div className="md:col-span-2">
            <div className="rounded-xl p-1 h-[420px] xl:h-[480px] flex flex-col border border-[#2a2e39] shadow-2xl" style={{ backgroundColor: '#131722' }}>
              <div className="flex items-center justify-between px-3 pt-3 pb-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyanneon animate-pulse" />
                  <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {isLiveMarket ? 'Live Candlestick Chart' : 'Price Chart'}
                  </h2>
                </div>
                {isLiveMarket ? (
                  <input
                    type="text"
                    placeholder="e.g. AAPL, TSLA"
                    defaultValue={selectedSymbol}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSelectStock(e.target.value.toUpperCase().trim());
                      }
                    }}
                    className="bg-[#1c2030] border border-[#2a2e39] text-white rounded px-2.5 py-0.5 w-20 text-[10px] font-mono focus:outline-none focus:border-cyanneon placeholder-slate-600 font-bold"
                  />
                ) : (
                  <select
                    value={selectedSymbol}
                    onChange={(e) => handleSelectStock(e.target.value)}
                    className="bg-[#1c2030] border border-[#2a2e39] text-white rounded px-2.5 py-0.5 text-[10px] font-mono font-bold focus:outline-none focus:border-cyanneon cursor-pointer"
                  >
                    {stocks.map(s => (
                      <option key={s.symbol} value={s.symbol} className="bg-[#131722]">
                        {s.symbol.replace('_PENNY', '')} ({s.change_percent >= 0 ? '+' : ''}{s.change_percent?.toFixed(1)}%)
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex-1 px-1 pb-1">
                {chartError ? (
                  <div className="h-full flex flex-col items-center justify-center text-[10px] text-redalert p-4 text-center gap-2">
                    <span className="font-black text-xs">Live Feed Error</span>
                    <span>{chartError}</span>
                  </div>
                ) : isChartLoading || candleData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[10px] text-cyanneon gap-2">
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>{isChartLoading ? 'Fetching live stock ticks...' : 'Waiting for ticker feed...'}</span>
                  </div>
                ) : (
                  <TradingViewChart data={candleData} onCrosshairMove={setCrosshairData} />
                )}
                {fallbackWarning && !chartError && (
                  <div className="px-3 py-1.5 bg-[#FFB800]/10 border-t border-[#FFB800]/35 text-[#FFB800] text-[8px] font-mono flex items-center gap-1.5 animate-pulse">
                    <span className="font-extrabold">API FALLBACK:</span>
                    <span>{fallbackWarning}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <MarketSentimentCard
              sentimentScore={sentimentData.score}
              sentimentLabel={sentimentData.label}
              feeds={sentimentData.feeds}
              mismatchDetected={stockPrediction.mismatch_detected}
              anomalyScore={stockPrediction.anomaly_score}
              probability={stockPrediction.prediction_probability}
            />
          </div>

          <div className="md:col-span-1">
            <Heatmap
              heatmapData={heatmapData}
              selectedSymbol={selectedSymbol}
              onSelectStock={handleSelectStock}
            />
          </div>

          <div className="md:col-span-2">
            <InsiderGraph
              graphData={graphData}
              demoStep={demoStep}
            />
          </div>

          <div className="md:col-span-1">
            <AIExplanation
              predictionData={predictionData}
              isDemoActive={isDemoActive}
              demoStep={demoStep}
            />
          </div>

          <div className="md:col-span-1">
            <div className="glass-panel rounded-xl p-4 h-full font-mono">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Social Signals</h3>
              <SocialSignals socialData={socialData} />
            </div>
          </div>

        </div>

        {/* === RIGHT COLUMN (3/12) === */}
        <div className="xl:col-span-3">
          {isLiveMarket ? (
            <LiveController
              symbol={selectedSymbol}
              predictionData={predictionData}
              systemMetrics={analytics.system_metrics || {}}
              alertsCount={alerts.length}
              stockDetails={activeStockDetails.stock}
            />
          ) : (
            <DemoControls
              currentStep={demoStep}
              onTriggerDemo={handleTriggerDemo}
              onResetDemo={handleResetDemo}
            />
          )}
        </div>

      </main>

      <ScalabilityPanel
        metrics={analytics.system_metrics || {}}
      />

      {isLoadingLive && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 font-mono">
          <div className="p-8 border border-cyanneon/50 bg-[#060a16] rounded-md shadow-glowCyan flex flex-col items-center text-center gap-4">
            <Activity className="w-12 h-12 text-cyanneon animate-spin" />
            <div className="text-sm font-black text-white uppercase tracking-widest heading-syne animate-pulse">
              CONNECTING TO LIVE EXCHANGE...
            </div>
            <div className="text-[10px] text-slate-400 max-w-[280px] leading-relaxed">
              Establishing encrypted feed tunnel. Authenticating API keys and scanning target liquidity order boards...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}