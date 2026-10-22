from collections.abc import Generator

from sqlalchemy.orm import Session

from db.session import SessionLocal


# session management code to manage request lifecycle
# opens up a database session and then clean up code to close the db connection after each request
# docs here: https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/?utm_source=chatgpt.com#always-raise-in-dependencies-with-yield-and-except
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
