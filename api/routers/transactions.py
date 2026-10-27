from fastapi import APIRouter, HTTPException, status, Depends
from models.user import User
from models.transaction import Transaction
from schemas.transaction import (
    TransactionRequest,
    TransactionResponse,
    TransactionUpdate,
)
from db.dependencies import get_db
from sqlalchemy.orm import Session
from auth import get_current_user

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)

# TODO: Add authentication to the transactions endpoints so that only authenticated users can access their own transactions.


@router.get(
    "", response_model=list[TransactionResponse], status_code=status.HTTP_200_OK
)
async def get_current_transactions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    transactions = (
        db.query(Transaction)
        .filter_by(user_id=user.id)
        .order_by(Transaction.created_at.desc())
        .all()
    )

    return transactions


@router.post(
    "", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED
)
async def create_transaction(
    transaction_body: TransactionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = Transaction(
        description=transaction_body.description,
        amount=transaction_body.amount,
        user_id=user.id,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


@router.patch("")
async def update_transaction(
    transaction_id: int,
    transaction_body: TransactionUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = (
        db.query(Transaction).filter_by(id=transaction_id, user_id=user.id).first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    # This returns only fields the client actually included in the request.
    update_data = transaction_body.model_dump(exclude_unset=True)

    #  The loop updates only those changed fields, leaving everything else unchanged.
    for field, value in update_data.items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)

    return transaction


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    #  look for the transaction, if ones not found, raise an exception with a 404 status code
    transaction = (
        db.query(Transaction).filter_by(id=transaction_id, user_id=user.id).first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    db.delete(transaction)
    db.commit()
