import asyncio
import uuid
import asyncpg

DATABASE_URL = "postgresql://postgres:bicky@localhost:5432/chatbot"

async def main():
    print("=" * 60)
    print("      ChatBot Database & pgvector Verification Test")
    print("=" * 60)
    
    conn = await asyncpg.connect(user="postgres", password="bicky", host="localhost", port=5432, database="chatbot")
    
    # 1. Verify Tables
    tables = await conn.fetch("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    table_names = [t["table_name"] for t in tables]
    print(f"\n[1] Tables Created in Database ({len(table_names)} total):")
    for t in table_names:
        print(f"    - {t}")
        
    assert "document_chunks" in table_names, "document_chunks table missing!"
    assert "tenants" in table_names, "tenants table missing!"
    assert "assistants" in table_names, "assistants table missing!"

    # 2. Verify Column Type of embedding
    col = await conn.fetchrow("""
        SELECT column_name, udt_name 
        FROM information_schema.columns 
        WHERE table_name = 'document_chunks' AND column_name = 'embedding';
    """)
    print(f"\n[2] Vector Column Verification:")
    print(f"    Column: {col['column_name']} | Type: {col['udt_name']}")
    assert col["udt_name"] == "vector", "embedding column is not a pgvector!"

    # 3. Create Sample Tenant, Assistant, KB & Test Vectors
    print("\n[3] Testing Multi-Tenant Record Creation & Vector Insertion...")
    tenant_id = uuid.uuid4()
    await conn.execute("""
        INSERT INTO tenants (id, name, slug, status, created_at, updated_at)
        VALUES ($1, 'Acme AI Labs', 'acme-labs', 'active', NOW(), NOW());
    """, tenant_id)

    assistant_id = uuid.uuid4()
    await conn.execute("""
        INSERT INTO assistants (id, tenant_id, name, description, system_prompt, welcome_message, model, temperature, web_search_enabled, human_handoff_enabled, status, created_at, updated_at)
        VALUES ($1, $2, 'Customer Support Bot', 'AI assistant for Acme', 'Be helpful and concise.', 'Hello!', 'gpt-4o-mini', 0.2, false, false, 'active', NOW(), NOW());
    """, assistant_id, tenant_id)

    kb_id = uuid.uuid4()
    await conn.execute("""
        INSERT INTO knowledge_bases (id, tenant_id, assistant_id, name, description, status, created_at, updated_at)
        VALUES ($1, $2, $3, 'Product Handbook', 'Documentation for products', 'active', NOW(), NOW());
    """, kb_id, tenant_id, assistant_id)

    doc_id = uuid.uuid4()
    await conn.execute("""
        INSERT INTO documents (id, tenant_id, knowledge_base_id, source_type, content_hash, status, created_at, updated_at)
        VALUES ($1, $2, $3, 'text', 'hash123', 'ready', NOW(), NOW());
    """, doc_id, tenant_id, kb_id)

    # Insert 3 chunks with 1536-dimensional vectors
    # We will give chunk 1 a high similarity to query vector, and chunk 2 and 3 different vectors
    v1 = [0.0] * 1536
    v1[0] = 0.99
    v1[1] = 0.12

    v2 = [0.0] * 1536
    v2[100] = 0.95
    v2[101] = 0.20

    v3 = [0.0] * 1536
    v3[500] = 0.88
    v3[501] = 0.35

    def vec_to_str(v):
        return "[" + ",".join(f"{x:.4f}" for x in v) + "]"

    chunk1_id = uuid.uuid4()
    await conn.execute("""
        INSERT INTO document_chunks (id, tenant_id, knowledge_base_id, document_id, content, embedding, metadata, created_at)
        VALUES ($1, $2, $3, $4, 'Our return policy is 30 days from the original purchase date.', $5::vector, '{"title": "Refund Policy"}'::jsonb, NOW());
    """, chunk1_id, tenant_id, kb_id, doc_id, vec_to_str(v1))

    chunk2_id = uuid.uuid4()
    await conn.execute("""
        INSERT INTO document_chunks (id, tenant_id, knowledge_base_id, document_id, content, embedding, metadata, created_at)
        VALUES ($1, $2, $3, $4, 'Our international shipping takes between 3 to 5 business days.', $5::vector, '{"title": "Shipping Info"}'::jsonb, NOW());
    """, chunk2_id, tenant_id, kb_id, doc_id, vec_to_str(v2))

    chunk3_id = uuid.uuid4()
    await conn.execute("""
        INSERT INTO document_chunks (id, tenant_id, knowledge_base_id, document_id, content, embedding, metadata, created_at)
        VALUES ($1, $2, $3, $4, 'Enterprise accounts feature dedicated VPC and 99.99% uptime SLA.', $5::vector, '{"title": "Enterprise SLA"}'::jsonb, NOW());
    """, chunk3_id, tenant_id, kb_id, doc_id, vec_to_str(v3))

    print("    -> Inserted 3 document chunks with 1536-dimensional vector embeddings!")

    # 4. Perform Cosine Similarity Search
    print("\n[4] Performing Cosine Similarity Semantic Search (<=> operator)...")
    # Query vector close to v1 (return policy)
    query_vec = [0.0] * 1536
    query_vec[0] = 0.98
    query_vec[1] = 0.15

    results = await conn.fetch("""
        SELECT 
            id,
            content,
            metadata->>'title' AS title,
            ROUND((1 - (embedding <=> $1::vector))::numeric, 4) AS similarity_score
        FROM document_chunks
        WHERE tenant_id = $2
        ORDER BY embedding <=> $1::vector ASC
        LIMIT 3;
    """, vec_to_str(query_vec), tenant_id)

    print("    Search Results Ordered by Vector Similarity:")
    for idx, r in enumerate(results, 1):
        print(f"    {idx}. [{r['title']}] Score: {r['similarity_score']} | Excerpt: {r['content']}")

    # Check that Refund Policy ranked #1
    assert results[0]["title"] == "Refund Policy", "Semantic search ranking incorrect!"
    print(f"\n[SUCCESS] Correct chunk ranked #1 with similarity score {results[0]['similarity_score']}!")

    # 5. Check vector_dims function
    dims = await conn.fetchval("SELECT vector_dims(embedding) FROM document_chunks WHERE id = $1;", chunk1_id)
    print(f"\n[5] Verified vector dimensions via vector_dims(): {dims} (Expected: 1536)")
    assert dims == 1536

    await conn.close()
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED! PostgreSQL + pgvector is 100% operational!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
