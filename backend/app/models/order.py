import enum
from sqlalchemy import Column, DateTime, Integer, String, func, Enum as SAEnum
from app.database import Base

class OrderStatus(enum.Enum):
    pending = "pending"
    shipped = "shipped"
    cancelled = "cancelled"


class Order(Base):
    __tablename__ = "orders"
    order_id = Column(Integer, primary_key=True)
    date = Column(DateTime, server_default=func.now())
    customer_name = Column(String)
    product_category = Column(String)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.pending)
    total_amount = Column(Integer)