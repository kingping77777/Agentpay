"""
app/db/models/product_relation.py
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import UUID_TYPE


class RelationType(str, PyEnum):
    UPSELL = "UPSELL"
    CROSS_SELL = "CROSS_SELL"
    BUNDLE = "BUNDLE"
    ALTERNATIVE = "ALTERNATIVE"


class ProductRelation(Base):
    __tablename__ = "product_relations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    related_product_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    relation_type: Mapped[RelationType] = mapped_column(
        Enum(RelationType, name="relationtype"), nullable=False
    )
    # Lower priority number = show first (1 = highest priority)
    priority: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    # Bundle/promotion specific discount value in INR
    discount_value: Mapped[float | None] = mapped_column(Numeric(10, 2))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    product: Mapped["Product"] = relationship(  # type: ignore[name-defined]
        "Product",
        foreign_keys=[product_id],
        back_populates="relations_from",
    )
    related_product: Mapped["Product"] = relationship(  # type: ignore[name-defined]
        "Product",
        foreign_keys=[related_product_id],
        back_populates="relations_to",
    )

    # ── Constraints & Indexes ─────────────────────────────────────────────────
    __table_args__ = (
        UniqueConstraint(
            "product_id", "related_product_id", "relation_type",
            name="uq_product_relations_triplet",
        ),
        Index("ix_product_relations_product_id", "product_id"),
        Index("ix_product_relations_relation_type", "relation_type"),
        Index("ix_product_relations_priority", "priority"),
    )

    def __repr__(self) -> str:
        return (
            f"<ProductRelation {self.product_id} → {self.related_product_id} "
            f"type={self.relation_type} priority={self.priority}>"
        )
