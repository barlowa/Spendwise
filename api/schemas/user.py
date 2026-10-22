from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


# request for making new user
class CreateUser(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str


# API response model for user
class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
