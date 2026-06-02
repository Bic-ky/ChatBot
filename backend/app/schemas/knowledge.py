import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class KnowledgeBaseBase(BaseModel):
    assistant_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = Field(default="active", max_length=50)


class KnowledgeBaseCreate(KnowledgeBaseBase):
    pass


class KnowledgeBaseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)


class KnowledgeBaseResponse(KnowledgeBaseBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentCreateText(BaseModel):
    content: str = Field(..., min_length=1, description="Raw text or markdown content to ingest")
    title: Optional[str] = Field(None, max_length=255)
    metadata: Optional[Dict[str, Any]] = None


class DocumentResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    knowledge_base_id: uuid.UUID
    source_type: str
    source_url: Optional[str] = None
    storage_path: Optional[str] = None
    content_hash: str
    status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentChunkResponse(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    knowledge_base_id: uuid.UUID
    document_id: uuid.UUID
    content: str
    metadata: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
