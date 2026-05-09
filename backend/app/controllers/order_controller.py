from fastapi import APIRouter, Depends, HTTPException
from fastapi_pagination import Page
from sqlalchemy.orm import Session
from app.schemas.order_schema import OrderCreate, OrderFilter, OrderResponse
from app.services import order_service
from app.database import get_db


router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=Page[OrderResponse])
def get_orders(filters: OrderFilter = Depends(OrderFilter), db: Session = Depends(get_db)) -> Page[OrderResponse]:
    return order_service.get_orders(filters, db)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)) -> OrderResponse:
    order = order_service.get_order(order_id, db)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post('/', response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    return order_service.create_order(order, db)