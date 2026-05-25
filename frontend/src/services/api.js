import axios from 'axios';
import * as fallback from './fallbackData';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Increased timeout to ensure Alpha Vantage API resolves before client aborts
});

let isOffline = false;
let clientDemoStep = 0;
let clientStocks = JSON.parse(JSON.stringify(fallback.FALLBACK_STOCKS));
let clientAlerts = JSON.parse(JSON.stringify(fallback.FALLBACK_ALERTS));
let clientHistory = JSON.parse(JSON.stringify(fallback.FALLBACK_HISTORY));
let clientNewsSocial = JSON.parse(JSON.stringify(fallback.FALLBACK_NEWS_SOCIAL));

let clientInterval = null;

const startClientSimulation = () => {
  if (clientInterval) return;
  
  clientInterval = setInterval(() => {
    if (!isOffline) return;

    if (clientDemoStep === 0) {
      // Normal price ticker when not in active demo mode
      clientStocks.forEach(s => {
        if (s.symbol === "IRFC_PENNY" || s.symbol === "YES_BANK") return;
        const change = -0.008 + Math.random() * 0.016;
        s.current_price = parseFloat((s.current_price * (1 + change)).toFixed(2));
        s.change_percent = parseFloat(((s.current_price - s.base_price) / s.base_price * 100).toFixed(2));
        s.volume = Math.max(5000, s.volume + Math.floor(Math.random() * 6000 - 3000));
        
        // Push historical ticks
        if (clientHistory[s.symbol]) {
          clientHistory[s.symbol].push({
            symbol: s.symbol,
            price: s.current_price,
            volume: s.volume,
            timestamp: new Date().toISOString(),
            is_anomaly: false,
            anomaly_score: parseFloat((0.04 + Math.random() * 0.10).toFixed(2))
          });
          if (clientHistory[s.symbol].length > 50) clientHistory[s.symbol].shift();
        }
      });
    } else {
      // Auto-advance client-side demo step sequence (representing the 12 steps)
      if (clientDemoStep < 12) {
        clientDemoStep += 1;
        const simulated = fallback.getLocalDemoStepData(clientDemoStep, clientStocks, clientAlerts, clientHistory, clientNewsSocial);
        clientStocks = simulated.stocks;
        clientAlerts = simulated.alerts;
        clientHistory = simulated.history;
        clientNewsSocial = simulated.newsSocial;
      }
    }
  }, 3000);
};

export const getIsOffline = () => isOffline;
export const getClientDemoStep = () => clientDemoStep;

