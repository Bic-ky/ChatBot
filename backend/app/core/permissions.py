from typing import Dict, Set
from app.models.user import UserRole


ROLE_PERMISSIONS: Dict[UserRole, Set[str]] = {
    UserRole.OWNER: {
        "assistant:read",
        "assistant:write",
        "knowledge:read",
        "knowledge:write",
        "conversation:read",
        "analytics:read",
        "tenant:manage",
        "user:manage",
    },
    UserRole.ADMIN: {
        "assistant:read",
        "assistant:write",
        "knowledge:read",
        "knowledge:write",
        "conversation:read",
        "analytics:read",
    },
    UserRole.AGENT: {
        "assistant:read",
        "knowledge:read",
        "conversation:read",
    },
    UserRole.VIEWER: {
        "assistant:read",
        "knowledge:read",
    },
}


def has_permission(role: UserRole, permission: str) -> bool:
    role_perms = ROLE_PERMISSIONS.get(role, set())
    return permission in role_perms
