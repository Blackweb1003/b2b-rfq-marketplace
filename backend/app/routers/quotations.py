from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.dependencies import require_buyer, require_supplier
from app.core.enums import RFQStatus
from app.database import get_db
from app.models.quotation import Quotation
from app.models.rfq import RFQ
from app.models.user import User
from app.schemas.quotation import QuotationCreate, QuotationResponse


router = APIRouter(
    prefix="/api/supplier/quotations",
    tags=["Quotations"],
)

buyer_router = APIRouter(
    prefix="/api/buyer/quotations",
    tags=["Quotations"],
)


def get_owned_quotation(
    quotation_id: int,
    current_user: User,
    db: Session,
) -> Quotation:
    quotation = db.scalar(
        select(Quotation).where(
            Quotation.id == quotation_id,
            Quotation.supplier_id == current_user.id,
        )
    )

    if quotation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quotation not found",
        )

    return quotation


@router.post(
    "",
    response_model=QuotationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_quotation(
    quotation_data: QuotationCreate,
    current_user: User = Depends(require_supplier),
    db: Session = Depends(get_db),
) -> Quotation:
    rfq = db.scalar(select(RFQ).where(RFQ.id == quotation_data.rfq_id))

    if rfq is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="RFQ not found",
        )

    if rfq.status != RFQStatus.OPEN.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only open RFQs can receive quotations",
        )

    existing_quotation = db.scalar(
        select(Quotation).where(
            Quotation.rfq_id == quotation_data.rfq_id,
            Quotation.supplier_id == current_user.id,
        )
    )

    if existing_quotation is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Quotation already exists for this RFQ",
        )

    quotation = Quotation(
        rfq_id=quotation_data.rfq_id,
        supplier_id=current_user.id,
        price=quotation_data.price,
        estimated_delivery_time=quotation_data.estimated_delivery_time,
        message=quotation_data.message,
    )

    try:
        db.add(quotation)
        db.commit()
        db.refresh(quotation)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Quotation already exists for this RFQ",
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create quotation",
        )

    return quotation


@router.get(
    "",
    response_model=list[QuotationResponse],
)
def list_my_quotations(
    current_user: User = Depends(require_supplier),
    db: Session = Depends(get_db),
) -> list[Quotation]:
    return list(
        db.scalars(
            select(Quotation)
            .where(Quotation.supplier_id == current_user.id)
            .order_by(Quotation.created_at.desc())
        ).all()
    )


@router.get(
    "/{quotation_id}",
    response_model=QuotationResponse,
)
def get_my_quotation(
    quotation_id: int,
    current_user: User = Depends(require_supplier),
    db: Session = Depends(get_db),
) -> Quotation:
    return get_owned_quotation(quotation_id, current_user, db)


@router.delete(
    "/{quotation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_my_quotation(
    quotation_id: int,
    current_user: User = Depends(require_supplier),
    db: Session = Depends(get_db),
) -> None:
    quotation = get_owned_quotation(quotation_id, current_user, db)
    db.delete(quotation)
    db.commit()


def get_buyer_quotation(
    quotation_id: int,
    current_user: User,
    db: Session,
) -> Quotation:
    quotation = db.scalar(
        select(Quotation)
        .join(RFQ, Quotation.rfq_id == RFQ.id)
        .where(
            Quotation.id == quotation_id,
            RFQ.buyer_id == current_user.id,
        )
    )

    if quotation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quotation not found",
        )

    return quotation


@buyer_router.get(
    "",
    response_model=list[QuotationResponse],
)
def list_buyer_quotations(
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db),
) -> list[Quotation]:
    return list(
        db.scalars(
            select(Quotation)
            .join(RFQ, Quotation.rfq_id == RFQ.id)
            .where(RFQ.buyer_id == current_user.id)
            .order_by(Quotation.created_at.desc())
        ).all()
    )


@buyer_router.get(
    "/{quotation_id}",
    response_model=QuotationResponse,
)
def get_buyer_quotation_by_id(
    quotation_id: int,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db),
) -> Quotation:
    return get_buyer_quotation(quotation_id, current_user, db)