const handleFallback = (endpoint, error, params = {}) => {
  if (!isOffline) {
    console.warn(`[MarketGuard AI] FastAPI Server unreachable: ${error.message}. Activating Fallback Resilience Mode.`);
    isOffline = true;
    startClientSimulation();
  }
  
  switch (endpoint) {
    case 'stocks':
      return Promise.resolve({ data: clientStocks });
      
    case 'stock-details': {
      const symbol = params.symbol || 'RELIANCE';
      const stock = clientStocks.find(s => s.symbol === symbol) || clientStocks[0];
      const history = clientHistory[symbol] || fallback.FALLBACK_HISTORY[symbol] || [];
      return Promise.resolve({ data: { stock, history } });
    }
    
    case 'alerts':
      return Promise.resolve({ data: clientAlerts });
      
    case 'heatmap': {
      const isLive = params.isLive;
      const targetSymbol = params.symbol || 'YES_BANK';
      const symbolsList = isLive 
        ? ["AAPL", "MSFT", "TSLA", "IBM", "RELIANCE.BSE", "TCS.BSE", "AMZN", "GOOGL", "NVDA"]
        : ["RELIANCE", "TCS", "INFOSYS", "HDFC_BANK", "ITC", "YES_BANK", "ADANI_ENT", "ZOMATO", "IRFC_PENNY"];
        
      const data = symbolsList.map(s => {
        let risk = 0.12;
        let change = 0.5;
        if (isLive) {
          if (s === targetSymbol) {
            risk = 0.85;
            change = 1.25;
          } else {
            const charSum = s.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
            risk = parseFloat((0.15 + (charSum % 50) / 100).toFixed(2));
            change = parseFloat((-2.0 + (charSum % 40) / 10).toFixed(2));
          }
        } else {
          if (s === "YES_BANK") risk = 0.94;
          else if (s === "ADANI_ENT") risk = 0.89;
          else if (s === "IRFC_PENNY") {
            if (clientDemoStep >= 10) risk = 0.96;
            else if (clientDemoStep >= 7) risk = 0.88;
            else if (clientDemoStep >= 4) risk = 0.74;
            else if (clientDemoStep >= 2) risk = 0.38;
            else risk = 0.15;
          } else {
            const charSum = s.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
            risk = parseFloat((0.10 + (charSum % 25) / 100).toFixed(2));
          }
          const cs = clientStocks.find(stock => stock.symbol === s);
          change = cs ? cs.change_percent : 0.0;
        }
        return {
          symbol: s,
          company_name: s.includes('.') ? s.replace('.BSE', ' Ltd.') : `${s} Corporation`,
          current_price: 150.0,
          change_percent: change,
          risk_score: risk,
          volume: 100000
        };
      });
      return Promise.resolve({ data });
    }
      
    case 'sentiment': {
      const symbol = params.symbol || 'RELIANCE';
      const feeds = clientNewsSocial[symbol] || fallback.FALLBACK_NEWS_SOCIAL[symbol] || [];
      const avg = feeds.length ? feeds.reduce((sum, f) => sum + f.score, 0) / feeds.length : 0.0;
      return Promise.resolve({
        data: {
          symbol,
          score: parseFloat(avg.toFixed(2)),
          label: avg > 0.20 ? 'positive' : (avg < -0.20 ? 'negative' : 'neutral'),
          feeds
        }
      });
    }
      
    case 'graph': {
      let g = JSON.parse(JSON.stringify(fallback.FALLBACK_GRAPH));
      const step = params.isLive ? 8 : (clientDemoStep || 0);
      const targetSymbol = params.symbol || 'YES_BANK';
      if (step >= 8) {
        const extraNodes = [
          { id: `${targetSymbol}_Corp`, label: targetSymbol, type: "company", risk: "medium", details: "Listed Equity", centrality: 0.15 },
          { id: "Operator_X", label: "Mauritius Alpha Ltd", type: "shell", risk: "critical", details: "Operator Shell Entity", centrality: 0.35 },
          { id: "Broker_Gamma", label: "Apex Securities", type: "broker", risk: "critical", details: "Clearing channel for Operator X", centrality: 0.35 },
          { id: "Trader_P1", label: "Rajesh Verma (Trader)", type: "trader", risk: "critical", details: "Synchronized trading loops", centrality: 0.20 },
          { id: "Trader_P2", label: "Sanjay Mehta (Trader)", type: "trader", risk: "critical", details: "Linked IP Address", centrality: 0.20 }
        ];
        const extraLinks = [
          { source: "Trader_P1", target: "Operator_X", value: 6, relationship: "IP Match" },
          { source: "Trader_P2", target: "Operator_X", value: 6, relationship: "Synchronized Trades" },
          { source: "Operator_X", target: "Broker_Gamma", value: 7, relationship: "Clearing Channel" },
          { source: "Broker_Gamma", target: `${targetSymbol}_Corp`, value: 9, relationship: "Float Cornering" }
        ];
        g.nodes = [...g.nodes, ...extraNodes];
        g.links = [...g.links, ...extraLinks];
        g.flagged_entities = [...g.flagged_entities, "Operator_X", "Trader_P1", "Trader_P2"];
        g.cluster_risk_score = 0.96;
      }
      return Promise.resolve({ data: g });
    }
      
    case 'prediction': {
      const symbol = params.symbol || 'RELIANCE';
      if (symbol === "IRFC_PENNY" && clientDemoStep >= 3) {
        return Promise.resolve({
          data: {
            symbol: "IRFC_PENNY",
            anomaly_score: clientDemoStep >= 10 ? 0.96 : (clientDemoStep >= 7 ? 0.88 : 0.74),
            anomaly_severity: clientDemoStep >= 7 ? "CRITICAL" : "WARNING",
            anomaly_explanation: `Volume Ratio: ${clientDemoStep >= 10 ? '38.6x' : '14.6x'} | Price Change: ${clientDemoStep >= 10 ? '+47.7%' : '+19.1%'} | Volatility: 0.0384 | Momentum: +19.1%`,
            prediction_probability: clientDemoStep >= 10 ? 0.96 : (clientDemoStep >= 7 ? 0.82 : 0.65),
            prediction_confidence: clientDemoStep >= 10 ? 0.96 : (clientDemoStep >= 7 ? 0.92 : 0.84),
            estimated_peak_time: clientDemoStep >= 10 ? "3 mins" : "8 mins",
            predicted_price: clientDemoStep >= 10 ? 11.25 : 8.32,
            mismatch_detected: clientDemoStep >= 7,
            top_factors: [
              { factor: "Volume Surge", impact: clientDemoStep >= 10 ? "High (38x surge)" : "High (15x surge)", description: "Sudden buying volume suggesting float cornering operations." },
              { factor: "Price Acceleration", impact: "Critical", description: "Sharp upward price movement defying sector averages." },
              { factor: "Social Hype Velocity", impact: "High", description: "Spike in keyword mentions on online forums." },
              ...(clientDemoStep >= 7 ? [{ factor: "Sentiment Contrast", impact: "Critical", description: "Price rises while official regulatory news warning flashes." }] : [])
            ]
          }
        });
      }
      return Promise.resolve({ data: fallback.FALLBACK_PREDICTIONS[symbol] || fallback.FALLBACK_PREDICTIONS["IRFC_PENNY"] });
    }
    case 'live-prediction': {
      const symbol = params.symbol || 'AAPL';
      const stock = clientStocks.find(s => s.symbol === symbol) || {
        symbol, current_price: 150.0 + Math.random() * 5, change_percent: -2.0 + Math.random() * 4
      };
      return Promise.resolve({
        data: {
          symbol,
          anomaly_score: 0.12 + Math.random() * 0.08,
          anomaly_severity: "INFO",
          anomaly_explanation: "Offline live prediction proxy active. Data sources unavailable.",
          prediction_probability: 0.15 + Math.random() * 0.1,
          prediction_confidence: 0.82 + Math.random() * 0.08,
          estimated_peak_time: "N/A",
          predicted_price: stock.current_price * (1 + (Math.random() - 0.5) * 0.02),
          mismatch_detected: false,
          top_factors: [
            { factor: "Volume Deviation", impact: "1.2x surge", description: "Trading volume relative to intraday baseline." },
            { factor: "Price Momentum", impact: `${((stock.change_percent || 0)).toFixed(2)}%`, description: "Price acceleration over evaluation window." },
            { factor: "Sentiment Score", impact: `${(-0.1 + Math.random() * 0.2).toFixed(2)}`, description: "Consolidated news sentiment on the live ticker." }
          ]
        }
      });
    }
    case 'live-stock': {
      const now = Date.now();
      const symbol = params.symbol || 'AAPL';
      const stock = clientStocks.find(s => s.symbol === symbol) || {
        symbol,
        company_name: `${symbol} Corporation`,
        current_price: 150.0 + Math.random() * 5,
        change_percent: -2.0 + Math.random() * 4,
        volume: 1200000 + Math.floor(Math.random() * 500000),
        high: 155.0,
        low: 148.0,
        open: 151.0,
        previous_close: 149.0
      };
      let history = clientHistory[symbol] || fallback.FALLBACK_HISTORY[symbol];
      if (!history || history.length === 0) {
        const price = stock.current_price;
        history = [];
        for (let i = 24; i >= 0; i--) {
          const t = new Date(now - i * 60000);
          const p = price * (1 + (Math.random() - 0.5) * 0.04);
          history.push({
            symbol,
            price: p,
            close: p,
            volume: Math.floor(500000 + Math.random() * 2000000),
            open: p * (1 + (Math.random() - 0.5) * 0.01),
            high: p * (1 + Math.random() * 0.015),
            low: p * (1 - Math.random() * 0.015),
            timestamp: t.toISOString(),
            time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            display_time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            is_anomaly: false,
            anomaly_score: 0.05
          });
        }
        clientHistory[symbol] = history;
      }
      const feeds = clientNewsSocial[symbol] || [];
      const avgSentiment = feeds.length ? feeds.reduce((s, f) => s + f.score, 0) / feeds.length : 0.05;
      const sentimentLabel = avgSentiment > 0.15 ? 'positive' : (avgSentiment < -0.15 ? 'negative' : 'neutral');
      const anomalyScore = 0.15 + Math.random() * 0.45;
      const isAnomalous = anomalyScore >= 0.5;
      const anomalySeverity = anomalyScore >= 0.7 ? "CRITICAL" : (anomalyScore >= 0.5 ? "WARNING" : "INFO");
      const alerts = isAnomalous ? [{
        id: now,
        symbol,
        title: `LIVE_${anomalySeverity}_ANOMALY`,
        severity: anomalySeverity,
        risk_score: anomalyScore,
        explanation: `Volume surge detected on ${symbol}. ${anomalySeverity === 'CRITICAL' ? 'Coordinated trading pattern identified.' : 'Unusual market activity observed.'}`,
        confidence: 0.75 + Math.random() * 0.2,
        estimated_impact_inr: Math.round((stock.current_price || 150) * 1000 * (1 + Math.random() * 3)),
        timestamp: new Date().toISOString()
      }] : [];
      return Promise.resolve({
        data: {
          stock,
          history,
          prediction: {
            symbol,
            anomaly_score: anomalyScore,
            anomaly_severity: anomalySeverity,
            anomaly_explanation: `Live market proxy analysis: ${anomalySeverity === 'INFO' ? 'Normal trading parameters verified.' : `Anomalous activity flagged at ${(anomalyScore * 100).toFixed(0)}% confidence.`}`,
            prediction_probability: 0.12 + Math.random() * 0.15,
            prediction_confidence: 0.85 + Math.random() * 0.1,
            estimated_peak_time: isAnomalous ? `${Math.floor(2 + Math.random() * 8)} mins` : "N/A",
            predicted_price: stock.current_price * (1 + (Math.random() - 0.5) * 0.015),
            mismatch_detected: isAnomalous && Math.random() > 0.5,
            top_factors: [
              { factor: "Volume Deviation", impact: `${(1 + Math.random() * 2).toFixed(1)}x surge`, description: "Trading volume relative to intraday baseline." },
              { factor: "Price Momentum", impact: `${(stock.change_percent || 0).toFixed(2)}%`, description: "Price acceleration over evaluation window." },
              { factor: "Sentiment Score", impact: `${avgSentiment.toFixed(2)}`, description: "Consolidated news sentiment on the live ticker." }
            ]
          },
          alerts,
          sentiment: {
            score: avgSentiment,
            label: sentimentLabel,
            feeds: feeds.length ? feeds : [
              { symbol, title: `Live Market Update - ${symbol}`, content: `Market data for ${symbol} showing ${anomalySeverity === 'INFO' ? 'normal' : 'elevated'} activity levels.`, sentiment: sentimentLabel, score: avgSentiment, source: "MarketGuard Feed", timestamp: new Date().toISOString() }
            ]
          }
        }
      });
    }
      
    case 'analytics': {
      const a = JSON.parse(JSON.stringify(fallback.FALLBACK_ANALYTICS));
      a.active_alerts = clientAlerts.length;
      a.critical_alerts = clientAlerts.filter(al => al.severity === "CRITICAL").length;
      a.trades_analyzed += clientDemoStep * 320;
      a.investor_loss_prevented_inr = clientAlerts.reduce((sum, al) => sum + al.estimated_impact_inr, 0);
      return Promise.resolve({ data: a });
    }
      
    case 'social': {
      const symbol = params.symbol || 'RELIANCE';
      if (symbol === "IRFC_PENNY" && clientDemoStep >= 4) {
        return Promise.resolve({
          data: {
            symbol: "IRFC_PENNY",
            mention_velocity: clientDemoStep >= 10 ? 14.8 : (clientDemoStep >= 6 ? 8.4 : 3.2),
            total_mentions_24h: clientDemoStep >= 10 ? 4320 : (clientDemoStep >= 6 ? 2150 : 780),
            sentiment_trend: clientDemoStep >= 10 ? "divergent" : (clientDemoStep >= 6 ? "downward" : "upward"),
            platform_breakdown: {
              twitter: Math.floor((clientDemoStep >= 10 ? 4320 : (clientDemoStep >= 6 ? 2150 : 780)) * 0.6),
              reddit: Math.floor((clientDemoStep >= 10 ? 4320 : (clientDemoStep >= 6 ? 2150 : 780)) * 0.3),
              forums: Math.floor((clientDemoStep >= 10 ? 4320 : (clientDemoStep >= 6 ? 2150 : 780)) * 0.1)
            }
          }
        });
      }
      return Promise.resolve({ data: fallback.FALLBACK_SOCIAL_SIGNALS[symbol] || fallback.FALLBACK_SOCIAL_SIGNALS["IRFC_PENNY"] });
    }
      
    case 'trigger-demo':
      clientDemoStep = 1;
      clientAlerts = clientAlerts.filter(al => al.symbol !== "IRFC_PENNY");
      clientNewsSocial["IRFC_PENNY"] = [];
      {
        const res = fallback.getLocalDemoStepData(1, clientStocks, clientAlerts, clientHistory, clientNewsSocial);
        clientStocks = res.stocks;
        clientAlerts = res.alerts;
        clientHistory = res.history;
        clientNewsSocial = res.newsSocial;
      }
      return Promise.resolve({ data: { status: 'success', current_step: 1 } });
      
    case 'reset-demo':
      clientDemoStep = 0;
      clientStocks = JSON.parse(JSON.stringify(fallback.FALLBACK_STOCKS));
      clientAlerts = JSON.parse(JSON.stringify(fallback.FALLBACK_ALERTS));
      clientHistory = JSON.parse(JSON.stringify(fallback.FALLBACK_HISTORY));
      clientNewsSocial = JSON.parse(JSON.stringify(fallback.FALLBACK_NEWS_SOCIAL));
      return Promise.resolve({ data: { status: 'success', message: 'Demo reset locally.' } });
      
    case 'set-demo-step': {
      const step = params.step || 0;
      clientDemoStep = step;
      const res = fallback.getLocalDemoStepData(step, clientStocks, clientAlerts, clientHistory, clientNewsSocial);
      clientStocks = res.stocks;
      clientAlerts = res.alerts;
      clientHistory = res.history;
      clientNewsSocial = res.newsSocial;
      return Promise.resolve({ data: { status: 'success', current_step: step } });
    }

      
    default:
      return Promise.reject(new Error(`Endpoint fallback not found: ${endpoint}`));
  }
};

