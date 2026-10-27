from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


# API response model for user
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
