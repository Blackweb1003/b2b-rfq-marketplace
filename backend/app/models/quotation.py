from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.rfq import RFQ
    from app.models.user import User


class Quotation(Base):
    __tablename__ = "quotations"

    __table_args__ = (
        UniqueConstraint(
            "rfq_id",
            "supplier_id",
            name="uq_quotations_rfq_supplier",
        ),
        CheckConstraint(
            "price > 0",
            name="ck_quotations_price_gt_zero",
        ),
        CheckConstraint(
            "estimated_delivery_time > 0",
            name="ck_quotations_estimated_delivery_time_gt_zero",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    rfq_id: Mapped[int] = mapped_column(
        ForeignKey(
            "rfqs.id",
            ondelete="RESTRICT",
            onupdate="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    supplier_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
            onupdate="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    estimated_delivery_time: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    rfq: Mapped["RFQ"] = relationship(
        back_populates="quotations",
    )

    supplier: Mapped["User"] = relationship(
        back_populates="quotations",
    )