export const fetchStocks = () => 
  api.get('/stocks').then(res => { isOffline = false; return res; }).catch(err => handleFallback('stocks', err));

export const fetchStockDetails = (symbol) => 
  api.get(`/stocks/${symbol}`).then(res => { isOffline = false; return res; }).catch(err => handleFallback('stock-details', err, { symbol }));

export const fetchAlerts = () => 
  api.get('/alerts').then(res => { isOffline = false; return res; }).catch(err => handleFallback('alerts', err));

export const fetchHeatmap = (symbol = 'YES_BANK', isLive = false) => 
  api.get('/heatmap', { params: { symbol, is_live: isLive } }).then(res => { isOffline = false; return res; }).catch(err => handleFallback('heatmap', err, { symbol, isLive }));

export const fetchSentiment = (symbol) => 
  api.get(`/sentiment/${symbol}`).then(res => { isOffline = false; return res; }).catch(err => handleFallback('sentiment', err, { symbol }));

export const fetchGraph = (symbol = 'YES_BANK', isLive = false) => 
  api.get('/graph', { params: { symbol, is_live: isLive } }).then(res => { isOffline = false; return res; }).catch(err => handleFallback('graph', err, { symbol, isLive }));


export const fetchPrediction = (symbol) => 
  api.get(`/prediction/${symbol}`).then(res => { isOffline = false; return res; }).catch(err => handleFallback('prediction', err, { symbol }));

