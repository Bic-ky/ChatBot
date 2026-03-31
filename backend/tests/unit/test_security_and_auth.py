import uuid
import pytest
from app.core.security import (
     get_password_hash,
     verify_password,
     create_access_token,
     create_refresh_token,
     decode_token
 )
from app.core.permissions import has_permission, ROLE_PERMISSIONS
from app.models.user import UserRole


def test_password_hashing():
    raw = "SuperSecretPassword123!"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_access_and_refresh_tokens():
    user_id = uuid.uuid4()
    tenant_id = uuid.uuid4()
    role = "OWNER"

    access_token = create_access_token(user_id, tenant_id, role)
    payload = decode_token(access_token)
    assert payload["sub"] == str(user_id)
    assert payload["tenant_id"] == str(tenant_id)
    assert payload["role"] == role
    assert payload["type"] == "access"

    refresh_token = create_refresh_token(user_id, tenant_id)
    refresh_payload = decode_token(refresh_token)
    assert refresh_payload["sub"] == str(user_id)
    assert refresh_payload["tenant_id"] == str(tenant_id)
    assert refresh_payload["type"] == "refresh"


def test_rbac_permissions():
    # OWNER has all permissions
    assert has_permission(UserRole.OWNER, "tenant:manage") is True
    assert has_permission(UserRole.OWNER, "assistant:write") is True
    assert has_permission(UserRole.OWNER, "knowledge:write") is True

    # ADMIN cannot manage tenant
    assert has_permission(UserRole.ADMIN, "assistant:write") is True
    assert has_permission(UserRole.ADMIN, "tenant:manage") is False

    # VIEWER can only read
    assert has_permission(UserRole.VIEWER, "assistant:read") is True
    assert has_permission(UserRole.VIEWER, "assistant:write") is False
    assert has_permission(UserRole.VIEWER, "knowledge:write") is False
