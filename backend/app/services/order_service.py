from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy.orm import Session

from app.models.order import Order
from app.schemas.order_schema import OrderCreate, OrderFilter

def get_orders(filters: OrderFilter, db: Session):
    query = db.query(Order)

    if filters.customer_name:
        query = query.filter(Order.customer_name.ilike(f"%{filters.customer_name}%"))
    if filters.product_category:
        query = query.filter(Order.product_category.ilike(f"%{filters.product_category}%"))
    if filters.min_amount:
        query = query.filter(Order.total_amount >= filters.min_amount)
    if filters.max_amount:
        query = query.filter(Order.total_amount <= filters.max_amount)
    if filters.status:
        query = query.filter(Order.status == filters.status)
    if filters.date_from:
        query = query.filter(Order.date >= filters.date_from)
    if filters.date_to:
        query = query.filter(Order.date <= filters.date_to)

    return paginate(db, query)


def get_order(order_id: int, db: Session):
    return db.query(Order).filter(Order.order_id == order_id).first()

def create_order(order: OrderCreate, db: Session):
    db_order = Order(
        customer_name= order.customer_name,
        product_category= order.product_category,
        status= order.status,
        total_amount= order.total_amount
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order