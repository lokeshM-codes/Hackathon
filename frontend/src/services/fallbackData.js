// Fallback Data for MarketGuard AI Frontend Resilience
// This data is used if the FastAPI backend is offline or slow.

export const FALLBACK_STOCKS = [
  { symbol: "RELIANCE", company_name: "Reliance Industries Ltd.", base_price: 2450.0, current_price: 2435.20, volume: 1205000, change_percent: -0.60 },
  { symbol: "TCS", company_name: "Tata Consultancy Services Ltd.", base_price: 3210.0, current_price: 3242.10, volume: 812000, change_percent: 1.00 },
  { symbol: "INFOSYS", company_name: "Infosys Limited", base_price: 1420.0, current_price: 1435.50, volume: 948000, change_percent: 1.09 },
  { symbol: "HDFC_BANK", company_name: "HDFC Bank Limited", base_price: 1580.0, current_price: 1564.20, volume: 1492000, change_percent: -1.00 },
  { symbol: "ITC", company_name: "ITC Limited", base_price: 420.0, current_price: 424.50, volume: 2012000, change_percent: 1.07 },
  { symbol: "YES_BANK", company_name: "Yes Bank Limited", base_price: 16.5, current_price: 22.28, volume: 250000000, change_percent: 35.03 },
  { symbol: "ADANI_ENT", company_name: "Adani Enterprises Ltd.", base_price: 2890.0, current_price: 2884.20, volume: 612000, change_percent: -0.20 },
  { symbol: "ZOMATO", company_name: "Zomato Limited", base_price: 82.0, current_price: 84.10, volume: 3480000, change_percent: 2.56 },
  { symbol: "IRFC_PENNY", company_name: "IRFC Penny Tracker", base_price: 22.0, current_price: 22.00, volume: 150000, change_percent: 0.00 }
];

// Generate mock historical data (50 ticks)
export const generateFallbackHistory = (symbol, currentPrice, changePct) => {
  const history = [];
  const base = currentPrice / (1 + changePct / 100);
  let price = base;
  let now = new Date();
  
  // Specific setups for Yes Bank
  for (let i = 49; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000).toISOString();
    let anomalyScore = 0.08 + Math.random() * 0.12;
    let isAnomaly = false;
    let vol = Math.floor(50000 + Math.random() * 80000);
    
    // Normal price path
    const pct = -0.01 + Math.random() * 0.02;
    price = price * (1 + pct);
    
    if (symbol === "YES_BANK" && i === 0) {
      price = currentPrice;
      vol = 250000000;
      isAnomaly = true;
      anomalyScore = 0.94;
    } else if (symbol === "YES_BANK" && i < 5) {
      price = base * (1 + (35 * (5 - i) / 5) / 100);
      vol = 50000000 + Math.floor(Math.random() * 20000000);
      isAnomaly = true;
      anomalyScore = 0.85;
    }
    
    history.push({
      id: 50 - i,
      symbol,
      price: parseFloat(price.toFixed(2)),
      volume: vol,
      timestamp,
      is_anomaly: isAnomaly,
      anomaly_score: parseFloat(anomalyScore.toFixed(2)),
      is_prediction: false,
      predicted_price: parseFloat((price * (1 + (Math.random() * 0.02 - 0.01))).toFixed(2))
    });
  }
  return history;
};

export const FALLBACK_HISTORY = FALLBACK_STOCKS.reduce((acc, stock) => {
  acc[stock.symbol] = generateFallbackHistory(stock.symbol, stock.current_price, stock.change_percent);
  return acc;
}, {});

