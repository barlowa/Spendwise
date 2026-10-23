from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime


class TransactionRequest(BaseModel):
    description: str
    amount: Decimal


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    description: str
    amount: Decimal
    created_at: datetime


class TransactionUpdate(BaseModel):
    description: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
