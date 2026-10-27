from datetime import datetime, timezone
from unittest.mock import Mock

import pytest
import requests

from auth import get_current_user
from main import app
from models.user import User
from routers import users as users_router


@pytest.fixture
def test_user():
    return User(
        name="Test User",
        email="test@example.com",
        auth0_sub="auth0|test123",
        created_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
    )


@pytest.fixture
def authenticated_client(client, db_session, test_user):
    db_session.add(test_user)
    db_session.flush()

    previous_override = app.dependency_overrides.get(get_current_user)
    app.dependency_overrides[get_current_user] = lambda: test_user
    try:
        yield client
    finally:
        if previous_override is None:
            app.dependency_overrides.pop(get_current_user, None)
        else:
            app.dependency_overrides[get_current_user] = previous_override


def user_response(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at.isoformat().replace("+00:00", "Z"),
    }


def test_get_current_user(authenticated_client, test_user):
    response = authenticated_client.get("/user")

    assert response.status_code == 200
    assert response.json() == user_response(test_user)


def test_get_current_user_requires_authentication(client):
    response = client.get("/user")

    assert response.status_code == 401


def test_search_users_returns_serialized_users(client, db_session, test_user):
    second_user = User(
        name="Another User",
        email="another@example.com",
        auth0_sub="auth0|test456",
        created_at=datetime(2025, 2, 1, tzinfo=timezone.utc),
    )
    db_session.add_all([test_user, second_user])
    db_session.flush()

    response = client.get("/user/search")

    assert response.status_code == 200
    assert response.json() == [user_response(test_user), user_response(second_user)]


def test_search_users_returns_empty_list_when_no_users_exist(client):
    response = client.get("/user/search")

    assert response.status_code == 200
    assert response.json() == []


def test_delete_user_removes_auth0_and_database_user(
    authenticated_client, db_session, test_user, monkeypatch
):
    auth0_response = Mock(ok=True, status_code=204)
    get_token = Mock(return_value="management-token")
    delete_auth0_user = Mock(return_value=auth0_response)
    monkeypatch.setattr(users_router, "AUTH0_DOMAIN", "auth0.example.test")
    monkeypatch.setattr(users_router, "get_management_token", get_token)
    monkeypatch.setattr(users_router.requests, "delete", delete_auth0_user)

    response = authenticated_client.delete("/user")

    assert response.status_code == 204
    get_token.assert_called_once_with()
    delete_auth0_user.assert_called_once_with(
        "https://auth0.example.test/api/v2/users/auth0%7Ctest123",
        headers={"Authorization": "Bearer management-token"},
        timeout=10,
    )
    assert db_session.get(User, test_user.id) is None


def test_delete_user_requires_authentication(client, monkeypatch):
    get_token = Mock()
    monkeypatch.setattr(users_router, "get_management_token", get_token)

    response = client.delete("/user")

    assert response.status_code == 401
    get_token.assert_not_called()


def test_delete_user_does_not_remove_database_user_if_auth0_fails(
    authenticated_client, db_session, test_user, monkeypatch
):
    auth0_response = Mock(ok=False, status_code=503, text="Auth0 unavailable")
    auth0_response.raise_for_status.side_effect = requests.HTTPError(
        "Auth0 unavailable"
    )
    monkeypatch.setattr(users_router, "AUTH0_DOMAIN", "auth0.example.test")
    monkeypatch.setattr(
        users_router, "get_management_token", Mock(return_value="management-token")
    )
    monkeypatch.setattr(
        users_router.requests, "delete", Mock(return_value=auth0_response)
    )

    with pytest.raises(requests.HTTPError, match="Auth0 unavailable"):
        authenticated_client.delete("/user")

    assert db_session.get(User, test_user.id) is test_user
