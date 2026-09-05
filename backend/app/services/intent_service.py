"""
Copilot Intent & Query Classifier Service
Understands natural language questions, maps queries to intent categories, resolves conversation context references, and flags unsupported metrics.
"""

from typing import Dict, Any, Optional

class CopilotIntentService:
    INTENT_STORE_STATUS = "store_status"
    INTENT_SHOPPER_BEHAVIOR = "shopper_behavior"
    INTENT_ATTENTION_ANALYSIS = "attention_analysis"
    INTENT_SHELF_ANALYTICS = "shelf_analytics"
    INTENT_PRODUCT_INTELLIGENCE = "product_intelligence"
    INTENT_HEATMAPS = "heatmaps"
    INTENT_RECOMMENDATIONS = "recommendations"
    INTENT_REPORTS = "reports"
    INTENT_MISSING_DATA = "missing_data"
    INTENT_UNSUPPORTED = "unsupported"

    @classmethod
    def classify_intent(cls, message: str, conversation_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        msg_lower = message.lower().strip()

        # Check for explicitly unsupported / un-tracked data requests
        unsupported_keywords = ["income", "demographic", "ethnicity", "emotion", "happiness", "salary", "wealth"]
        if any(kw in msg_lower for kw in unsupported_keywords):
            return {
                "intent": cls.INTENT_UNSUPPORTED,
                "unsupported_reason": "System privacy guidelines prohibit inferring customer demographics, income, or personal attributes from surveillance video telemetry."
            }

        # Check for missing data (sales conversion, revenue, profit, cash flow)
        missing_data_keywords = ["conversion rate", "conversion %", "revenue", "profit", "sales ₹", "sales amount", "weekly conversion"]
        if any(kw in msg_lower for kw in missing_data_keywords):
            return {
                "intent": cls.INTENT_MISSING_DATA,
                "missing_metric": "Sales & Purchase Conversion Data",
                "explanation": "Point-of-sale financial conversion data is not integrated into this vision analysis. I can provide observed visual attention frequency and shelf focus-duration metrics instead."
            }

        # Context resolution: handle follow-up pronouns ("there", "it", "why", "that shelf", "that product")
        resolved_entity = None
        if conversation_context:
            last_shelf = conversation_context.get("last_shelf")
            last_product = conversation_context.get("last_product")
            if any(term in msg_lower for term in ["there", "it", "that shelf", "this shelf"]) and last_shelf:
                resolved_entity = {"type": "shelf", "name": last_shelf}
            elif any(term in msg_lower for term in ["that product", "this product", "it"]) and last_product:
                resolved_entity = {"type": "product", "name": last_product}

        # Match Intent
        if resolved_entity and resolved_entity.get("type") == "shelf" and any(kw in msg_lower for kw in ["how long", "spend", "dwell", "time", "there"]):
            return {"intent": cls.INTENT_SHELF_ANALYTICS, "resolved_entity": resolved_entity}

        if resolved_entity and resolved_entity.get("type") == "product" and any(kw in msg_lower for kw in ["attractiveness", "score", "focus", "how long", "rank"]):
            return {"intent": cls.INTENT_PRODUCT_INTELLIGENCE, "resolved_entity": resolved_entity}

        if any(kw in msg_lower for kw in ["live", "happening", "current update", "store update", "busiest", "status", "overview", "what is happening", "update of the store"]):
            return {"intent": cls.INTENT_STORE_STATUS, "resolved_entity": resolved_entity}

        if any(kw in msg_lower for kw in ["recommendation", "recommend", "improve", "suggest", "review", "poorly", "fix", "boost", "increase"]):
            return {"intent": cls.INTENT_RECOMMENDATIONS, "resolved_entity": resolved_entity}

        if any(kw in msg_lower for kw in ["product", "attractiveness", "sku", "item", "best seller", "earphone", "knife", "chips", "juice"]):
            return {"intent": cls.INTENT_PRODUCT_INTELLIGENCE, "resolved_entity": resolved_entity}

        if any(kw in msg_lower for kw in ["shelf", "gaze fixation", "eye level", "shelves"]):
            return {"intent": cls.INTENT_SHELF_ANALYTICS, "resolved_entity": resolved_entity}

        if any(kw in msg_lower for kw in ["attention", "focus", "gaze", "looking"]):
            return {"intent": cls.INTENT_ATTENTION_ANALYSIS, "resolved_entity": resolved_entity}

        if any(kw in msg_lower for kw in ["heatmap", "spatial", "density", "hotspot", "visualization"]):
            return {"intent": cls.INTENT_HEATMAPS, "resolved_entity": resolved_entity}

        if any(kw in msg_lower for kw in ["dwell", "shopper", "traffic", "footfall", "customer", "journey", "path"]):
            return {"intent": cls.INTENT_SHOPPER_BEHAVIOR, "resolved_entity": resolved_entity}

        if any(kw in msg_lower for kw in ["report", "summary", "pdf", "export"]):
            return {"intent": cls.INTENT_REPORTS, "resolved_entity": resolved_entity}

        # Default fallback intent: Store Overview Status
        return {"intent": cls.INTENT_STORE_STATUS, "resolved_entity": resolved_entity}
