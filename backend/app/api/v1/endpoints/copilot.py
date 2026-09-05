from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.copilot_service import CopilotService

router = APIRouter()

class CopilotChatRequest(BaseModel):
    message: str
    store_id: Optional[int] = 101
    video_id: Optional[int] = 1
    conversation_id: Optional[str] = "default_session"

@router.post("/chat")
def copilot_chat(req: CopilotChatRequest, db: Session = Depends(get_db)):
    """
    AI Retail Copilot Endpoint.
    Processes natural-language store queries and responds with evidence-backed analytics.
    """
    copilot_service = CopilotService(db)
    result = copilot_service.process_message(
        message=req.message,
        video_id=req.video_id or 1,
        store_id=req.store_id or 101,
        conversation_id=req.conversation_id or "default_session"
    )
    return result
