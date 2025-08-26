from fastapi import Depends, Request, HTTPException, status
from .tokens import decode_access_token
from typing import List, Optional, Callable
from pydantic import BaseModel, Field
import uuid
from enum import Enum

# Enums for user roles
class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    MANAGER = "manager"
    CASHIER = "cashier"
    VIEWER = "viewer"
    EDITOR = "editor"

# Models for authentication
class TokenPayload(BaseModel):
    """Model for JWT token payload"""
    email: str = Field(..., description="User email address")
    role: UserRole = Field(..., description="User role")
    user_id: uuid.UUID = Field(..., description="User ID")
    tenant_id: Optional[uuid.UUID] = Field(default=None, description="Tenant ID")
    exp: Optional[int] = Field(None, description="Token expiration timestamp")
    iat: Optional[int] = Field(None, description="Token issued at timestamp")

class CurrentUser(BaseModel):
    """Model for current authenticated user"""
    email: str = Field(..., description="User email address")
    role: UserRole = Field(..., description="User role")
    user_id: uuid.UUID = Field(..., description="User ID")
    tenant_id: Optional[uuid.UUID] = Field(default=None, description="Tenant ID")

    class Config:
        use_enum_values = True

class AuthenticationError(BaseModel):
    """Model for authentication errors"""
    detail: str
    status_code: int
    headers: Optional[dict] = None

# Type for role checker function
RoleCheckerFunction = Callable[[CurrentUser], CurrentUser]

