class ChatBotException(Exception):
    """Base exception for all ChatBot domain exceptions."""
    def __init__(self, message: str = "An unexpected error occurred"):
        self.message = message
        super().__init__(self.message)


class TenantNotFoundError(ChatBotException):
    """Raised when a requested tenant does not exist."""
    def __init__(self, tenant_id: str):
        super().__init__(f"Tenant not found: {tenant_id}")


class UnauthorizedTenantAccessError(ChatBotException):
    """Raised when an operation attempts to access data outside the authenticated tenant."""
    def __init__(self, message: str = "Unauthorized cross-tenant data access"):
        super().__init__(message)


class ResourceNotFoundError(ChatBotException):
    """Raised when a specific tenant resource is not found."""
    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(f"{resource_type} not found with id: {resource_id}")


class PromptInjectionError(ChatBotException):
    """Raised when suspicious prompt injection patterns are detected."""
    def __init__(self, message: str = "Suspicious prompt input blocked by guardrails"):
        super().__init__(message)