export const fetchAnalytics = () => 
  api.get('/analytics').then(res => { isOffline = false; return res; }).catch(err => handleFallback('analytics', err));

export const fetchSocial = (symbol) => 
  api.get(`/social/${symbol}`).then(res => { isOffline = false; return res; }).catch(err => handleFallback('social', err, { symbol }));

export const fetchLivePrediction = (symbol) => 
  api.get(`/live-stock/prediction/${symbol}`, { timeout: 10000 }).then(res => { isOffline = false; return res; }).catch(err => handleFallback('live-prediction', err, { symbol }));

export const triggerDemo = () => 
  api.post('/trigger-demo').then(res => { isOffline = false; return res; }).catch(err => handleFallback('trigger-demo', err));

export const resetDemo = () => 
  api.post('/reset-demo').then(res => { isOffline = false; return res; }).catch(err => handleFallback('reset-demo', err));

export const setDemoStep = (step) =>
  api.post(`/set-demo-step/${step}`).then(res => { isOffline = false; return res; }).catch(err => handleFallback('set-demo-step', err, { step }));

export const fetchLiveStock = (symbol) => 
  api.get(`/live-stock/${symbol}`, { timeout: 10000 }).then(res => { isOffline = false; return res; }).catch(err => handleFallback('live-stock', err, { symbol }));

export const fetchQuote = (symbol) =>
  api.get(`/quotes/quote/${symbol}`, { timeout: 8000 }).then(res => { isOffline = false; return res; }).catch(err => handleFallback('live-stock', err, { symbol }));

export const fetchCandles = (symbol, resolution = '5', minutes = 780) =>
  api.get(`/quotes/candles/${symbol}`, { params: { resolution, minutes }, timeout: 10000 }).then(res => { isOffline = false; return res; }).catch(err => handleFallback('live-stock', err, { symbol }));

