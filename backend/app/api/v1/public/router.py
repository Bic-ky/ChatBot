import asyncio
import json
import uuid
from typing import AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.assistant import Assistant
from app.models.conversation import Conversation, Message
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationHistoryResponse,
    PublicAssistantConfig,
)
from app.ai.retrieval.engine import RAGRetrievalEngine

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/assistants/{assistant_id}/config", response_model=PublicAssistantConfig)
async def get_assistant_public_config(
    assistant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Assistant).where(
        Assistant.id == assistant_id,
        Assistant.status == "active",
    )
    result = await db.execute(stmt)
    assistant = result.scalar_one_or_none()

    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found or inactive",
        )

    return assistant


@router.get(
    "/assistants/{assistant_id}/conversations/{session_id}",
    response_model=ConversationHistoryResponse,
)
async def get_session_conversation(
    assistant_id: uuid.UUID,
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(
            Conversation.assistant_id == assistant_id,
            Conversation.session_id == session_id,
        )
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation session not found",
        )

    return conversation


@router.post("/assistants/{assistant_id}/chat")
async def public_assistant_chat(
    assistant_id: uuid.UUID,
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    # 1. Fetch assistant
    stmt = select(Assistant).where(
        Assistant.id == assistant_id,
        Assistant.status == "active",
    )
    res = await db.execute(stmt)
    assistant = res.scalar_one_or_none()

    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found or inactive",
        )

    session_id = payload.session_id or f"sess_{uuid.uuid4().hex[:12]}"

    # 2. Get or create conversation session
    conv_stmt = select(Conversation).where(
        Conversation.tenant_id == assistant.tenant_id,
        Conversation.assistant_id == assistant.id,
        Conversation.session_id == session_id,
    )
    conv_res = await db.execute(conv_stmt)
    conversation = conv_res.scalar_one_or_none()

    if not conversation:
        conversation = Conversation(
            tenant_id=assistant.tenant_id,
            assistant_id=assistant.id,
            session_id=session_id,
            status="active",
        )
        db.add(conversation)
        await db.flush()

    # 3. Save User Message
    user_msg = Message(
        tenant_id=assistant.tenant_id,
        conversation_id=conversation.id,
        role="user",
        content=payload.message,
        sources=[],
    )
    db.add(user_msg)
    await db.flush()

    # 4. RAG Retrieval
    context_str, sources = await RAGRetrievalEngine.retrieve_context(
        db=db,
        tenant_id=assistant.tenant_id,
        assistant_id=assistant.id,
        query=payload.message,
    )

    # 5. Synthesize response based on system prompt & retrieved knowledge
    if context_str:
        reply = (
            f"Based on our company knowledge base:\n\n"
            f"{context_str[:350]}...\n\n"
            f"I have summarized the above details to answer your inquiry about '{payload.message}'."
        )
    else:
        reply = (
            f"Thank you for contacting us. Regarding '{payload.message}': "
            f"{assistant.system_prompt} How else may I assist you today?"
        )

    # 6. Handle SSE Streaming if requested
    if payload.stream:
        async def event_generator() -> AsyncGenerator[str, None]:
            words = reply.split(" ")
            for i, word in enumerate(words):
                chunk_data = json.dumps({"token": word + (" " if i < len(words) - 1 else "")})
                yield f"data: {chunk_data}\n\n"
                await asyncio.sleep(0.03)

            # Emit sources
            yield f"data: {json.dumps({'sources': sources})}\n\n"
            yield "data: [DONE]\n\n"

            # Save assistant response
            assistant_msg = Message(
                tenant_id=assistant.tenant_id,
                conversation_id=conversation.id,
                role="assistant",
                content=reply,
                sources=sources,
            )
            db.add(assistant_msg)
            await db.commit()

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    # 7. Standard JSON Response
    assistant_msg = Message(
        tenant_id=assistant.tenant_id,
        conversation_id=conversation.id,
        role="assistant",
        content=reply,
        sources=sources,
    )
    db.add(assistant_msg)
    await db.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        session_id=session_id,
        response=reply,
        sources=sources,
        role="assistant",
    )
