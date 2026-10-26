from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.dependencies import get_db

from models.user import User
from schemas.user import CreateUser, UserResponse

router = APIRouter(prefix="/user", tags=["User"])


@router.get("", status_code=status.HTTP_200_OK, response_model=UserResponse)
async def get_user(id: int | None = None, db: Session = Depends(get_db)):

    user_by_id = db.query(User).filter_by(id=id).first()

    if user_by_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {id} not found",
        )

    return {
        "id": id,
        "name": user_by_id.name,
        "email": user_by_id.email,
        "created_at": user_by_id.created_at,
    }


@router.get(
    "/search", status_code=status.HTTP_200_OK, response_model=list[UserResponse]
)
async def get_all_users(db: Session = Depends(get_db)):

    users = db.query(User).all()

    return [
        UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            created_at=user.created_at,
        )
        for user in users
    ]


@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def create_user(user_body: CreateUser, db: Session = Depends(get_db)):

    # validate that user does not exist in db
    existing_user = db.query(User).filter(User.email == user_body.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email address cannot be used. Please use a different email address.",
        )

    # simple validation of the form
    if not user_body.name or not user_body.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All fields are required",
        )
    if "@" not in user_body.email or "." not in user_body.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address",
        )

    user = User(
        name=user_body.name,
        email=user_body.email,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at,
    }


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter_by(id=id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {id} not found",
        )

    db.delete(user)
    db.commit()
