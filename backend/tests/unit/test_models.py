import uuid
import pytest
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.models.assistant import Assistant
from app.models.knowledge import KnowledgeBase, Document, DocumentChunk
from app.models.conversation import Conversation, Message
from app.models.governance import AllowedDomain, APIKey, UsageEvent, AuditLog


def test_tenant_model_instantiation():
    tenant = Tenant(name="Acme Corp", slug="acme-corp", status="active")
    assert tenant.name == "Acme Corp"
    assert tenant.slug == "acme-corp"
    assert tenant.status == "active"


def test_user_model_role():
    tenant_id = uuid.uuid4()
    user = User(
        tenant_id=tenant_id,
        email="owner@acme.com",
        password_hash="hashed_pw",
        role=UserRole.OWNER,
        status="active"
    )
    assert user.tenant_id == tenant_id
    assert user.role == UserRole.OWNER
    assert user.email == "owner@acme.com"


def test_assistant_model_attributes():
    tenant_id = uuid.uuid4()
    assistant = Assistant(
        tenant_id=tenant_id,
        name="Support Bot",
        model="gpt-4o-mini",
        temperature=0.2,
        web_search_enabled=False
    )
    assert assistant.tenant_id == tenant_id
    assert assistant.name == "Support Bot"
    assert assistant.model == "gpt-4o-mini"
    assert assistant.temperature == 0.2
    assert assistant.web_search_enabled is False


def test_knowledge_and_chunk_model():
    tenant_id = uuid.uuid4()
    assistant_id = uuid.uuid4()
    kb = KnowledgeBase(
        tenant_id=tenant_id,
        assistant_id=assistant_id,
        name="Primary Docs"
    )
    assert kb.tenant_id == tenant_id
    assert kb.assistant_id == assistant_id

    doc = Document(
        tenant_id=tenant_id,
        knowledge_base_id=kb.id,
        source_type="markdown",
        content_hash="hash123",
        status="ready"
    )
    assert doc.source_type == "markdown"
    assert doc.content_hash == "hash123"

    chunk = DocumentChunk(
        tenant_id=tenant_id,
        knowledge_base_id=kb.id,
        document_id=doc.id,
        content="FAQ chunk text",
        metadata_={"section": "pricing"}
    )
    assert chunk.content == "FAQ chunk text"
    assert chunk.metadata_["section"] == "pricing"


def test_conversation_and_message():
    tenant_id = uuid.uuid4()
    assistant_id = uuid.uuid4()
    conv = Conversation(
        tenant_id=tenant_id,
        assistant_id=assistant_id,
        session_id="session-xyz-123"
    )
    assert conv.session_id == "session-xyz-123"

    msg = Message(
        tenant_id=tenant_id,
        conversation_id=conv.id,
        role="user",
        content="What are your hours?",
        sources=[]
    )
    assert msg.role == "user"
    assert msg.content == "What are your hours?"
    assert msg.sources == []


def test_governance_models():
    tenant_id = uuid.uuid4()
    domain = AllowedDomain(tenant_id=tenant_id, domain="example.com", is_active=True)
    assert domain.domain == "example.com"
    assert domain.is_active is True

    api_key = APIKey(
        tenant_id=tenant_id,
        name="Production Key",
        prefix="cb_live_",
        key_hash="hash_key_123"
    )
    assert api_key.prefix == "cb_live_"

    usage = UsageEvent(
        tenant_id=tenant_id,
        event_type="llm_call",
        tokens_consumed=450,
        cost_estimate=0.0009
    )
    assert usage.tokens_consumed == 450

    log = AuditLog(
        tenant_id=tenant_id,
        action="user_login",
        resource_type="auth",
        ip_address="127.0.0.1"
    )
    assert log.action == "user_login"
