from fastapi import APIRouter, Body, Depends, HTTPException, status
from .user_model import ResetUserPasswordRequest, UserCreate
from .user_service import UserService
from ...db.session import SessionDep
from ...utils.auth import CurrentUser, Permission, require_permission
import uuid


router = APIRouter()


@router.get("", status_code=status.HTTP_200_OK)
async def list_users(
    db: SessionDep,
    user: CurrentUser = Depends(require_permission(Permission.MANAGE_USERS))
):
    if not user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not belong to any tenant"
        )

    service = UserService(db)
    result = await service.list_users_by_tenant(user.tenant_id)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
    return result.data


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_bookshop_user(
    db: SessionDep,
    user_data: UserCreate = Body(...),
    user: CurrentUser = Depends(require_permission(Permission.MANAGE_USERS))
):
    if not user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not belong to any tenant"
        )

    if user_data.tenant_id and user_data.tenant_id != user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot create users for another bookshop"
        )

    user_data.tenant_id = user.tenant_id

    service = UserService(db)
    result = await service.create_user(user_data)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )

    return {
        "message": "User created successfully",
        "email": user_data.email,
        "user_role": user_data.user_role
    }


@router.patch("/{user_id}/reset-password", status_code=status.HTTP_200_OK)
async def reset_bookshop_user_password(
    user_id: uuid.UUID,
    password_data: ResetUserPasswordRequest,
    db: SessionDep,
    user: CurrentUser = Depends(require_permission(Permission.MANAGE_USERS))
):
    if not user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not belong to any tenant"
        )

    service = UserService(db)
    result = await service.reset_user_password(
        user_id=user_id,
        tenant_id=user.tenant_id,
        new_password=password_data.new_password
    )
    if not result.success:
        status_code = status.HTTP_404_NOT_FOUND if result.error == "User not found" else status.HTTP_400_BAD_REQUEST
        raise HTTPException(
            status_code=status_code,
            detail=result.error
        )

    return {"message": result.message}
