from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    packed = "packed"
    dispatched = "dispatched"
    delivered = "delivered"
    cancelled = "cancelled"

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_address: str
    items: List[OrderItem]

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderOut(BaseModel):
    id: str
    customer_name: str
    customer_email: str
    customer_address: str
    items: List[OrderItem]
    status: OrderStatus
    total_amount: float
    created_at: str