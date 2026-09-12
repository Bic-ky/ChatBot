import asyncio
import asyncpg
import sys

PASSWORDS_TO_TRY = ['changethisinproduction', 'postgres', 'admin', 'root', '1234', '123456', '']

async def test_connection():
    print("[DIAGNOSTIC] Checking PostgreSQL connection on localhost:5432 to database 'chatbot'...")
    connected_pw = None
    
    for pw in PASSWORDS_TO_TRY:
        try:
            conn = await asyncpg.connect(
                user='postgres',
                password=pw,
                host='localhost',
                port=5432,
                database='chatbot',
                timeout=3.0
            )
            print(f"[SUCCESS] Connected successfully with password: {pw!r}")
            connected_pw = pw
            
            # Check vector extension
            ext = await conn.fetch("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'")
            if ext:
                print(f"[SUCCESS] Vector extension is INSTALLED! Version: {ext[0]['extversion']}")
            else:
                print("[WARNING] Extension 'vector' was not found in pg_extension.")
                
            # Check existing tables
            tables = await conn.fetch("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            print(f"[INFO] Existing tables in 'public' schema: {[t['table_name'] for t in tables]}")
            
            await conn.close()
            return connected_pw
            
        except asyncpg.exceptions.InvalidPasswordError:
            print(f"[AUTH] Password {pw!r} is incorrect.")
        except Exception as e:
            print(f"[FAIL] Error with {pw!r}: {type(e).__name__} - {e}")
            if "connection refused" in str(e).lower() or "timeout" in str(e).lower():
                print("[ALERT] Could not reach PostgreSQL on localhost:5432.")
                break
                
    return None

if __name__ == '__main__':
    res = asyncio.run(test_connection())
    if not res:
        print("[RESULT] Could not automatically connect with default passwords.")
        sys.exit(1)
    else:
        print(f"[RESULT] PostgreSQL credentials verified!")
        sys.exit(0)