export const FALLBACK_ALERTS = [
  {
    id: 1,
    symbol: "YES_BANK",
    title: "Abnormal Price-Sentiment Divergence",
    severity: "CRITICAL",
    risk_score: 0.94,
    explanation: "YES_BANK price surged by 35% on a 50x volume spike despite overwhelming negative social/news sentiment. AI flags this as potential coordinated buying or short squeeze manipulation.",
    confidence: 0.92,
    estimated_impact_inr: 8500000,
    timestamp: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: 2,
    symbol: "ADANI_ENT",
    title: "Coordinated Insider Trading Ring",
    severity: "CRITICAL",
    risk_score: 0.89,
    explanation: "Graph analysis detected high connectivity and synchronized high-volume option trades between 4 accounts connected to shell brokers prior to regulatory announcements.",
    confidence: 0.88,
    estimated_impact_inr: 24000000,
    timestamp: new Date(Date.now() - 18 * 60000).toISOString()
  },
  {
    id: 3,
    symbol: "IRFC_PENNY",
    title: "Social Media Hype Accel",
    severity: "WARNING",
    risk_score: 0.72,
    explanation: "Reddit and Twitter mentions of IRFC_PENNY spiked 12x in 2 hours with standard pump vocabulary. Price momentum starting to accelerate.",
    confidence: 0.81,
    estimated_impact_inr: 4500000,
    timestamp: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 4,
    symbol: "RELIANCE",
    title: "Minor Anomaly Detected",
    severity: "INFO",
    risk_score: 0.32,
    explanation: "Slight upward volume deviation in block deals. Under surveillance.",
    confidence: 0.65,
    estimated_impact_inr: 1200000,
    timestamp: new Date(Date.now() - 52 * 60000).toISOString()
  }
];

export const FALLBACK_NEWS_SOCIAL = {
  YES_BANK: [
    { id: 1, symbol: "YES_BANK", title: "SEBI Launches Investigation Into Yes Bank Unusual Derivative Volumes", content: "The market regulator has initiated an inspection of trade logs from several brokerage firms following massive block trades.", sentiment: "negative", score: -0.85, source: "News", timestamp: new Date().toISOString() },
    { id: 2, symbol: "YES_BANK", title: "Yes Bank Reports Flat Profit Margins, NPAs Remain Sticky", content: "Q4 earnings reports disappointed institutional investors, with NPAs showing slow recovery despite internal restructure.", sentiment: "negative", score: -0.68, source: "News", timestamp: new Date(Date.now() - 10000).toISOString() },
    { id: 3, symbol: "YES_BANK", title: "Twitter post by @MarketWhales", content: "YES_BANK dump is imminent. Retail options traps are wide open, do not fall for this pump. Fundamentals are broken! #Nifty50", sentiment: "negative", score: -0.90, source: "Social Media", timestamp: new Date(Date.now() - 20000).toISOString() }
  ],
  ADANI_ENT: [
    { id: 4, symbol: "ADANI_ENT", title: "Adani Group Secures $1.2B Funding for New Solar Initiative", content: "Consortium of international banks commits funding, driving long-term positive outlook for energy units.", sentiment: "positive", score: 0.82, source: "News", timestamp: new Date().toISOString() },
    { id: 5, symbol: "ADANI_ENT", title: "Twitter post by @InsideAlpha", content: "Massive block trading noticed on ADANI_ENT right before the funding news. Suspicious accounts buying. SEBI awake? #Insider", sentiment: "negative", score: -0.65, source: "Social Media", timestamp: new Date(Date.now() - 30000).toISOString() }
  ],
  IRFC_PENNY: [
    { id: 6, symbol: "IRFC_PENNY", title: "Small Cap Stocks Suspected of Shell Infrastructure Manipulation", content: "Financial experts warn retail investors to stay away from penny railway trackers facing pump-and-dump behaviors.", sentiment: "negative", score: -0.78, source: "News", timestamp: new Date().toISOString() },
    { id: 7, symbol: "IRFC_PENNY", title: "Reddit post on r/IndianStreetBets", content: "IRFC_PENNY is the next multibagger! 🚀 Buy now, targets of 100+ incoming. Rocket emoji to the moon! 💎🙌", sentiment: "positive", score: 0.95, source: "Social Media", timestamp: new Date(Date.now() - 15000).toISOString() }
  ]
};

