import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AssistantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    system_prompt: str = Field(
        default="You are a helpful business assistant. Answer questions accurately using company knowledge."
    )
    welcome_message: str = Field(
        default="Hello! How can I assist you today?"
    )
    model: str = Field(default="gpt-4o-mini", max_length=100)
    temperature: float = Field(default=0.2, ge=0.0, le=2.0)
    web_search_enabled: bool = False
    human_handoff_enabled: bool = False
    status: str = Field(default="active", max_length=50)


class AssistantCreate(AssistantBase):
    pass


class AssistantUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    welcome_message: Optional[str] = None
    model: Optional[str] = Field(None, max_length=100)
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    web_search_enabled: Optional[bool] = None
    human_handoff_enabled: Optional[bool] = None
    status: Optional[str] = Field(None, max_length=50)


class AssistantResponse(AssistantBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
