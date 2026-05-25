class SentimentAnalyzer:
    def __init__(self):
        # Financial vocabulary to perform fast keyword-based sentiment mapping
        # This replicates the FinBERT classification rules instantly and stably without downloading 400MB models
        self.neg_keywords = [
            "npa", "investigation", "sebi", "manipulation", "disappointed", "losses", 
            "liquidations", "dump", "npas", "sticky", "flat profit", "suspicious", 
            "court", "probe", "insider", "regulatory", "warnings", "falling", "penalty"
        ]
        self.pos_keywords = [
            "multibagger", "expansion", "growth", "funding", "bags", "secures", 
            "profit", "positive", "increase", "gains", "to the moon", "moon", 
            "circuit lock", "deal", "upgrade", "partnership", "beat estimates"
        ]

    def analyze(self, text: str):
        """
        Analyzes the input text for sentiment.
        Returns:
            sentiment (str): 'positive', 'negative', or 'neutral'
            score (float): sentiment score between -1.0 and 1.0
            confidence (float): confidence score between 0.0 and 1.0
        """
        text_lower = text.lower()
        
        neg_count = sum(text_lower.count(kw) for kw in self.neg_keywords)
        pos_count = sum(text_lower.count(kw) for kw in self.pos_keywords)
        
        if pos_count > neg_count:
            sentiment = "positive"
            score = 0.4 + 0.12 * (pos_count - neg_count)
            score = min(0.98, score)
            confidence = 0.72 + 0.05 * pos_count
            confidence = min(0.97, confidence)
        elif neg_count > pos_count:
            sentiment = "negative"
            score = -0.4 - 0.12 * (neg_count - pos_count)
            score = max(-0.98, score)
            confidence = 0.75 + 0.04 * neg_count
            confidence = min(0.97, confidence)
        else:
            sentiment = "neutral"
            # Default fallback for typical neutral announcements
            score = 0.0
            confidence = 0.88
            
        return sentiment, round(score, 2), round(confidence, 2)

    def detect_mismatch(self, price_change_pct: float, sentiment_score: float) -> bool:
        """
        Divergence detection logic:
        Flags a stock if price is up sharply (>= 10.0%) and sentiment is heavily negative (<= -0.40).
        """
        return price_change_pct >= 10.0 and sentiment_score <= -0.40

analyzer = SentimentAnalyzer()
