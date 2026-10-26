from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.dependencies import get_db

from models.user import User
from schemas.user import UserResponse
from auth import get_current_user

router = APIRouter(prefix="/user", tags=["User"])


@router.get("", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def get_user(current_user: User = Depends(get_current_user)):

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found",
        )

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "created_at": current_user.created_at,
    }


@router.get(
    "/search", status_code=status.HTTP_200_OK, response_model=list[UserResponse]
)
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found",
        )

    users = db.query(User).all()
    print(users)

    return [
        UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            created_at=user.created_at,
        )
        for user in users
    ]


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with not found",
        )

    db.delete(current_user)
    db.commit()
