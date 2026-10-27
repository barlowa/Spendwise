import os
from datetime import datetime, timezone
from unittest.mock import Mock

import pytest
import requests
from fastapi.testclient import TestClient

for key, value in {
    "API_AUTH0_DOMAIN": "auth0.example.test",
    "API_AUDIENCE": "https://spendwise.example.test",
    "MGMT_API_AUTH0_DOMAIN": "auth0.example.test",
    "MGMT_API_AUTH0_CLIENT_ID": "test-client",
    "MGMT_API_AUTH0_CLIENT_SECRET": "test-secret",
    "MGMT_API_AUTH0_AUDIENCE": "https://auth0.example.test/api/v2/",
}.items():
    os.environ.setdefault(key, value)

from auth import get_current_user
from db.dependencies import get_db
from main import app
from models.user import User
from routers import users as users_router


@pytest.fixture
def test_user():
    return User(
        id=1,
        name="Test User",
        email="test@example.com",
        auth0_sub="auth0|test123",
        created_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
    )


@pytest.fixture
def client(test_user):
    original_overrides = app.dependency_overrides.copy()
    app.dependency_overrides[get_current_user] = lambda: test_user

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(original_overrides)


def user_response(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at.isoformat().replace("+00:00", "Z"),
    }


def test_get_current_user(client, test_user):
    response = client.get("/user")

    assert response.status_code == 200
    assert response.json() == user_response(test_user)


def test_get_current_user_returns_404_when_user_is_missing(client):
    app.dependency_overrides[get_current_user] = lambda: None

    response = client.get("/user")

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_search_users_returns_serialized_users(client, test_user):
    second_user = User(
        id=2,
        name="Another User",
        email="another@example.com",
        auth0_sub="auth0|test456",
        created_at=datetime(2025, 2, 1, tzinfo=timezone.utc),
    )
    db = Mock()
    db.query.return_value.all.return_value = [test_user, second_user]
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/user/search")

    assert response.status_code == 200
    assert response.json() == [user_response(test_user), user_response(second_user)]
    db.query.assert_called_once_with(User)
    db.query.return_value.all.assert_called_once_with()


def test_search_users_returns_404_when_current_user_is_missing(client):
    db = Mock()
    app.dependency_overrides[get_current_user] = lambda: None
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/user/search")

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
    db.query.assert_not_called()


def test_delete_user_removes_auth0_and_database_user(
    client, test_user, monkeypatch
):
    db = Mock()
    auth0_response = Mock(ok=True, status_code=204)
    get_token = Mock(return_value="management-token")
    delete_auth0_user = Mock(return_value=auth0_response)
    monkeypatch.setattr(users_router, "get_management_token", get_token)
    monkeypatch.setattr(users_router.requests, "delete", delete_auth0_user)
    app.dependency_overrides[get_db] = lambda: db

    response = client.delete("/user")

    assert response.status_code == 204
    get_token.assert_called_once_with()
    delete_auth0_user.assert_called_once_with(
        "https://auth0.example.test/api/v2/users/auth0%7Ctest123",
        headers={"Authorization": "Bearer management-token"},
        timeout=10,
    )
    db.delete.assert_called_once_with(test_user)
    db.commit.assert_called_once_with()


def test_delete_user_returns_404_when_current_user_is_missing(client, monkeypatch):
    db = Mock()
    get_token = Mock()
    app.dependency_overrides[get_current_user] = lambda: None
    app.dependency_overrides[get_db] = lambda: db
    monkeypatch.setattr(users_router, "get_management_token", get_token)

    response = client.delete("/user")

    assert response.status_code == 404
    assert response.json()["detail"] == "User with not found"
    get_token.assert_not_called()
    db.delete.assert_not_called()
    db.commit.assert_not_called()


def test_delete_user_does_not_remove_database_user_if_auth0_fails(
    client, monkeypatch
):
    db = Mock()
    auth0_response = Mock(ok=False, status_code=503, text="Auth0 unavailable")
    auth0_response.raise_for_status.side_effect = requests.HTTPError(
        "Auth0 unavailable"
    )
    monkeypatch.setattr(
        users_router, "get_management_token", Mock(return_value="management-token")
    )
    monkeypatch.setattr(
        users_router.requests, "delete", Mock(return_value=auth0_response)
    )
    app.dependency_overrides[get_db] = lambda: db

    with pytest.raises(requests.HTTPError, match="Auth0 unavailable"):
        client.delete("/user")

    db.delete.assert_not_called()
    db.commit.assert_not_called()
