"""
app/db/models/user.py
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Boolean, DateTime, Enum, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import UUID_TYPE


class UserRole(str, PyEnum):
    CUSTOMER = "CUSTOMER"
    MERCHANT = "MERCHANT"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="userrole"), nullable=False, default=UserRole.CUSTOMER
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    merchant: Mapped["Merchant"] = relationship(  # type: ignore[name-defined]
        "Merchant", back_populates="user", uselist=False
    )
    customer: Mapped["Customer"] = relationship(  # type: ignore[name-defined]
        "Customer", back_populates="user", uselist=False
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_users_email", "email"),
        Index("ix_users_role", "role"),
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
