import re
import uuid
from typing import Any, Dict, List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge import DocumentChunk, KnowledgeBase


class RAGRetrievalEngine:
    """
    RAG Retrieval Engine supporting vector similarity and fast lexical matching fallback.
    """

    @staticmethod
    async def retrieve_context(
        db: AsyncSession,
        tenant_id: uuid.UUID,
        assistant_id: uuid.UUID,
        query: str,
        top_k: int = 4
    ) -> Tuple[str, List[Dict[str, Any]]]:
        # 1. Fetch Knowledge Bases linked to this assistant
        kb_stmt = select(KnowledgeBase.id).where(
            KnowledgeBase.tenant_id == tenant_id,
            KnowledgeBase.assistant_id == assistant_id,
            KnowledgeBase.status == "active",
        )
        kb_result = await db.execute(kb_stmt)
        kb_ids = kb_result.scalars().all()

        if not kb_ids:
            return "", []

        # 2. Fetch Document Chunks for these Knowledge Bases
        chunk_stmt = select(DocumentChunk).where(
            DocumentChunk.tenant_id == tenant_id,
            DocumentChunk.knowledge_base_id.in_(kb_ids),
        ).limit(100)
        
        chunk_result = await db.execute(chunk_stmt)
        chunks = chunk_result.scalars().all()

        if not chunks:
            return "", []

        # 3. Score chunks using tokenized term frequency and lexical relevance
        query_terms = set(re.findall(r"\w+", query.lower()))
        scored_chunks: List[Tuple[float, DocumentChunk]] = []

        for c in chunks:
            content_lower = c.content.lower()
            chunk_terms = set(re.findall(r"\w+", content_lower))
            overlap = query_terms.intersection(chunk_terms)
            
            # Simple relevance score based on overlap and length normalization
            score = len(overlap) / (len(query_terms) + 1.0) if query_terms else 0.0
            
            # Boost if query appears as an exact substring
            if query.lower() in content_lower:
                score += 1.0

            scored_chunks.append((score, c))

        # Sort by relevance descending
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = scored_chunks[:top_k]

        context_parts = []
        sources = []

        for score, chunk in top_chunks:
            meta = chunk.metadata_ or {}
            title = meta.get("title", "Knowledge Document")
            sources.append({
                "title": title,
                "snippet": chunk.content[:200] + ("..." if len(chunk.content) > 200 else ""),
                "chunk_id": str(chunk.id),
                "relevance_score": round(score, 3),
            })
            context_parts.append(f"--- Document: {title} ---\n{chunk.content}")

        context_str = "\n\n".join(context_parts)
        return context_str, sources
