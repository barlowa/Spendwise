from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from utils import env_var

DATABASE_URL = env_var("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set - check your .env file or environment variables"
    )


engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)
