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
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    # email must be unique
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    # password is hashed
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    # updated_at: Mapped[datetime] = mapped_column(
    #     DateTime(timezone=True),
    #     server_default=func.now(),
    #     onupdate=func.now(),
    #     nullable=False,
    # )
