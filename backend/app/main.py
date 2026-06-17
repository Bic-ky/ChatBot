import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import redis.asyncio as aioredis

from app.core.config import settings
from app.core.database import engine
from app.core.exceptions import (
    ChatBotException,
    TenantNotFoundError,
    UnauthorizedTenantAccessError,
    ResourceNotFoundError,
    PromptInjectionError
)
from app.api.v1.auth.router import router as auth_router
from app.api.v1.assistants.router import router as assistants_router
from app.api.v1.knowledge.router import router as knowledge_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(assistants_router, prefix=settings.API_V1_STR)
app.include_router(knowledge_router, prefix=settings.API_V1_STR)


# Exception Handlers
@app.exception_handler(TenantNotFoundError)
async def tenant_not_found_handler(request: Request, exc: TenantNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": "TenantNotFound", "detail": exc.message}
    )


@app.exception_handler(UnauthorizedTenantAccessError)
async def unauthorized_tenant_handler(request: Request, exc: UnauthorizedTenantAccessError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"error": "UnauthorizedTenantAccess", "detail": exc.message}
    )


@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_handler(request: Request, exc: ResourceNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": "ResourceNotFound", "detail": exc.message}
    )


@app.exception_handler(PromptInjectionError)
async def prompt_injection_handler(request: Request, exc: PromptInjectionError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": "PromptSecurityViolation", "detail": exc.message}
    )


# Root & Redirect Endpoints
@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "documentation": "/docs",
        "health_check": "/health",
        "api_v1_base": settings.API_V1_STR,
    }


@app.get(f"{settings.API_V1_STR}/docs", include_in_schema=False)
async def api_v1_docs():
    return RedirectResponse(url="/docs")


# Health Endpoints (Accessible at /health, /api/health, and /api/v1/health)
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"], include_in_schema=False)
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"], include_in_schema=False)
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }


@app.get("/health/db", tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health/db", tags=["Health"], include_in_schema=False)
async def health_db():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as exc:
        logger.error(f"Database health check failed: {exc}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "database": "unreachable", "detail": str(exc)}
        )


@app.get("/health/redis", tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health/redis", tags=["Health"], include_in_schema=False)
async def health_redis():
    try:
        client = aioredis.from_url(settings.REDIS_URL, socket_timeout=2)
        await client.ping()
        await client.aclose()
        return {"status": "healthy", "redis": "connected"}
    except Exception as exc:
        logger.error(f"Redis health check failed: {exc}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "redis": "unreachable", "detail": str(exc)}
        )


@app.get(f"{settings.API_V1_STR}/status", tags=["Status"])
async def api_status():
    return {
        "api_version": "v1",
        "status": "operational"
    }
