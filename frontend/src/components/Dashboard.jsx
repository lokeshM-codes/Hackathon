import React, { useState, useEffect } from 'react';
import TopNavbar from './TopNavbar';
import AlertPanel from './AlertPanel';
import PriceChart from './PriceChart';
import Heatmap from './Heatmap';
import InsiderGraph from './InsiderGraph';
import AIExplanation from './AIExplanation';
import SentimentFeed from './SentimentFeed';
import SocialSignals from './SocialSignals';
import ScalabilityPanel from './ScalabilityPanel';
import DemoControls from './DemoControls';
import LiveController from './LiveController';
import * as api from '../services/api';
import { ShieldCheck, Award, Activity } from 'lucide-react';

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
  
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [isLiveMarket, setIsLiveMarket] = useState(false);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const [fallbackWarning, setFallbackWarning] = useState(null);

  const handleToggleLiveMarket = (val) => {
    if (val) {
      setIsLoadingLive(true);
      setIsChartLoading(true);
      setChartError(null);
      setFallbackWarning(null);
      // Disable demo if running
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
  // Core surveillance polling loop (ticks every 3 seconds)
  useEffect(() => {
    const loadData = () => {
      if (isLiveMarket) {
        // Fetch Live Market Data from Finnhub via backend
        if (activeStockDetails.history.length === 0 || activeStockDetails.stock.symbol !== selectedSymbol) {
          setIsChartLoading(true);
        }
        api.fetchLiveStock(selectedSymbol)
          .then(res => {
            setIsLoadingLive(false);
            setIsChartLoading(false);
            setChartError(null);
            const data = res.data;
            setFallbackWarning(data.fallback_warning);
            setActiveStockDetails({ stock: data.stock, history: data.history });
            setPredictionData(data.prediction);
            setAlerts(data.alerts);
            setSentimentData(data.sentiment);
            setStocks(prev => {
              const exists = prev.some(s => s.symbol === data.stock.symbol);
              if (exists) {
                return prev.map(s => s.symbol === data.stock.symbol ? data.stock : s);
              }
              return [...prev, data.stock];
            });
          })
          .catch(err => {
            setIsLoadingLive(false);
            setIsChartLoading(false);
            setFallbackWarning(null);
            const errMsg = err.response?.data?.detail || err.message;
            setChartError(errMsg);
            setIsLiveMarket(false);
            setSelectedSymbol('YES_BANK');
            alert(`Live Market Connection Failed: ${errMsg}. Reverting to Demo Mode.`);
          });

        // Heatmap & Graph can still query normally in background
        api.fetchHeatmap().then(res => setHeatmapData(res.data));
        api.fetchGraph().then(res => setGraphData(res.data));
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
        // Fetch normal simulated/demo data
        api.fetchStocks().then(res => setStocks(res.data));
        api.fetchAlerts().then(res => setAlerts(res.data));
        api.fetchHeatmap().then(res => setHeatmapData(res.data));
        api.fetchGraph().then(res => setGraphData(res.data));
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
            setDemoStep(serverStep);
            setIsDemoActive(serverStep > 0);
          }
        });

        api.fetchStockDetails(selectedSymbol).then(res => setActiveStockDetails(res.data));
        api.fetchSentiment(selectedSymbol).then(res => setSentimentData(res.data));
        api.fetchPrediction(selectedSymbol).then(res => setPredictionData(res.data));
        api.fetchSocial(selectedSymbol).then(res => setSocialData(res.data));
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [selectedSymbol, isLiveMarket]);
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

  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col relative font-mono select-none crt-effect">
      
      {/* 1. TOP NAVBAR */}
      <TopNavbar 
        alertsCount={alerts.length}
        tradesCount={analytics.trades_analyzed || 124050}
        isDemoActive={isDemoActive}
        demoStep={demoStep}
        isOffline={isOffline}
        isLiveMarket={isLiveMarket}
        onToggleLiveMarket={handleToggleLiveMarket}
      />

      {/* 2. DEMO LOSS PREVENTION OVERLAY BANNER */}
      {demoStep === 12 && (
        <div className="w-full bg-[#00FF88]/20 border-y border-[#00FF88]/60 py-3.5 px-6 text-center shadow-glowGreen animate-pulse flex items-center justify-center gap-3.5 z-50">
          <Award className="w-6 h-6 text-greenok animate-bounce" />
          <span className="heading-syne font-black text-sm tracking-widest text-greenok uppercase">
            Surveillance Shield Active: ₹4.2 Crore Retail Investor Loss Prevented!
          </span>
          <ShieldCheck className="w-5 h-5 text-greenok" />
        </div>
      )}

      {/* 3. CORE PANEL GRID LAYOUT */}
      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0 items-start">
        
        {/* Main Dashboard - 3 rows grid taking 3/4 width */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ================== ROW 1 ================== */}
          {/* PANEL 1: ACTIVE ALERTS */}
          <div className="md:col-span-1">
            <AlertPanel 
              alerts={alerts}
              selectedSymbol={selectedSymbol}
              onSelectStock={handleSelectStock}
            />
          </div>

          {/* PANEL 2: PRICE & VOLUME CHART */}
          <div className="md:col-span-2">
            <PriceChart 
              stocks={stocks}
              selectedSymbol={selectedSymbol}
              history={activeStockDetails.history}
              onSelectStock={handleSelectStock}
              isLiveMarket={isLiveMarket}
              isLoading={isChartLoading}
              error={chartError}
              fallbackWarning={fallbackWarning}
            />
          </div>

          {/* ================== ROW 2 ================== */}
          {/* PANEL 3: RISK HEATMAP */}
          <div className="md:col-span-1">
            <Heatmap 
              heatmapData={heatmapData}
              selectedSymbol={selectedSymbol}
              onSelectStock={handleSelectStock}
            />
          </div>

          {/* PANEL 4: INSIDER TRADING GRAPH */}
          <div className="md:col-span-2">
            <InsiderGraph 
              graphData={graphData}
              demoStep={demoStep}
            />
          </div>

          {/* ================== ROW 3 ================== */}
          {/* PANEL 5: AI EXPLANATION */}
          <div className="md:col-span-1">
            <AIExplanation 
              predictionData={predictionData}
              isDemoActive={isDemoActive}
              demoStep={demoStep}
            />
          </div>

          {/* PANEL 6: NEWS FEED */}
          <div className="md:col-span-1">
            <SentimentFeed 
              sentimentData={sentimentData}
              mismatchDetected={predictionData.mismatch_detected}
            />
          </div>

          {/* PANEL 7: SOCIAL METRICS */}
          <div className="md:col-span-1">
            <SocialSignals 
              socialData={socialData}
            />
          </div>

        </div>

        {/* Right Column: Mission Control panel taking 1/4 width */}
        <div className="xl:col-span-1 sticky top-28">
          {isLiveMarket ? (
            <LiveController 
              symbol={selectedSymbol}
              predictionData={predictionData}
              systemMetrics={analytics.system_metrics || {}}
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

      {/* 4. BOTTOM SCALABILITY STRIP */}
      <ScalabilityPanel 
        metrics={analytics.system_metrics || {}}
      />

      {/* Loading Overlay for Live Market Connection */}
      {isLoadingLive && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 font-mono">
          <div className="p-8 border border-cyanneon/50 bg-[#060a16] rounded-md shadow-glowCyan flex flex-col items-center text-center gap-4">
            <Activity className="w-12 h-12 text-cyanneon animate-spin" />
            <div className="text-sm font-black text-white uppercase tracking-widest heading-syne animate-pulse">
              Connecting to live exchange...
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
