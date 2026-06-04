"""
app/api/v1/users.py — perfil do usuário e notificações (REQ01, REQ04).
"""

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.schemas.user import NotificationOut, UserOut, UserUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def get_me(user: dict = Depends(get_current_user)):
    return user_service.get_profile(user["id"])


@router.patch("/me", response_model=UserOut)
def update_me(payload: UserUpdate, user: dict = Depends(get_current_user)):
    return user_service.update_profile(user["id"], payload)


@router.get("/me/notifications", response_model=list[NotificationOut])
def my_notifications(user: dict = Depends(get_current_user)):
    return user_service.list_notifications(user["id"])
