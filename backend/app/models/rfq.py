from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import RFQStatus
from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.quotation import Quotation


class RFQ(Base):
    __tablename__ = "rfqs"

    __table_args__ = (
        CheckConstraint(
            "quantity > 0",
            name="ck_rfqs_quantity_gt_zero",
        ),
        CheckConstraint(
            "status IN ('OPEN', 'CLOSED')",
            name="ck_rfqs_status",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    buyer_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
            onupdate="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    product_service_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    requirement_description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    delivery_location: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    deadline: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=RFQStatus.OPEN.value,
        index=True,
        server_default=text("'OPEN'"),
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

    buyer: Mapped["User"] = relationship(
        back_populates="rfqs",
    )

    quotations: Mapped[list["Quotation"]] = relationship(
        back_populates="rfq",
    )