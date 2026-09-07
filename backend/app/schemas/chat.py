import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000, description="User question or prompt")
    session_id: Optional[str] = Field(None, max_length=255, description="Client session identifier")
    stream: bool = Field(default=False, description="Whether to stream response tokens via SSE")


class SourceCitation(BaseModel):
    title: str
    snippet: str
    chunk_id: Optional[str] = None
    score: Optional[float] = None


class ChatResponse(BaseModel):
    conversation_id: uuid.UUID
    session_id: str
    response: str
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    role: str = "assistant"


class MessageItem(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationHistoryResponse(BaseModel):
    id: uuid.UUID
    session_id: str
    status: str
    messages: List[MessageItem]

    model_config = ConfigDict(from_attributes=True)


class PublicAssistantConfig(BaseModel):
    id: uuid.UUID
    name: str
    welcome_message: str
    status: str
    human_handoff_enabled: bool

    model_config = ConfigDict(from_attributes=True)
