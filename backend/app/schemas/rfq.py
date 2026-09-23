from __future__ import annotations

from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RFQBase(BaseModel):
    product_service_name: str = Field(min_length=1, max_length=255)
    requirement_description: str = Field(min_length=1)
    quantity: int = Field(gt=0)
    delivery_location: str = Field(min_length=1, max_length=255)
    deadline: datetime

    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("deadline must include a timezone")

        deadline_utc = value.astimezone(timezone.utc)
        if deadline_utc <= datetime.now(timezone.utc):
            raise ValueError("deadline must be in the future")

        return deadline_utc


class RFQCreate(RFQBase):
    pass


class RFQUpdate(RFQBase):
    pass


class RFQResponse(RFQBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    buyer_id: int
    status: str
    created_at: datetime
    updated_at: datetime