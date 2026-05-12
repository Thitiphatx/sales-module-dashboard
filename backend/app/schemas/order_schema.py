


from enum import Enum
from typing import Optional
from fastapi import Query
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

class OrderStatus(str, Enum):
    pending = "pending"
    shipped = "shipped"
    cancelled = "cancelled"

class OrderChartDataGroupBy(str, Enum):
    status = "status"
    category = "category"

class OrderResponse(BaseModel):
    order_id: int
    date: datetime
    customer_name: str
    product_category: str
    status: OrderStatus
    total_amount: Decimal

    class Config:
        from_attributes = True

class OrderFilter:
    def __init__(
        self,
        customer_name: Optional[str] = Query(default=None),
        product_category: Optional[str] = Query(default=None),
        status: Optional[OrderStatus] = Query(default=None),
        min_amount: Optional[float] = Query(default=None),
        max_amount: Optional[float] = Query(default=None),
        date_from: Optional[datetime] = Query(default=None),
        date_to: Optional[datetime] = Query(default=None),
        sort_by: Optional[str] = Query(default=None),
        sort_order: Optional[str] = Query(default=None),
    ):
        self.customer_name = customer_name
        self.product_category = product_category
        self.status = status
        self.min_amount = min_amount
        self.max_amount = max_amount
        self.date_from = date_from
        self.date_to = date_to
        self.sort_by = sort_by
        self.sort_order = sort_order

class OrderSummaryResponse(BaseModel):
    total_revenue: Decimal
    total_orders: int
    average_order_value: Decimal
    revenue_trend: Optional[float] = None
    orders_trend: Optional[float] = None
    aov_trend: Optional[float] = None

class OrderChartDataResponse(OrderSummaryResponse):
    label: str