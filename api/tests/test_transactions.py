from decimal import Decimal
import pytest

from auth import get_current_user
from models.user import User
from models.transaction import Transaction


def test_get_transactions_returns_current_users_transactions(client, db_session):
    user = User(
        name="Test User",
        email="test@example.com",
        auth0_sub="auth0|test-user",
    )
    db_session.add(user)
    db_session.flush()

    transaction = Transaction(
        user_id=user.id,
        description="Groceries",
        amount=Decimal("42.50"),
    )
    db_session.add(transaction)
    db_session.flush()

    client.app.dependency_overrides[get_current_user] = lambda: user

    try:
        response = client.get("/transactions")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["description"] == "Groceries"
        assert data[0]["amount"] == "42.50"
    finally:
        client.app.dependency_overrides.pop(get_current_user, None)


def test_create_transaction(client, db_session):
    user = User(
        name="Test User",
        email="create-test@example.com",
        auth0_sub="auth0|create-test",
    )
    db_session.add(user)
    db_session.flush()

    client.app.dependency_overrides[get_current_user] = lambda: user

    try:
        response = client.post(
            "/transactions",
            json={
                "description": "Train ticket",
                "amount": 15.00,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["description"] == "Train ticket"
        assert data["amount"] == "15.00"
        assert data["user_id"] == user.id
        assert "id" in data
    finally:
        client.app.dependency_overrides.pop(get_current_user, None)


# This checks that a valid PATCH changes the requested fields and returns the updated transaction.
def test_update_transaction(client, db_session):
    from models.transaction import Transaction

    user = User(
        name="Update User",
        email="update-test@example.com",
        auth0_sub="auth0|update-test",
    )
    db_session.add(user)
    db_session.flush()

    transaction = Transaction(
        user_id=user.id,
        description="Old description",
        amount=Decimal("20.00"),
    )
    db_session.add(transaction)
    db_session.flush()

    client.app.dependency_overrides[get_current_user] = lambda: user

    try:
        response = client.patch(
            "/transactions",
            params={"transaction_id": transaction.id},
            json={"description": "Updated description"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated description"
        assert data["amount"] == Decimal(20.00)
    finally:
        client.app.dependency_overrides.pop(get_current_user, None)


# A successful delete should return 204 No Content, meaning the operation succeeded and the response intentionally has no body.
def test_delete_transaction(client, db_session):
    from models.transaction import Transaction

    user = User(
        name="Delete User",
        email="delete-test@example.com",
        auth0_sub="auth0|delete-test",
    )
    db_session.add(user)
    db_session.flush()

    transaction = Transaction(
        user_id=user.id,
        description="To be deleted",
        amount=Decimal("12.00"),
    )
    db_session.add(transaction)
    db_session.flush()
    transaction_id = transaction.id

    client.app.dependency_overrides[get_current_user] = lambda: user

    try:
        response = client.delete(
            "/transactions",
            params={"transaction_id": transaction_id},
        )

        assert response.status_code == 204

        remaining = db_session.query(Transaction).filter_by(id=transaction_id).first()
        assert remaining is None
    finally:
        client.app.dependency_overrides.pop(get_current_user, None)


# Prevent users from updating someone else's transaction
# This is an important security test. A user must not be able to modify a transaction just by guessing its ID.
def test_user_cannot_update_another_users_transaction(client, db_session):
    from models.transaction import Transaction

    owner = User(
        name="Transaction Owner",
        email="owner-test@example.com",
        auth0_sub="auth0|owner-test",
    )
    other_user = User(
        name="Other User",
        email="other-test@example.com",
        auth0_sub="auth0|other-test",
    )
    db_session.add_all([owner, other_user])
    db_session.flush()

    transaction = Transaction(
        user_id=owner.id,
        description="Owner's transaction",
        amount=Decimal("50.00"),
    )
    db_session.add(transaction)
    db_session.flush()

    client.app.dependency_overrides[get_current_user] = lambda: other_user

    try:
        response = client.patch(
            "/transactions",
            params={"transaction_id": transaction.id},
            json={"description": "Unauthorized change"},
        )

        assert response.status_code == 404
        assert response.json()["detail"] == "Transaction not found."

        db_session.refresh(transaction)
        assert transaction.description == "Owner's transaction"
    finally:
        client.app.dependency_overrides.pop(get_current_user, None)


# Prevent users from deleting someone else's transaction
def test_user_cannot_delete_another_users_transaction(client, db_session):
    from models.transaction import Transaction

    owner = User(
        name="Delete Owner",
        email="delete-owner-test@example.com",
        auth0_sub="auth0|delete-owner-test",
    )
    other_user = User(
        name="Delete Other",
        email="delete-other-test@example.com",
        auth0_sub="auth0|delete-other-test",
    )
    db_session.add_all([owner, other_user])
    db_session.flush()

    transaction = Transaction(
        user_id=owner.id,
        description="Protected transaction",
        amount=Decimal("75.00"),
    )
    db_session.add(transaction)
    db_session.flush()
    transaction_id = transaction.id

    client.app.dependency_overrides[get_current_user] = lambda: other_user

    try:
        response = client.delete(
            "/transactions",
            params={"transaction_id": transaction_id},
        )

        assert response.status_code == 404

        remaining = (
            db_session.query(Transaction)
            .filter_by(id=transaction_id, user_id=owner.id)
            .first()
        )
        assert remaining is not None
    finally:
        client.app.dependency_overrides.pop(get_current_user, None)


# Reject invalid data
@pytest.mark.parametrize(
    "payload",
    [
        {"description": "", "amount": "10.00"},
        {"description": "Invalid amount", "amount": "0"},
        {"description": "Negative amount", "amount": "-5.00"},
        {"description": "Too many decimals", "amount": "10.999"},
        {"description": "Exceeded maximum length", "amount": "10000000000.00"},
    ],
)
def test_create_transaction_rejects_invalid_data(client, db_session, payload):
    user = User(
        name="Validation User",
        email="validation-test@example.com",
        auth0_sub="auth0|validation-test",
    )
    db_session.add(user)
    db_session.flush()

    client.app.dependency_overrides[get_current_user] = lambda: user

    try:
        response = client.post("/transactions", json=payload)
        assert response.status_code == 422
    finally:
        client.app.dependency_overrides.pop(get_current_user, None)


# test for valid input
def test_create_transaction_accepts_valid_data(client, db_session):
    user = User(
        name="Valid User",
        email="valid-transaction-test@example.com",
        auth0_sub="auth0|valid-transaction-test",
    )
    db_session.add(user)
    db_session.flush()

    client.app.dependency_overrides[get_current_user] = lambda: user

    try:
        response = client.post(
            "/transactions",
            json={
                "description": "Groceries",
                "amount": "42.50",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["description"] == "Groceries"
        assert float(data["amount"]) == 42.50
    finally:
        client.app.dependency_overrides.pop(get_current_user, None)