export const FALLBACK_GRAPH = {
  nodes: [
    { id: "Adani_Corp", label: "ADANI_ENT", type: "company", risk: "medium", details: "Listed Entity", centrality: 0.22 },
    { id: "Acme_Shell_1", label: "Acme Holdings (Mauritius)", type: "shell", risk: "critical", details: "Shell Entity", centrality: 0.38 },
    { id: "Acme_Shell_2", label: "Apex Fund (Cayman)", type: "shell", risk: "critical", details: "Shell Entity", centrality: 0.38 },
    { id: "Broker_Alpha", label: "Alpha Brokerage", type: "broker", risk: "medium", details: "DMA Provider", centrality: 0.56 },
    { id: "Broker_Beta", label: "Vanguard Global Broker", type: "broker", risk: "low", details: "Clearing Broker", centrality: 0.22 },
    { id: "Trader_A", label: "Rohan Gupta (Ex-Director)", type: "trader", risk: "critical", details: "Former insider", centrality: 0.11 },
    { id: "Trader_B", label: "Anjali Shah (Associate)", type: "trader", risk: "critical", details: "Daughter of Board member", centrality: 0.11 },
    { id: "Trader_C", label: "Vikram Mehta (Trader)", type: "trader", risk: "medium", details: "Linked to Acme", centrality: 0.11 },
    { id: "Trader_D", label: "Sanjay Rao (Retail)", type: "trader", risk: "low", details: "Retail trader", centrality: 0.11 },
    { id: "Trader_E", label: "Karan Johar (HNW)", type: "trader", risk: "low", details: "HNW Investor", centrality: 0.11 }
  ],
  links: [
    { source: "Trader_A", target: "Acme_Shell_1", value: 5, relationship: "Beneficiary Owner" },
    { source: "Trader_B", target: "Acme_Shell_2", value: 5, relationship: "Beneficiary Owner" },
    { source: "Acme_Shell_1", target: "Broker_Alpha", value: 3, relationship: "Clearing Channel" },
    { source: "Acme_Shell_2", target: "Broker_Alpha", value: 3, relationship: "Clearing Channel" },
    { source: "Broker_Alpha", target: "Adani_Corp", value: 8, relationship: "High Volume Trades" },
    { source: "Trader_C", target: "Broker_Alpha", value: 2, "relationship": "Coordinated Orders" },
    { source: "Trader_D", target: "Broker_Beta", value: 1, relationship: "Retail Order Flow" },
    { source: "Broker_Beta", target: "Adani_Corp", value: 3, relationship: "Regular Order Flow" },
    { source: "Trader_E", target: "Broker_Beta", value: 2, relationship: "Regular Order Flow" }
  ],
  flagged_entities: ["Trader_A", "Trader_B", "Acme_Shell_1", "Acme_Shell_2"],
  cluster_risk_score: 0.89
};

export const FALLBACK_PREDICTIONS = {
  YES_BANK: {
    symbol: "YES_BANK",
    anomaly_score: 0.94,
    anomaly_severity: "CRITICAL",
    anomaly_explanation: "Volume Ratio: 50.2x | Price Change: +35.0% | Volatility: 0.0425 | Momentum: +35.0%",
    prediction_probability: 0.92,
    prediction_confidence: 0.96,
    estimated_peak_time: "5 mins",
    mismatch_detected: true,
    top_factors: [
      { factor: "Volume Deviation", impact: "High (50x average)", description: "Abnormal volume spike registered without institutional announcements." },
      { factor: "Sentiment Divergence", impact: "Critical", "description": "Price is rising (+35.0%) while news sentiment remains strongly negative (-0.78)." },
      { factor: "Option Concentration", impact: "High", description: "Abnormal open interest concentrated in near-term call options." },
      { factor: "Network Centrality", impact: "Medium", description: "Clearing brokers linked to accounts matching coordinates." }
    ]
  },
  ADANI_ENT: {
    symbol: "ADANI_ENT",
    anomaly_score: 0.24,
    anomaly_severity: "INFO",
    anomaly_explanation: "Volume Ratio: 1.1x | Price Change: -0.2% | Volatility: 0.0084 | Momentum: -0.2%",
    prediction_probability: 0.15,
    prediction_confidence: 0.88,
    estimated_peak_time: "N/A",
    mismatch_detected: false,
    top_factors: [
      { factor: "Volume Deviation", impact: "Low", description: "Trading volume conforms to historical moving averages." },
      { factor: "Sentiment Alignment", impact: "Neutral", description: "Public sentiment indexes align with current price trends." },
      { factor: "Account Cohesion", impact: "None", description: "No synchronized trade clusters or shell routing paths flagged." }
    ]
  },
  IRFC_PENNY: {
    symbol: "IRFC_PENNY",
    anomaly_score: 0.12,
    anomaly_severity: "INFO",
    anomaly_explanation: "Volume Ratio: 1.0x | Price Change: 0.0% | Volatility: 0.0012 | Momentum: 0.0%",
    prediction_probability: 0.05,
    prediction_confidence: 0.95,
    estimated_peak_time: "N/A",
    mismatch_detected: false,
    top_factors: [
      { factor: "Volume Deviation", impact: "Low", description: "Trading volume conforms to historical moving averages." },
      { factor: "Volatility Check", impact: "Low", description: "Standard statistical price movements within normal thresholds." }
    ]
  }
};

