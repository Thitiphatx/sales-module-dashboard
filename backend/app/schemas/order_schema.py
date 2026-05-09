


from enum import Enum
from typing import Optional
from fastapi import Query
from pydantic import BaseModel
from datetime import datetime

class OrderStatus(str, Enum):
    pending = "pending"
    shipped = "shipped"
    cancelled = "cancelled"

class OrderCreate(BaseModel):
    customer_name: str
    product_category: str
    status: OrderStatus = OrderStatus.pending
    total_amount: int

class OrderResponse(BaseModel):
    order_id: int
    date: datetime
    customer_name: str
    product_category: str
    status: OrderStatus

    class Config:
        from_attributes = True

class OrderFilter:
    def __init__(
        self,
        customer_name: Optional[str] = Query(default=None),
        product_category: Optional[str] = Query(default=None),
        status: Optional[OrderStatus] = Query(default=None),
        min_amount: Optional[int] = Query(default=None),
        max_amount: Optional[int] = Query(default=None),
        date_from: Optional[datetime] = Query(default=None),
        date_to: Optional[datetime] = Query(default=None),
    ):
        self.customer_name = customer_name
        self.product_category = product_category
        self.status = status
        self.min_amount = min_amount
        self.max_amount = max_amount
        self.date_from = date_from
        self.date_to = date_to