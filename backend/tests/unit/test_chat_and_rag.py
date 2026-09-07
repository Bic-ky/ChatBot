import json
import uuid
import pytest
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    PublicAssistantConfig,
    MessageItem,
    ConversationHistoryResponse,
)
from app.models.assistant import Assistant
from app.models.knowledge import KnowledgeBase, DocumentChunk
from app.models.conversation import Conversation, Message
from app.ai.retrieval.engine import RAGRetrievalEngine


def test_chat_schemas():
    req = ChatRequest(message="What are your support hours?", stream=True)
    assert req.message == "What are your support hours?"
    assert req.stream is True

    resp = ChatResponse(
        conversation_id=uuid.uuid4(),
        session_id="sess_123",
        response="We are open 24/7.",
        sources=[{"title": "FAQ", "snippet": "Support is available 24/7"}],
    )
    assert resp.session_id == "sess_123"
    assert len(resp.sources) == 1
    assert resp.role == "assistant"


def test_public_assistant_config_schema():
    asst_id = uuid.uuid4()
    config = PublicAssistantConfig(
        id=asst_id,
        name="Support Bot",
        welcome_message="Hi there!",
        status="active",
        human_handoff_enabled=True,
    )
    assert config.id == asst_id
    assert config.name == "Support Bot"
    assert config.human_handoff_enabled is True


def test_conversation_and_message_schemas():
    conv_id = uuid.uuid4()
    msg_id = uuid.uuid4()
    history = ConversationHistoryResponse(
        id=conv_id,
        session_id="sess_abc",
        status="active",
        messages=[
            MessageItem(
                id=msg_id,
                role="user",
                content="Hello",
                sources=[],
                created_at="2026-09-06T12:00:00Z",
            )
        ],
    )
    assert history.id == conv_id
    assert len(history.messages) == 1
    assert history.messages[0].role == "user"


@pytest.mark.asyncio
async def test_rag_retrieval_engine_no_kbs(monkeypatch):
    class MockResult:
        def scalars(self):
            class ScalarResult:
                def all(self):
                    return []
            return ScalarResult()

    class MockSession:
        async def execute(self, stmt):
            return MockResult()

    context, sources = await RAGRetrievalEngine.retrieve_context(
        db=MockSession(),
        tenant_id=uuid.uuid4(),
        assistant_id=uuid.uuid4(),
        query="What is your return policy?",
    )
    assert context == ""
    assert sources == []


@pytest.mark.asyncio
async def test_rag_retrieval_engine_with_matching_chunks():
    t_id = uuid.uuid4()
    kb_id = uuid.uuid4()
    asst_id = uuid.uuid4()

    chunk1 = DocumentChunk(
        tenant_id=t_id,
        knowledge_base_id=kb_id,
        document_id=uuid.uuid4(),
        content="Our return policy permits returns within 30 days of purchase.",
        metadata_={"title": "Returns & Refunds"},
    )
    chunk2 = DocumentChunk(
        tenant_id=t_id,
        knowledge_base_id=kb_id,
        document_id=uuid.uuid4(),
        content="Our office headquarters is located in San Francisco, California.",
        metadata_={"title": "Locations"},
    )

    class MockResultKB:
        def scalars(self):
            class ScalarResult:
                def all(self):
                    return [kb_id]
            return ScalarResult()

    class MockResultChunks:
        def scalars(self):
            class ScalarResult:
                def all(self):
                    return [chunk1, chunk2]
            return ScalarResult()

    class MockSession:
        def __init__(self):
            self.call_count = 0

        async def execute(self, stmt):
            self.call_count += 1
            if self.call_count == 1:
                return MockResultKB()
            return MockResultChunks()

    context, sources = await RAGRetrievalEngine.retrieve_context(
        db=MockSession(),
        tenant_id=t_id,
        assistant_id=asst_id,
        query="return policy 30 days",
        top_k=2,
    )

    assert "Returns & Refunds" in context
    assert len(sources) == 2
    # The return policy chunk should have highest relevance score
    assert sources[0]["title"] == "Returns & Refunds"
    assert sources[0]["relevance_score"] > sources[1]["relevance_score"]
