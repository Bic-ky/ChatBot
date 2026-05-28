import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import TenantContext, require_permission
from app.core.database import get_db
from app.models.assistant import Assistant
from app.schemas.assistant import AssistantCreate, AssistantResponse, AssistantUpdate

router = APIRouter(prefix="/assistants", tags=["assistants"])


@router.post("", response_model=AssistantResponse, status_code=status.HTTP_201_CREATED)
async def create_assistant(
    payload: AssistantCreate,
    context: TenantContext = Depends(require_permission("assistant:write")),
    db: AsyncSession = Depends(get_db),
):
    assistant = Assistant(
        tenant_id=context.tenant_id,
        name=payload.name,
        description=payload.description,
        system_prompt=payload.system_prompt,
        welcome_message=payload.welcome_message,
        model=payload.model,
        temperature=payload.temperature,
        web_search_enabled=payload.web_search_enabled,
        human_handoff_enabled=payload.human_handoff_enabled,
        status=payload.status,
    )
    db.add(assistant)
    await db.commit()
    await db.refresh(assistant)
    return assistant


@router.get("", response_model=List[AssistantResponse])
async def list_assistants(
    context: TenantContext = Depends(require_permission("assistant:read")),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Assistant)
        .where(Assistant.tenant_id == context.tenant_id)
        .order_by(Assistant.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{assistant_id}", response_model=AssistantResponse)
async def get_assistant(
    assistant_id: uuid.UUID,
    context: TenantContext = Depends(require_permission("assistant:read")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Assistant).where(
        Assistant.id == assistant_id,
        Assistant.tenant_id == context.tenant_id,
    )
    result = await db.execute(stmt)
    assistant = result.scalar_one_or_none()
    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found",
        )
    return assistant


@router.patch("/{assistant_id}", response_model=AssistantResponse)
async def update_assistant(
    assistant_id: uuid.UUID,
    payload: AssistantUpdate,
    context: TenantContext = Depends(require_permission("assistant:write")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Assistant).where(
        Assistant.id == assistant_id,
        Assistant.tenant_id == context.tenant_id,
    )
    result = await db.execute(stmt)
    assistant = result.scalar_one_or_none()
    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assistant, field, value)

    await db.commit()
    await db.refresh(assistant)
    return assistant


@router.delete("/{assistant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assistant(
    assistant_id: uuid.UUID,
    context: TenantContext = Depends(require_permission("assistant:write")),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Assistant).where(
        Assistant.id == assistant_id,
        Assistant.tenant_id == context.tenant_id,
    )
    result = await db.execute(stmt)
    assistant = result.scalar_one_or_none()
    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assistant not found",
        )

    await db.delete(assistant)
    await db.commit()
    return None
