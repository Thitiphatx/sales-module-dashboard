from fastapi import APIRouter, Depends
from fastapi_pagination import Page
from sqlalchemy.orm import Session
from app.schemas.order_schema import OrderChartDataGroupBy, OrderChartDataResponse, OrderFilter, OrderResponse, OrderSummaryResponse
from app.services import order_service
from app.database import get_db

router = APIRouter(prefix="/api/sales", tags=["sales"])

@router.get("/recent", response_model=Page[OrderResponse])
def get_orders(filters: OrderFilter = Depends(OrderFilter), db: Session = Depends(get_db)) -> Page[OrderResponse]:
    return order_service.get_orders(filters, db)

@router.get('/summary', response_model=OrderSummaryResponse)
def get_summary(db: Session = Depends(get_db)) -> OrderSummaryResponse:
    return order_service.get_summary(db)

@router.get('/chart-data', response_model=list[OrderChartDataResponse])
def get_chart_data(group_by: OrderChartDataGroupBy, db: Session = Depends(get_db)) -> list[OrderChartDataResponse]:
    return order_service.get_chart_data(group_by, db)