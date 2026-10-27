from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.dependencies import get_db
from services.auth0_management import get_management_token
import requests
from models.user import User
from schemas.user import UserResponse
from auth import get_current_user
from utils import env_var

AUTH0_DOMAIN = env_var("API_AUTH0_DOMAIN")

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

    # get an auth0 management token to talk to the management api
    management_token = get_management_token()
    auth0_sub = current_user.auth0_sub

    # delete the auth0 account
    response = requests.delete(
        f"https://{AUTH0_DOMAIN}/api/v2/users/"
        f"{requests.utils.quote(auth0_sub, safe='')}",
        headers={"Authorization": f"Bearer {management_token}"},
        timeout=10,
    )

    if not response.ok:
        print("Delete status:", response.status_code)
        print("Delete error:", response.text)

    response.raise_for_status()

    # remove the users account from our system
    if response.status_code == 204:
        db.delete(current_user)
        db.commit()
