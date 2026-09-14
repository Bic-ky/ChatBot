import asyncio
import asyncpg
import sys

async def verify():
    print("[1/4] Connecting to PostgreSQL database 'chatbot' with user 'postgres'...")
    try:
        conn = await asyncpg.connect(
            user="postgres",
            password="bicky",
            host="localhost",
            port=5432,
            database="chatbot"
        )
        print("[SUCCESS] Connected to database 'chatbot'!")
    except Exception as e:
        print(f"[FAIL] Could not connect: {e}")
        return False

    print("\n[2/4] Checking installed extensions...")
    exts = await conn.fetch("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';")
    if exts:
        print(f"[SUCCESS] 'vector' extension is active! (Version: {exts[0]['extversion']})")
    else:
        print("[ALERT] 'vector' extension is not enabled yet in 'chatbot'. Enabling it now...")
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        print("[SUCCESS] 'vector' extension created successfully!")

    print("\n[3/4] Testing vector data type capabilities...")
    try:
        val = await conn.fetchval("SELECT '[1,2,3]'::vector <=> '[1,2,4]'::vector;")
        print(f"[SUCCESS] Cosine distance computation test passed! (Distance: {val:.6f})")
    except Exception as e:
        print(f"[FAIL] Vector computation failed: {e}")
        await conn.close()
        return False

    print("\n[4/4] Inspecting existing tables...")
    tables = await conn.fetch("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    table_names = [t["table_name"] for t in tables]
    print(f"Tables currently in public schema: {table_names}")

    await conn.close()
    return True

if __name__ == "__main__":
    ok = asyncio.run(verify())
    sys.exit(0 if ok else 1)
