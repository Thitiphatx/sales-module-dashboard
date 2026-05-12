from decimal import Decimal
from fastapi_pagination.ext.sqlalchemy import paginate
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.order import Order
from app.schemas.order_schema import OrderChartDataGroupBy, OrderChartDataResponse, OrderFilter, OrderSummaryResponse
from datetime import datetime, timedelta

SORT_COLUMN_MAP = {
    'id': Order.order_id,
    'date': Order.date,
    'customer_name': Order.customer_name,
    'product_category': Order.product_category,
    'status': Order.status,
    'total_amount': Order.total_amount,
}

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

    sort_column = SORT_COLUMN_MAP.get(filters.sort_by or 'id')
    if filters.sort_order == 'desc':
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    return paginate(db, query)

def get_summary(db: Session) -> OrderSummaryResponse:
    # Get current and previous month time ranges
    now = datetime.now()
    first_day_current = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    first_day_prev = (first_day_current - timedelta(days=1)).replace(day=1)

    # Current month
    current_metrics = db.query(
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.order_id).label("orders"),
        func.avg(Order.total_amount).label("aov")
    ).filter(Order.date >= first_day_current).one()

    # Previous month
    prev_metrics = db.query(
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.order_id).label("orders"),
        func.avg(Order.total_amount).label("aov")
    ).filter(Order.date >= first_day_prev, Order.date < first_day_current).one()

    # All
    all = db.query(
        func.sum(Order.total_amount).label("total_revenue"),
        func.count(Order.order_id).label("total_orders"),
        func.avg(Order.total_amount).label("average_order_value")
    ).one()

    def calculate_trend(current, prev):
        if not prev or prev == 0:
            return 0.0
        return float(((current or 0) - prev) / prev * 100)

    return OrderSummaryResponse(
        total_revenue=all.total_revenue or Decimal("0"),
        total_orders=all.total_orders,
        average_order_value=all.average_order_value or Decimal("0"),
        revenue_trend=calculate_trend(current_metrics.revenue, prev_metrics.revenue),
        orders_trend=calculate_trend(current_metrics.orders, prev_metrics.orders),
        aov_trend=calculate_trend(current_metrics.aov, prev_metrics.aov)
    )

def get_chart_data(group_by: OrderChartDataGroupBy, db: Session) -> list[OrderChartDataResponse]:
    if group_by == OrderChartDataGroupBy.category:
        group_col = Order.product_category
    elif group_by == OrderChartDataGroupBy.status:
        group_col = Order.status

    results = db.query(
        group_col.label("label"),
        func.sum(Order.total_amount).label("total_revenue"),
        func.count(Order.order_id).label("total_orders"),
        func.avg(Order.total_amount).label("average_order_value")
    ).group_by(group_col).all()

    chart_data_list: list[OrderChartDataResponse] = []
    for row in results:
        chart_data_list.append(OrderChartDataResponse(
            label=row.label,
            total_revenue=row.total_revenue,
            total_orders=row.total_orders,
            average_order_value=row.average_order_value
        ))

    return chart_data_list