from fastapi import APIRouter

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.get("")
async def get_current_transactions():

    return {"message": f"Transaction information for the current transaction"}


@router.put("")
async def update_transaction(transaction_id: str):

    return {"message": f"Transaction information for {transaction_id}"}
