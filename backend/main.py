from fastapi import FastAPI
from fastapi_pagination import add_pagination
from app.database import Base, engine
from app.controllers import order_controller

Base.metadata.create_all(bind=engine)

app = FastAPI()
add_pagination(app)

app.include_router(order_controller.router)
