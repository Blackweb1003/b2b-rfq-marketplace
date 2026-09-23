from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_buyer, require_supplier
from app.core.enums import RFQStatus
from app.database import get_db
from app.models.rfq import RFQ
from app.models.user import User
from app.schemas.rfq import RFQCreate, RFQResponse, RFQUpdate


router = APIRouter(
    prefix="/api/buyer/rfqs",
    tags=["RFQs"],
)

supplier_router = APIRouter(
    prefix="/api/supplier/rfqs",
    tags=["RFQs"],
)


def get_owned_rfq(
    rfq_id: int,
    current_user: User,
    db: Session,
) -> RFQ:
    rfq = db.scalar(
        select(RFQ).where(
            RFQ.id == rfq_id,
            RFQ.buyer_id == current_user.id,
        )
    )

    if rfq is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="RFQ not found",
        )

    return rfq


@router.post(
    "",
    response_model=RFQResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_rfq(
    rfq_data: RFQCreate,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db),
) -> RFQ:
    rfq = RFQ(
        buyer_id=current_user.id,
        product_service_name=rfq_data.product_service_name,
        requirement_description=rfq_data.requirement_description,
        quantity=rfq_data.quantity,
        delivery_location=rfq_data.delivery_location,
        deadline=rfq_data.deadline,
        status=RFQStatus.OPEN.value,
    )

    db.add(rfq)
    db.commit()
    db.refresh(rfq)
    return rfq


@router.get(
    "",
    response_model=list[RFQResponse],
)
def list_my_rfqs(
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db),
) -> list[RFQ]:
    return list(
        db.scalars(
            select(RFQ)
            .where(RFQ.buyer_id == current_user.id)
            .order_by(RFQ.created_at.desc())
        ).all()
    )


@router.get(
    "/{rfq_id}",
    response_model=RFQResponse,
)
def get_my_rfq(
    rfq_id: int,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db),
) -> RFQ:
    return get_owned_rfq(rfq_id, current_user, db)


@router.put(
    "/{rfq_id}",
    response_model=RFQResponse,
)
def update_my_rfq(
    rfq_id: int,
    rfq_data: RFQUpdate,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db),
) -> RFQ:
    rfq = get_owned_rfq(rfq_id, current_user, db)

    if rfq.status != RFQStatus.OPEN.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only open RFQs can be updated",
        )

    rfq.product_service_name = rfq_data.product_service_name
    rfq.requirement_description = rfq_data.requirement_description
    rfq.quantity = rfq_data.quantity
    rfq.delivery_location = rfq_data.delivery_location
    rfq.deadline = rfq_data.deadline

    db.commit()
    db.refresh(rfq)
    return rfq


@router.patch(
    "/{rfq_id}/close",
    response_model=RFQResponse,
)
def close_my_rfq(
    rfq_id: int,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db),
) -> RFQ:
    rfq = get_owned_rfq(rfq_id, current_user, db)

    if rfq.status == RFQStatus.CLOSED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RFQ is already closed",
        )

    rfq.status = RFQStatus.CLOSED.value
    rfq.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(rfq)
    return rfq


@supplier_router.get(
    "",
    response_model=list[RFQResponse],
)
def list_open_rfqs_for_suppliers(
    search: str | None = Query(default=None),
    delivery_location: str | None = Query(default=None),
    current_user: User = Depends(require_supplier),
    db: Session = Depends(get_db),
) -> list[RFQ]:
    query = select(RFQ).where(RFQ.status == RFQStatus.OPEN.value)

    if search is not None:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                RFQ.product_service_name.ilike(search_pattern),
                RFQ.requirement_description.ilike(search_pattern),
            )
        )

    if delivery_location is not None:
        query = query.where(
            RFQ.delivery_location.ilike(f"%{delivery_location}%")
        )

    return list(
        db.scalars(
            query.order_by(RFQ.created_at.desc())
        ).all()
    )