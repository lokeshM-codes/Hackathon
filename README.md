# MarketGuard AI — AI-Based Market Manipulation & Insider Trading Detection Platform

**MarketGuard AI** is a SEBI/NSE-grade real-time market surveillance terminal designed for hackathon demonstration. It features AI-powered anomaly detection, pump & dump predictive classification, coordinated insider network correlation, and financial text sentiment analysis.

---

## 🎯 Key Features

1. **AI-Based Anomaly Detection (Isolation Forest)**: Analyzes trade features (volume ratios, volatility, momentum) to calculate anomaly scores. Thresholds flag warnings (>0.70) and critical risks (>0.85).
2. **Predictive Intelligence (Random Forest)**: Models volume acceleration, price velocity, and social mention indicators to output a pump & dump probability and estimated peak window.
3. **Insider Trading Ring Visualization (NetworkX)**: Evaluates relationships between traders, clearing brokers, and shell entities to locate coordinate buying clusters and high degree-centrality rings.
4. **Sentiment Analysis Divergence**: Correlates investor sentiment polarity against price change rates. If stock price surges while sentiment drops, it triggers a divergence alert.
5. **Explainable AI (XAI)**: Breaks down the exact features contributing to a flag in plain-english logs.
6. **Cinematic 12-Step Demo**: An automated sequence detailing a coordinated pump & dump scenario on `IRFC_PENNY`, flashing a final protection banner showing ₹4.2 Crore retail investor loss prevented.
7. **Zero-Crash Resilience**: A local failover state machine in `fallbackData.js` intercepts network calls. If the backend FastAPI server goes offline, the dashboard, charts, network graphs, and 12-step demo sequence continue to function seamlessly.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, TailwindCSS (Dark surveillance theme, Syne + JetBrains Mono typography), Recharts, Axios, react-force-graph-2d
* **Backend**: FastAPI, SQLite, SQLAlchemy
* **AI/ML/Graph**: Scikit-Learn, NetworkX, Pandas, NumPy

---

## 🚀 Setup & Execution

### 1. Run the Backend Server
```bash
# Navigate to project workspace root
cd marketguard-ai

# Install Python requirements
pip install -r backend/requirements.txt

# Launch FastAPI Server
python backend/main.py
```
*The backend API will run on `http://localhost:8000` and seed database entries automatically. A background thread will tick stock prices and simulate new block transactions every 3 seconds.*

### 2. Run the Frontend Dashboard
```bash
# Navigate to the frontend directory
cd frontend

# Install package dependencies
npm install

# Start Vite Development Server
npm run dev
```
*The React surveillance terminal will serve on `http://localhost:5173/`.*

---

## 📺 Demo Walkthrough Sequence

Click the **Trigger Demo** button in the floating panel to start the cinematic sequence:

1. **Step 1: Normal Trading** — Baselines are established for `IRFC_PENNY`.
2. **Step 2: Volume Surge** — Daily volume spikes 4x; price rises slightly.
3. **Step 3: Price Spike** — Momentum accelerates. Price jumps +19.1% on 15x volume.
4. **Step 4: Volume Alert** — Isolation Forest flags a `VOLUME_SURGE` warning.
5. **Step 5: Price Alert** — AI flags a `PRICE_SPIKE` warning.
6. **Step 6: Negative Hype** — Public feeds warning of operator games appear in the feeds.
7. **Step 7: Sentiment Mismatch** — Divergence flags: price surges while sentiment drops to -0.89.
8. **Step 8: Insider Graph** — NetworkX maps a suspicious Mauritian shell entity clearing block trades.
9. **Step 9: XAI Explanation** — contributing factors list updates to show exact feature weights.
10. **Step 10: PUMP_DUMP Alert** — A critical alert fires warning of a coordinate pump scheme.
11. **Step 11: 96% Confidence** — Prediction models reach terminal confidence levels.
12. **Step 12: ₹4.2 Cr Prevented** — An animated green banner flashes, marking completed mitigation.

*Click the **Reset Demo** button to clear the database and reseed the surveillance terminal.*
