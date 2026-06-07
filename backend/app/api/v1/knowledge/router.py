import hashlib
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import TenantContext, require_permission
from app.core.database import get_db
from app.models.assistant import Assistant
from app.models.knowledge import Document, DocumentChunk, KnowledgeBase
from app.schemas.knowledge import (
    DocumentChunkResponse,
    DocumentCreateText,
    DocumentResponse,
    KnowledgeBaseCreate,
    KnowledgeBaseResponse,
    KnowledgeBaseUpdate,
)

router = APIRouter(tags=["knowledge"])


# --- Knowledge Bases ---

@router.post("/knowledge-bases", response_model=KnowledgeBaseResponse, status_code=status.HTTP_201_CREATED)
async def create_knowledge_base(
    payload: KnowledgeBaseCreate,
    context: TenantContext = Depends(require_permission("knowledge:write")),
    db: AsyncSession = Depends(get_db),
):
    # Verify assistant belongs to tenant
    asst_stmt = select(Assistant).where(
        Assistant.id == payload.assistant_id,
        Assistant.tenant_id == context.tenant_id,
    )
    asst_res = await db.execute(asst_stmt)
    if not asst_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referenced assistant not found in tenant",
        )

    kb = KnowledgeBase(
        tenant_id=context.tenant_id,
        assistant_id=payload.assistant_id,
        name=payload.name,
        description=payload.description,
        status=payload.status,
    )
    db.add(kb)
    await db.commit()
    await db.refresh(kb)
    return kb


@router.get("/knowledge-bases", response_model=List[KnowledgeBaseResponse])
async def list_knowledge_bases(
    context: TenantContext = Depends(require_permission("knowledge:read")),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(KnowledgeBase)
        .where(KnowledgeBase.tenant_id == context.tenant_id)
        .order_by(KnowledgeBase.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/knowledge-bases/{kb_id}", response_model=KnowledgeBaseResponse)
async def get_knowledge_base(
    kb_id: uuid.UUID,
    context: TenantContext = Depends(require_permission("knowledge:read")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(KnowledgeBase).where(
        KnowledgeBase.id == kb_id,
        KnowledgeBase.tenant_id == context.tenant_id,
    )
    res = await db.execute(stmt)
    kb = res.scalar_one_or_none()
    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )
    return kb


@router.patch("/knowledge-bases/{kb_id}", response_model=KnowledgeBaseResponse)
async def update_knowledge_base(
    kb_id: uuid.UUID,
    payload: KnowledgeBaseUpdate,
    context: TenantContext = Depends(require_permission("knowledge:write")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(KnowledgeBase).where(
        KnowledgeBase.id == kb_id,
        KnowledgeBase.tenant_id == context.tenant_id,
    )
    res = await db.execute(stmt)
    kb = res.scalar_one_or_none()
    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(kb, field, val)

    await db.commit()
    await db.refresh(kb)
    return kb


@router.delete("/knowledge-bases/{kb_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge_base(
    kb_id: uuid.UUID,
    context: TenantContext = Depends(require_permission("knowledge:write")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(KnowledgeBase).where(
        KnowledgeBase.id == kb_id,
        KnowledgeBase.tenant_id == context.tenant_id,
    )
    res = await db.execute(stmt)
    kb = res.scalar_one_or_none()
    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )

    await db.delete(kb)
    await db.commit()
    return None


# --- Documents & Text Ingestion ---

@router.post("/knowledge-bases/{kb_id}/documents/text", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def ingest_text_document(
    kb_id: uuid.UUID,
    payload: DocumentCreateText,
    context: TenantContext = Depends(require_permission("knowledge:write")),
    db: AsyncSession = Depends(get_db),
):
    # Verify KB belongs to tenant
    kb_stmt = select(KnowledgeBase).where(
        KnowledgeBase.id == kb_id,
        KnowledgeBase.tenant_id == context.tenant_id,
    )
    kb_res = await db.execute(kb_stmt)
    kb = kb_res.scalar_one_or_none()
    if not kb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )

    content_hash = hashlib.sha256(payload.content.encode("utf-8")).hexdigest()

    doc = Document(
        tenant_id=context.tenant_id,
        knowledge_base_id=kb_id,
        source_type="text",
        content_hash=content_hash,
        status="ready",
    )
    db.add(doc)
    await db.flush()

    # Simple recursive text chunker (default 500 chars)
    chunk_size = 500
    overlap = 50
    text = payload.content.strip()
    start = 0
    chunks_to_add = []

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk_text = text[start:end]
        meta = {
            "title": payload.title or "Untitled Document",
            "start": start,
            "end": end,
            **(payload.metadata or {}),
        }
        chunk = DocumentChunk(
            tenant_id=context.tenant_id,
            knowledge_base_id=kb_id,
            document_id=doc.id,
            content=chunk_text,
            metadata_=meta,
        )
        chunks_to_add.append(chunk)
        if end >= len(text):
            break
        start += (chunk_size - overlap)

    db.add_all(chunks_to_add)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.get("/knowledge-bases/{kb_id}/documents", response_model=List[DocumentResponse])
async def list_documents(
    kb_id: uuid.UUID,
    context: TenantContext = Depends(require_permission("knowledge:read")),
    db: AsyncSession = Depends(get_db),
):
    # Verify KB belongs to tenant
    kb_stmt = select(KnowledgeBase).where(
        KnowledgeBase.id == kb_id,
        KnowledgeBase.tenant_id == context.tenant_id,
    )
    kb_res = await db.execute(kb_stmt)
    if not kb_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )

    stmt = (
        select(Document)
        .where(
            Document.knowledge_base_id == kb_id,
            Document.tenant_id == context.tenant_id,
        )
        .order_by(Document.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.delete("/knowledge-bases/{kb_id}/documents/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    kb_id: uuid.UUID,
    doc_id: uuid.UUID,
    context: TenantContext = Depends(require_permission("knowledge:write")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Document).where(
        Document.id == doc_id,
        Document.knowledge_base_id == kb_id,
        Document.tenant_id == context.tenant_id,
    )
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    await db.delete(doc)
    await db.commit()
    return None


@router.get("/knowledge-bases/{kb_id}/chunks", response_model=List[DocumentChunkResponse])
async def list_chunks(
    kb_id: uuid.UUID,
    context: TenantContext = Depends(require_permission("knowledge:read")),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(DocumentChunk)
        .where(
            DocumentChunk.knowledge_base_id == kb_id,
            DocumentChunk.tenant_id == context.tenant_id,
        )
        .order_by(DocumentChunk.created_at.asc())
    )
    res = await db.execute(stmt)
    chunks = res.scalars().all()
    # Map metadata_ to metadata in response schema
    return [
        DocumentChunkResponse(
            id=c.id,
            tenant_id=c.tenant_id,
            knowledge_base_id=c.knowledge_base_id,
            document_id=c.document_id,
            content=c.content,
            metadata=c.metadata_,
            created_at=c.created_at,
        )
        for c in chunks
    ]