def get_current_user(request: Request) -> CurrentUser:
    """
    Extracts the current user from the request by decoding the access token.
    
    Args:
        request: FastAPI Request object containing cookies
        
    Returns:
        CurrentUser: Authenticated user information
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    token: Optional[str] = request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        token = token[7:]
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload: Optional[dict] = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Validate and create CurrentUser from payload
        return CurrentUser(
            email=payload.get("email"),
            role=payload.get("role"),
            user_id=uuid.UUID(str(payload.get("user_id"))),
            tenant_id=uuid.UUID(str(payload.get("tenant_id"))) if payload.get("tenant_id") else None
        )
    except (ValueError, TypeError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token payload: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_role(roles: List[UserRole]) -> RoleCheckerFunction:
    """
    Dependency to ensure the user has one of the required roles.
    
    Args:
        roles: List of allowed user roles
        
    Returns:
        RoleCheckerFunction: Function that checks user role and returns user if authorized
        
    Example:
        @router.get("/admin-only")
        async def admin_endpoint(user: CurrentUser = Depends(require_role([UserRole.ADMIN]))):
            return {"message": "Admin access granted"}
    """
    def role_checker(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {[role.value for role in roles]}, user role: {user.role.value}",
            )
        return user

    return role_checker

# Additional utility functions with proper typing
def require_superadmin() -> RoleCheckerFunction:
    """Shortcut for superadmin-only access"""
    return require_role([UserRole.SUPERADMIN])

def require_admin() -> RoleCheckerFunction:
    """Shortcut for admin-only access"""
    return require_role([UserRole.ADMIN])

def require_manager_or_admin() -> RoleCheckerFunction:
    """Shortcut for manager or admin access"""
    return require_role([UserRole.ADMIN, UserRole.MANAGER])

def require_staff() -> RoleCheckerFunction:
    """Shortcut for staff access (admin, manager, cashier)"""
    return require_role([UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER])

def get_current_tenant_id(user: CurrentUser = Depends(get_current_user)) -> uuid.UUID:
    """
    Extract tenant ID from current user.
    
    Args:
        user: Current authenticated user
        
    Returns:
        uuid.UUID: Tenant ID of the current user
    """
    if not user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not belong to any tenant"
        )
    return uuid.UUID(user.tenant_id)

def get_current_user_id(user: CurrentUser = Depends(get_current_user)) -> uuid.UUID:
    """
    Extract user ID from current user.
    
    Args:
        user: Current authenticated user
        
    Returns:
        uuid.UUID: User ID of the current user
    """
    return uuid.UUID(user.user_id)

# Enhanced permission checking
class Permission(str, Enum):
    """Fine-grained permissions"""
    READ_BOOKS = "read:books"
    WRITE_BOOKS = "write:books"
    READ_SALES = "read:sales"
    WRITE_SALES = "write:sales"
    READ_INVENTORY = "read:inventory"
    WRITE_INVENTORY = "write:inventory"
    READ_SUPPLIERS = "read:suppliers"
    WRITE_SUPPLIERS = "write:suppliers"
    MANAGE_USERS = "manage:users"
    MANAGE_SETTINGS = "manage:settings"
    MANAGE_TENANTS = "manage:tenants"
    MANAGE_PURCHASE_ORDERS = "manage:purchase_orders"


# Role-based permissions mapping
ROLE_PERMISSIONS = {
    UserRole.SUPERADMIN: [
        Permission.MANAGE_TENANTS,
    ],
    UserRole.ADMIN: [
        Permission.READ_BOOKS, Permission.WRITE_BOOKS,
        Permission.READ_SALES, Permission.WRITE_SALES,
        Permission.READ_INVENTORY, Permission.WRITE_INVENTORY,
        Permission.READ_SUPPLIERS, Permission.WRITE_SUPPLIERS,
        Permission.MANAGE_USERS, Permission.MANAGE_SETTINGS,
        Permission.MANAGE_PURCHASE_ORDERS
    ],
    UserRole.MANAGER: [
        Permission.READ_BOOKS, Permission.WRITE_BOOKS,
        Permission.READ_SALES, Permission.WRITE_SALES,
        Permission.READ_INVENTORY, Permission.WRITE_INVENTORY,
        Permission.READ_SUPPLIERS, Permission.WRITE_SUPPLIERS,
        Permission.MANAGE_SETTINGS,
        Permission.MANAGE_PURCHASE_ORDERS
    ],
    UserRole.CASHIER: [
        Permission.READ_BOOKS,
        Permission.READ_SALES, Permission.WRITE_SALES,
        Permission.READ_INVENTORY
    ],
    UserRole.VIEWER: [
        Permission.READ_BOOKS,
        Permission.READ_SALES,
        Permission.READ_INVENTORY,
        Permission.READ_SUPPLIERS
    ],
    UserRole.EDITOR: [
        Permission.READ_BOOKS, Permission.WRITE_BOOKS,
        Permission.READ_INVENTORY, Permission.WRITE_INVENTORY
    ]
}

def require_permission(permission: Permission) -> RoleCheckerFunction:
    """
    Dependency to ensure the user has the required permission.
    
    Args:
        permission: Required permission
        
    Returns:
        RoleCheckerFunction: Function that checks user permission and returns user if authorized
    """
    def permission_checker(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        user_permissions = ROLE_PERMISSIONS.get(user.role, [])
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required permission: {permission.value}",
            )
        return user
    
    return permission_checker

# Enhanced user model with permissions
class CurrentUserWithPermissions(CurrentUser):
    """Extended user model with permissions"""
    permissions: List[Permission] = Field(default_factory=list)
    
    @classmethod
    def from_current_user(cls, user: CurrentUser) -> 'CurrentUserWithPermissions':
        """Create enhanced user from basic user"""
        permissions = ROLE_PERMISSIONS.get(user.role, [])
        return cls(
            email=user.email,
            role=user.role,
            user_id=user.user_id,
            tenant_id=user.tenant_id,
            permissions=permissions
        )

def get_current_user_with_permissions(
    user: CurrentUser = Depends(get_current_user)
) -> CurrentUserWithPermissions:
    """
    Get current user with their permissions included.
    
    Args:
        user: Current authenticated user
        
    Returns:
        CurrentUserWithPermissions: User with permissions list
    """
    return CurrentUserWithPermissions.from_current_user(user)