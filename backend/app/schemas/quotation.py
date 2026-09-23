from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class QuotationBase(BaseModel):
    rfq_id: int
    price: Decimal = Field(gt=0)
    estimated_delivery_time: int = Field(gt=0)
    message: str | None = None


class QuotationCreate(QuotationBase):
    pass


class QuotationResponse(QuotationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    supplier_id: int
    created_at: datetime
    updated_at: datetime