export const FALLBACK_ANALYTICS = {
  stocks_monitored: 9,
  active_alerts: 4,
  critical_alerts: 2,
  trades_analyzed: 124050,
  detection_accuracy: 98.4,
  false_positive_rate: 1.2,
  investor_loss_prevented_inr: 38200000,
  system_metrics: {
    throughput: 452.4,
    latency: 12.1,
    uptime_seconds: 86400,
    active_streams: 24,
    model_inference_ms: 4.2
  }
};

export const FALLBACK_SOCIAL_SIGNALS = {
  YES_BANK: {
    symbol: "YES_BANK",
    mention_velocity: 12.5,
    total_mentions_24h: 6210,
    sentiment_trend: "divergent",
    platform_breakdown: { twitter: 3726, reddit: 1863, forums: 621 }
  },
  ADANI_ENT: {
    symbol: "ADANI_ENT",
    mention_velocity: 2.4,
    total_mentions_24h: 1120,
    sentiment_trend: "mixed",
    platform_breakdown: { twitter: 672, reddit: 336, forums: 112 }
  },
  IRFC_PENNY: {
    symbol: "IRFC_PENNY",
    mention_velocity: 1.0,
    total_mentions_24h: 180,
    sentiment_trend: "stable",
    platform_breakdown: { twitter: 108, reddit: 54, forums: 18 }
  }
};

