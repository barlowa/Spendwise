import jwt
from jwt import PyJWKClient
import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from pathlib import Path
import os
from sqlalchemy.orm import Session
from db.dependencies import get_db
from models.user import User

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("API_AUDIENCE")
ALGORITHMS = ["RS256"]

JWKS_URL = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
ISSUER = f"https://{AUTH0_DOMAIN}/"

jwks_client = PyJWKClient(JWKS_URL)
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):

    token = credentials.credentials

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=ALGORITHMS,
            audience=API_AUDIENCE,
            issuer=ISSUER,
        )

        sub_claim = payload.get("sub")

        current_user = db.query(User).filter_by(auth0_sub=sub_claim).first()

        # since a profile doesn't currently exist, add it after validation
        if not current_user:

            # get the user info from auth0
            response = requests.get(
                f"https://{AUTH0_DOMAIN}/userinfo",
                headers={"Authorization": f"Bearer {token}"},
                timeout=5,
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not find user profile from Auth0",
                )

            # users profile info from auth0
            profile = response.json()
            email = profile.get("email")
            name = profile.get("name")

            print(profile)

            # make sure the profile info is complete
            if not email or not name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Auth0 profile information is incomplete",
                )

            current_user = User(
                auth0_sub=sub_claim,
                email=email,
                name=name,
            )

            db.add(current_user)
            db.commit()
            db.refresh(current_user)

        return current_user

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
