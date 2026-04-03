import uuid
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.tenant import Tenant
    from app.models.knowledge import KnowledgeBase
    from app.models.conversation import Conversation


class Assistant(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "assistants"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    system_prompt: Mapped[str] = mapped_column(
        Text,
        default="You are a helpful business assistant. Answer questions accurately using company knowledge.",
        nullable=False
    )
    welcome_message: Mapped[str] = mapped_column(
        Text,
        default="Hello! How can I assist you today?",
        nullable=False
    )
    model: Mapped[str] = mapped_column(String(100), default="gpt-4o-mini", nullable=False)
    temperature: Mapped[float] = mapped_column(Float, default=0.2, nullable=False)
    web_search_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    human_handoff_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="assistants")
    knowledge_bases: Mapped[List["KnowledgeBase"]] = relationship(
        "KnowledgeBase", back_populates="assistant", cascade="all, delete-orphan"
    )
    conversations: Mapped[List["Conversation"]] = relationship(
        "Conversation", back_populates="assistant", cascade="all, delete-orphan"
    )