// SIMULATE THE 12-STEP SEQUENCE LOCALLY
// Returns updated states for a client-side running simulation
export const getLocalDemoStepData = (step, prevStocks, prevAlerts, prevHistory, prevNewsSocial) => {
  const newStocks = JSON.parse(JSON.stringify(prevStocks || FALLBACK_STOCKS));
  const newAlerts = JSON.parse(JSON.stringify(prevAlerts || FALLBACK_ALERTS));
  const newHistory = JSON.parse(JSON.stringify(prevHistory || FALLBACK_HISTORY));
  const newNewsSocial = JSON.parse(JSON.stringify(prevNewsSocial || FALLBACK_NEWS_SOCIAL));
  
  const irfcStock = newStocks.find(s => s.symbol === "IRFC_PENNY");
  const nowStr = new Date().toISOString();
  
  if (step === 0) {
    // Return original fallbacks
    return {
      stocks: FALLBACK_STOCKS,
      alerts: FALLBACK_ALERTS,
      history: FALLBACK_HISTORY,
      newsSocial: FALLBACK_NEWS_SOCIAL,
      graph: FALLBACK_GRAPH,
      predictions: FALLBACK_PREDICTIONS,
      analytics: FALLBACK_ANALYTICS,
      socialSignals: FALLBACK_SOCIAL_SIGNALS
    };
  }

  // Set up IRFC_PENNY custom parameters per step
  if (step >= 1) {
    irfcStock.current_price = 22.00;
    irfcStock.volume = 150000;
    irfcStock.change_percent = 0.00;
  }
  if (step >= 2) {
    irfcStock.current_price = 22.80;
    irfcStock.volume = 650000;
    irfcStock.change_percent = 3.64;
  }
  if (step >= 3) {
    irfcStock.current_price = 26.20;
    irfcStock.volume = 2200000;
    irfcStock.change_percent = 19.09;
  }
  if (step >= 10) {
    irfcStock.current_price = 32.50;
    irfcStock.volume = 5800000;
    irfcStock.change_percent = 47.73;
  }
  
  // Append new history ticks for step price triggers
  if (newHistory["IRFC_PENNY"]) {
    const irfcHist = newHistory["IRFC_PENNY"];
    const baseObj = { symbol: "IRFC_PENNY", timestamp: nowStr, is_prediction: false, predicted_price: irfcStock.current_price };
    
    if (step === 1) {
      irfcHist.push({ ...baseObj, price: 22.00, volume: 150000, is_anomaly: false, anomaly_score: 0.12 });
    } else if (step === 2) {
      irfcHist.push({ ...baseObj, price: 22.80, volume: 650000, is_anomaly: false, anomaly_score: 0.38 });
    } else if (step >= 3 && step < 10) {
      irfcHist.push({ ...baseObj, price: 26.20, volume: 2200000, is_anomaly: true, anomaly_score: 0.74 });
    } else if (step >= 10) {
      irfcHist.push({ ...baseObj, price: 32.50, volume: 5800000, is_anomaly: true, anomaly_score: 0.96 });
    }
    if (irfcHist.length > 50) irfcHist.shift();
  }

  // Inject Alerts
  if (step >= 4 && !newAlerts.some(a => a.symbol === "IRFC_PENNY" && a.title.includes("VOLUME"))) {
    newAlerts.unshift({
      id: 101,
      symbol: "IRFC_PENNY",
      title: "VOLUME_SURGE Flagged",
      severity: "WARNING",
      risk_score: 0.74,
      explanation: "Unusual volume spike (15x over average) detected on IRFC_PENNY in under 5 minutes.",
      confidence: 0.82,
      estimated_impact_inr: 1500000,
      timestamp: nowStr
    });
  }
  if (step >= 5 && !newAlerts.some(a => a.symbol === "IRFC_PENNY" && a.title.includes("PRICE"))) {
    newAlerts.unshift({
      id: 102,
      symbol: "IRFC_PENNY",
      title: "PRICE_SPIKE Flagged",
      severity: "WARNING",
      risk_score: 0.79,
      explanation: "Abrupt price acceleration of +19.1% within 2 minutes. Deviation exceeds historic sector volatility.",
      confidence: 0.85,
      estimated_impact_inr: 2200000,
      timestamp: nowStr
    });
  }
  if (step >= 6 && !newNewsSocial["IRFC_PENNY"].some(n => n.title.includes("SEBI"))) {
    newNewsSocial["IRFC_PENNY"].unshift(
      { id: 201, symbol: "IRFC_PENNY", title: "SEBI Investigates Bulk Trades in Rail Penny Shares", content: "Regulator scans suspicious accounts registered overseas routing orders through domestic brokers.", sentiment: "negative", score: -0.85, source: "News", timestamp: nowStr },
      { id: 202, symbol: "IRFC_PENNY", title: "Twitter Post by @TraderScamAlert", content: "IRFC_PENNY has classic pump and dump signature. Do not buy! Operators will dump soon. #Nifty", sentiment: "negative", score: -0.92, source: "Social Media", timestamp: nowStr }
    );
  }
  if (step >= 7 && !newAlerts.some(a => a.symbol === "IRFC_PENNY" && a.title.includes("MISMATCH"))) {
    newAlerts.unshift({
      id: 103,
      symbol: "IRFC_PENNY",
      title: "SENTIMENT_MISMATCH Flagged",
      severity: "CRITICAL",
      risk_score: 0.88,
      explanation: "Price is skyrocketing (+19.1%) while news and social sentiment is deep negative (-0.89).",
      confidence: 0.91,
      estimated_impact_inr: 3200000,
      timestamp: nowStr
    });
  }
  if (step >= 10 && !newAlerts.some(a => a.symbol === "IRFC_PENNY" && a.title.includes("PUMP_DUMP"))) {
    newAlerts.unshift({
      id: 104,
      symbol: "IRFC_PENNY",
      title: "PUMP_DUMP Scheme Detected",
      severity: "CRITICAL",
      risk_score: 0.96,
      explanation: "Coordinated Pump & Dump confirmed. AI model detects synchronized trade loops, volume anomalies, and polarity divergence.",
      confidence: 0.96,
      estimated_impact_inr: 42000000,
      timestamp: nowStr
    });
  }

  // Insider Graph Morphs
  let graph = JSON.parse(JSON.stringify(FALLBACK_GRAPH));
  if (step >= 8) {
    const extraNodes = [
      { id: "IRFC_Corp", label: "IRFC_PENNY", type: "company", risk: "medium", details: "Listed Penny Stock", centrality: 0.15 },
      { id: "Operator_X", label: "Mauritius Alpha Ltd", type: "shell", risk: "critical", details: "Operator Shell Entity", centrality: 0.35 },
      { id: "Broker_Gamma", label: "Apex Securities", type: "broker", risk: "critical", details: "Clearing channel for Operator X", centrality: 0.35 },
      { id: "Trader_P1", label: "Rajesh Verma (Trader)", type: "trader", risk: "critical", details: "Synchronized trading loops", centrality: 0.20 },
      { id: "Trader_P2", label: "Sanjay Mehta (Trader)", type: "trader", risk: "critical", details: "Linked IP Address", centrality: 0.20 }
    ];
    const extraLinks = [
      { source: "Trader_P1", target: "Operator_X", value: 6, relationship: "IP Match" },
      { source: "Trader_P2", target: "Operator_X", value: 6, relationship: "Synchronized Trades" },
      { source: "Operator_X", target: "Broker_Gamma", value: 7, relationship: "Clearing Channel" },
      { source: "Broker_Gamma", target: "IRFC_Corp", value: 9, relationship: "Float Cornering" }
    ];
    graph.nodes = [...graph.nodes, ...extraNodes];
    graph.links = [...graph.links, ...extraLinks];
    graph.flagged_entities = [...graph.flagged_entities, "Operator_X", "Trader_P1", "Trader_P2"];
    graph.cluster_risk_score = 0.96;
  }

  // Predictions updates
  let predictions = JSON.parse(JSON.stringify(FALLBACK_PREDICTIONS));
  if (step >= 3) {
    predictions["IRFC_PENNY"] = {
      symbol: "IRFC_PENNY",
      anomaly_score: step >= 10 ? 0.96 : (step >= 7 ? 0.88 : 0.74),
      anomaly_severity: step >= 7 ? "CRITICAL" : "WARNING",
      anomaly_explanation: `Volume Ratio: ${step >= 10 ? '38.6x' : '14.6x'} | Price Change: ${step >= 10 ? '+47.7%' : '+19.1%'} | Volatility: 0.0384 | Momentum: +19.1%`,
      prediction_probability: step >= 10 ? 0.96 : (step >= 7 ? 0.82 : 0.65),
      prediction_confidence: step >= 10 ? 0.96 : (step >= 7 ? 0.92 : 0.84),
      estimated_peak_time: step >= 10 ? "3 mins" : "8 mins",
      mismatch_detected: step >= 7,
      top_factors: [
        { factor: "Volume Surge", impact: step >= 10 ? "High (38x surge)" : "High (15x surge)", description: "Sudden buying volume suggesting float cornering operations." },
        { factor: "Price Acceleration", impact: "Critical", description: "Sharp upward price movement defying sector averages." },
        { factor: "Social Hype Velocity", impact: "High", description: "Spike in keyword mentions on online forums." },
        ...(step >= 7 ? [{ factor: "Sentiment Contrast", impact: "Critical", description: "Price rises while official regulatory news warning flashes." }] : [])
      ]
    };
  }

  // Analytics updates
  let analytics = JSON.parse(JSON.stringify(FALLBACK_ANALYTICS));
  analytics.active_alerts = newAlerts.length;
  analytics.critical_alerts = newAlerts.filter(a => a.severity === "CRITICAL").length;
  analytics.trades_analyzed += step * 340;
  analytics.investor_loss_prevented_inr = newAlerts.reduce((sum, a) => sum + a.estimated_impact_inr, 0);

  // Social Signals updates
  let socialSignals = JSON.parse(JSON.stringify(FALLBACK_SOCIAL_SIGNALS));
  if (step >= 4) {
    socialSignals["IRFC_PENNY"] = {
      symbol: "IRFC_PENNY",
      mention_velocity: step >= 10 ? 14.8 : (step >= 6 ? 8.4 : 3.2),
      total_mentions_24h: step >= 10 ? 4320 : (step >= 6 ? 2150 : 780),
      sentiment_trend: step >= 10 ? "divergent" : (step >= 6 ? "downward" : "upward"),
      platform_breakdown: {
        twitter: Math.floor((step >= 10 ? 4320 : (step >= 6 ? 2150 : 780)) * 0.6),
        reddit: Math.floor((step >= 10 ? 4320 : (step >= 6 ? 2150 : 780)) * 0.3),
        forums: Math.floor((step >= 10 ? 4320 : (step >= 6 ? 2150 : 780)) * 0.1)
      }
    };
  }

  return {
    stocks: newStocks,
    alerts: newAlerts,
    history: newHistory,
    newsSocial: newNewsSocial,
    graph,
    predictions,
    analytics,
    socialSignals
  };
};
