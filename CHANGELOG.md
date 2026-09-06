# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2026-03-05
### Added
- Added root route `GET /` returning documentation, status, and health links.
- Added `/docs` Swagger UI entrypoint and URL aliases for `/api/health` and `/api/v1/health`.

## [0.3.1] - 2026-03-04
### Fixed
- Fixed editable package discovery in backend/pyproject.toml by setting custom setuptools find patterns and adding backend/README.md.
- Updated internal package imports from backend.app to app for clean modular execution.
- Configured full dev dependencies (pytest, pytest-asyncio, ruff, mypy) in backend package.

## [0.3.0] - 2026-03-03
### Added
- Multi-tenant isolation dependencies, TenantContext, and negative security tests.
- JWT authentication (access & refresh tokens) and Argon2id password hashing.
- RBAC permissions framework for OWNER, ADMIN, AGENT, and VIEWER roles.
- Authentication API endpoints: /register, /login, /refresh, /logout, /me.
- Updated auto-commit pipeline threshold to 20 lines with automatic progressive push.

## [0.2.0] - 2026-03-02
### Added
- Multi-tenant database models: Tenant, User, Assistant, KnowledgeBase, Document, DocumentChunk, Conversation, Message, AllowedDomain, APIKey, UsageEvent, AuditLog.
- Integrated `pgvector` vector embedding column in DocumentChunk.
- Async Alembic migration environment and initial schema migration `001_initial_schema`.
- Health check endpoints: `/health`, `/health/db`, and `/health/redis`.
- Celery worker infrastructure with Redis broker (`backend/app/workers/celery_app.py`).
- Unit test suite verifying health routes and model constraints.

## [0.1.0] - 2026-03-01
### Added
- Master implementation specification (`IMPLEMENTATION_PLAN.md`).
- Multi-tenant architecture blueprint and directory scaffolding.
- FastAPI backend structure with async database session handling.
- Development automation and auto-commit pipeline scripts.
- GitHub Actions CI/CD workflows for linting, security, and tests.
