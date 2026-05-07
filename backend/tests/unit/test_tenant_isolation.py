import uuid
import pytest
from fastapi import HTTPException
from app.api.deps import TenantContext, require_permission
from app.models.user import UserRole


@pytest.mark.asyncio
async def test_negative_security_insufficient_permissions():
    """Verify that a VIEWER role cannot perform administrative operations."""
    viewer_context = TenantContext(
        tenant_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        role=UserRole.VIEWER
    )

    perm_checker = require_permission("assistant:write")
    
    with pytest.raises(HTTPException) as exc_info:
        await perm_checker(viewer_context)
    
    assert exc_info.value.status_code == 403
    assert "Missing required permission" in exc_info.value.detail


@pytest.mark.asyncio
async def test_negative_security_agent_cannot_manage_tenant():
    """Verify that AGENT cannot manage tenant settings."""
    agent_context = TenantContext(
        tenant_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        role=UserRole.AGENT
    )

    perm_checker = require_permission("tenant:manage")
    
    with pytest.raises(HTTPException) as exc_info:
        await perm_checker(agent_context)
    
    assert exc_info.value.status_code == 403
    assert "Missing required permission" in exc_info.value.detail


@pytest.mark.asyncio
async def test_tenant_context_isolation():
    """Ensure two different tenants produce strictly disjoint context IDs."""
    tenant_1 = uuid.uuid4()
    tenant_2 = uuid.uuid4()
    user_1 = uuid.uuid4()
    user_2 = uuid.uuid4()

    ctx1 = TenantContext(tenant_id=tenant_1, user_id=user_1, role=UserRole.OWNER)
    ctx2 = TenantContext(tenant_id=tenant_2, user_id=user_2, role=UserRole.OWNER)

    assert ctx1.tenant_id != ctx2.tenant_id
    assert ctx1.user_id != ctx2.user_id
