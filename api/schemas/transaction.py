from pydantic import BaseModel, Field, StringConstraints, field_validator
from decimal import Decimal
from datetime import datetime
from typing import Annotated

# constraints for validation
Description = Annotated[
    str,
    StringConstraints(min_length=1, max_length=255, strip_whitespace=True),
]

MoneyAmount = Annotated[
    Decimal,
    Field(gt=0, max_digits=12, decimal_places=2),
]


class TransactionRequest(BaseModel):
    description: Description
    amount: MoneyAmount


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    description: str
    amount: Decimal
    created_at: datetime


class TransactionUpdate(BaseModel):
    description: Description | None = None
    amount: MoneyAmount | None = None

    @field_validator("description", "amount")
    @classmethod
    # validation to protect from null values being added
    def reject_explicit_null(cls, value):
        if value is None:
            raise ValueError("Field cannot be null")
        return value
