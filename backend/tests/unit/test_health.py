import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data


@pytest.mark.asyncio
async def test_api_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"


@pytest.mark.asyncio
async def test_health_db_fallback_when_down():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health/db")
    # Will return 200 if Postgres is running locally, or 503 if not running
    assert response.status_code in [200, 503]
    data = response.json()
    assert "status" in data


@pytest.mark.asyncio
async def test_health_redis_fallback_when_down():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health/redis")
    # Will return 200 if Redis is running locally, or 503 if not running
    assert response.status_code in [200, 503]
    data = response.json()
    assert "status" in data
