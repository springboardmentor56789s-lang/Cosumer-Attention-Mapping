"""
AI Retail Copilot Master Controller Service
Orchestrates intent classification, analytics retrieval, evidence synthesis, context memory, and anti-hallucination guarantees.
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.services.intent_service import CopilotIntentService
from app.services.analytics_service import CopilotAnalyticsService
from app.services.evidence_service import CopilotEvidenceService

# In-memory multi-turn conversation context cache
_CONVERSATION_MEMORY: Dict[str, Dict[str, Any]] = {}

class CopilotService:
    def __init__(self, db: Session):
        self.db = db
        self.analytics_service = CopilotAnalyticsService(db)

    def process_message(
        self,
        message: str,
        video_id: int = 1,
        store_id: int = 101,
        conversation_id: str = "default_session"
    ) -> Dict[str, Any]:
        """
        Processes manager natural language query, retrieves real backend telemetry, and synthesizes structured response.
        """
        # Fetch conversation context memory
        context = _CONVERSATION_MEMORY.get(conversation_id, {})
        
        # 1. Intent Classification
        intent_res = CopilotIntentService.classify_intent(message, conversation_context=context)
        intent = intent_res["intent"]
        resolved_entity = intent_res.get("resolved_entity")

        # 2. Dispatch to Analytics Service & Evidence Service
        if intent == CopilotIntentService.INTENT_UNSUPPORTED:
            response_payload = CopilotEvidenceService.format_unsupported_response(intent_res)

        elif intent == CopilotIntentService.INTENT_MISSING_DATA:
            response_payload = CopilotEvidenceService.format_missing_data_response(intent_res)

        elif intent == CopilotIntentService.INTENT_STORE_STATUS:
            status_data = self.analytics_service.get_live_store_status(video_id)
            response_payload = CopilotEvidenceService.format_live_status_response(status_data)

        elif intent == CopilotIntentService.INTENT_SHOPPER_BEHAVIOR:
            behavior_data = self.analytics_service.get_store_traffic(video_id)
            response_payload = CopilotEvidenceService.format_shopper_behavior_response(behavior_data)

        elif intent == CopilotIntentService.INTENT_ATTENTION_ANALYSIS:
            attn_data = self.analytics_service.get_attention_analysis(video_id)
            response_payload = CopilotEvidenceService.format_attention_response(attn_data)

        elif intent == CopilotIntentService.INTENT_SHELF_ANALYTICS:
            shelf_data = self.analytics_service.get_shelf_analytics(video_id)
            resolved_shelf_name = resolved_entity["name"] if resolved_entity and resolved_entity["type"] == "shelf" else None
            response_payload = CopilotEvidenceService.format_shelf_response(shelf_data, resolved_shelf=resolved_shelf_name)
            # Update context memory
            context["last_shelf"] = shelf_data.get("top_shelf_code", "Shelf B3 (Beverages)")

        elif intent == CopilotIntentService.INTENT_PRODUCT_INTELLIGENCE:
            prod_data = self.analytics_service.get_product_analytics(video_id)
            response_payload = CopilotEvidenceService.format_product_response(prod_data)
            # Update context memory
            top_p = prod_data.get("top_product")
            if top_p:
                context["last_product"] = top_p["product_name"]

        elif intent == CopilotIntentService.INTENT_RECOMMENDATIONS:
            recs = self.analytics_service.get_recommendations(video_id)
            response_payload = CopilotEvidenceService.format_recommendations_response(recs)

        elif intent == CopilotIntentService.INTENT_HEATMAPS:
            attn_data = self.analytics_service.get_attention_analysis(video_id)
            response_payload = CopilotEvidenceService.format_attention_response(attn_data)

        else:
            status_data = self.analytics_service.get_live_store_status(video_id)
            response_payload = CopilotEvidenceService.format_live_status_response(status_data)

        # 3. Store updated context memory
        context["last_intent"] = intent
        context["last_video_id"] = video_id
        context["last_store_id"] = store_id
        _CONVERSATION_MEMORY[conversation_id] = context

        # Add context metadata to response payload
        response_payload["conversation_id"] = conversation_id
        response_payload["store_id"] = store_id
        response_payload["video_id"] = video_id

        return response_payload
