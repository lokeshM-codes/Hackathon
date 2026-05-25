import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        # Initialize an Isolation Forest classifier
        self.clf = IsolationForest(contamination=0.05, random_state=42)
        # X_train features: [volume_ratio, price_change_pct, volatility, momentum]
        X_train = np.random.normal(loc=[1.0, 0.0, 0.01, 0.0], scale=[0.2, 0.02, 0.005, 0.01], size=(200, 4))
        self.clf.fit(X_train)

    def detect(self, price_history):
        """
        Calculates the anomaly score of the latest tick based on historical data.
        Returns:
            anomaly_score (float): score between 0.0 and 1.0 (higher = more anomalous)
            severity (str): 'INFO', 'WARNING', or 'CRITICAL'
            explanation (str): technical breakdown of features
        """
        if len(price_history) < 5:
            return 0.12, "INFO", "Insufficient historical price ticks for complete statistical evaluation."

        # Support both model instances and raw dicts
        prices = [h.price if hasattr(h, "price") else h["price"] for h in price_history]
        volumes = [h.volume if hasattr(h, "volume") else h["volume"] for h in price_history]
        
        df = pd.DataFrame({"price": prices, "volume": volumes})
        
        # Calculate features:
        # 1. volume_ratio (current volume / mean historical volume)
        mean_vol = df["volume"].iloc[:-1].mean()
        if mean_vol == 0 or np.isnan(mean_vol):
            mean_vol = 1.0
        current_vol = df["volume"].iloc[-1]
        volume_ratio = current_vol / mean_vol

        # 2. price change percentage
        pct_change = df["price"].pct_change().fillna(0.0)
        current_pct_change = pct_change.iloc[-1]

        # 3. volatility (standard deviation of the last 5 ticks percentage changes)
        volatility = pct_change.tail(5).std()
        if np.isnan(volatility):
            volatility = 0.0

        # 4. momentum (price change over the last 5 ticks)
        momentum = (df["price"].iloc[-1] - df["price"].iloc[-5]) / df["price"].iloc[-5] if len(df) >= 5 else 0.0

        X = np.array([[volume_ratio, current_pct_change, volatility, momentum]])
        
        # Isolation Forest decision_function returns signed anomaly score (lower is more anomalous)
        # Typical range is ~ -0.4 to 0.2. Let's normalize it to 0.0 - 1.0
        raw_score = self.clf.decision_function(X)[0]
        
        # Map decision function outputs into [0, 1]
        # Lower decision score -> Higher anomaly score
        anomaly_score = 1.0 - ((raw_score + 0.4) / 0.6)
        anomaly_score = max(0.0, min(1.0, anomaly_score))
        
        # Post-process for realistic demo thresholds
        # Ensure that if it has huge volume ratio or price spike, it maps accurately
        if volume_ratio > 10.0 or abs(current_pct_change) > 0.15:
            anomaly_score = max(anomaly_score, 0.88)
            
        severity = "INFO"
        if anomaly_score >= 0.85:
            severity = "CRITICAL"
        elif anomaly_score >= 0.70:
            severity = "WARNING"
            
        explanation = f"Volume Ratio: {volume_ratio:.1f}x | Price Change: {current_pct_change*100:+.1f}% | Volatility: {volatility:.4f} | Momentum: {momentum*100:+.1f}%"
        return round(anomaly_score, 2), severity, explanation

detector = AnomalyDetector()
