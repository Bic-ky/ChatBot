import uuid
import pytest
from app.models.assistant import Assistant
from app.models.knowledge import KnowledgeBase, Document, DocumentChunk
from app.schemas.assistant import AssistantCreate, AssistantUpdate
from app.schemas.knowledge import KnowledgeBaseCreate, DocumentCreateText
from app.api.deps import TenantContext
from app.models.user import UserRole
from app.core.permissions import has_permission


def test_assistant_schema_validation():
    payload = AssistantCreate(
        name="Support Bot",
        system_prompt="You are a helpful customer support bot.",
        temperature=0.7,
        web_search_enabled=True,
    )
    assert payload.name == "Support Bot"
    assert payload.temperature == 0.7
    assert payload.web_search_enabled is True
    assert payload.model == "gpt-4o-mini"


def test_assistant_update_partial():
    update_data = AssistantUpdate(temperature=0.5)
    dumped = update_data.model_dump(exclude_unset=True)
    assert dumped == {"temperature": 0.5}
    assert "name" not in dumped


def test_knowledge_base_schema():
    asst_id = uuid.uuid4()
    kb = KnowledgeBaseCreate(
        assistant_id=asst_id,
        name="Company Handbook",
        description="Internal policies and procedures",
    )
    assert kb.assistant_id == asst_id
    assert kb.name == "Company Handbook"


def test_document_create_text_schema():
    doc = DocumentCreateText(
        content="Antigravity enterprise platform features include multi-tenancy, RBAC, and RAG.",
        title="Architecture Overview",
    )
    assert len(doc.content) > 0
    assert doc.title == "Architecture Overview"


def test_assistant_model_instantiation():
    t_id = uuid.uuid4()
    assistant = Assistant(
        tenant_id=t_id,
        name="Sales Assistant",
        system_prompt="Assist potential customers.",
        welcome_message="Welcome! What can I show you today?",
        model="gpt-4o",
        temperature=0.3,
        status="active",
    )
    assert assistant.tenant_id == t_id
    assert assistant.name == "Sales Assistant"
    assert assistant.status == "active"


def test_knowledge_and_chunk_chunking_logic():
    t_id = uuid.uuid4()
    kb_id = uuid.uuid4()
    doc_id = uuid.uuid4()

    text_content = "Word " * 200  # 1000 characters
    chunk_size = 500
    overlap = 50

    chunks = []
    start = 0
    while start < len(text_content):
        end = min(start + chunk_size, len(text_content))
        chunk_text = text_content[start:end]
        chunks.append(
            DocumentChunk(
                tenant_id=t_id,
                knowledge_base_id=kb_id,
                document_id=doc_id,
                content=chunk_text,
                metadata_={"start": start, "end": end},
            )
        )
        if end >= len(text_content):
            break
        start += (chunk_size - overlap)

    assert len(chunks) > 1
    for c in chunks:
        assert c.tenant_id == t_id
        assert c.knowledge_base_id == kb_id
        assert len(c.content) <= chunk_size


def test_tenant_context_role_permissions_for_knowledge():
    owner = TenantContext(tenant_id=uuid.uuid4(), user_id=uuid.uuid4(), role=UserRole.OWNER)
    agent = TenantContext(tenant_id=uuid.uuid4(), user_id=uuid.uuid4(), role=UserRole.AGENT)
    viewer = TenantContext(tenant_id=uuid.uuid4(), user_id=uuid.uuid4(), role=UserRole.VIEWER)

    # Owner can write assistant and knowledge
    assert has_permission(owner.role, "assistant:write") is True
    assert has_permission(owner.role, "knowledge:write") is True

    # Agent cannot write assistant or knowledge
    assert has_permission(agent.role, "assistant:write") is False
    assert has_permission(agent.role, "knowledge:write") is False
    assert has_permission(agent.role, "assistant:read") is True

    # Viewer can only read
    assert has_permission(viewer.role, "knowledge:read") is True
    assert has_permission(viewer.role, "knowledge:write") is False
