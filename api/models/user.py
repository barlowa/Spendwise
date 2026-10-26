from datetime import datetime
from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base


class User(Base):
    __tablename__ = "users"

    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction",
        back_populates="user",
        # if the user gets deleted, their transactions will also be deleted automatically with the foreign key constraint on the transactions table.
        # This is a good practice to avoid orphaned records in the database.
        cascade="all, delete-orphan",
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    # email must be unique
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    auth0_sub: Mapped[str | None] = mapped_column(String, unique=True, nullable=False)
