from pydantic import BaseModel
from typing import Optional
from enum import Enum

class ShipmentStatus(str, Enum):
    pending = "pending"
    in_transit = "in_transit"
    out_for_delivery = "out_for_delivery"
    delivered = "delivered"
    returned = "returned"

class ShipmentCreate(BaseModel):
    order_id: str
    carrier_name: str
    tracking_number: str
    estimated_delivery: str

class ShipmentUpdate(BaseModel):
    status: Optional[ShipmentStatus] = None
    carrier_name: Optional[str] = None
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[str] = None

class ShipmentOut(BaseModel):
    id: str
    order_id: str
    carrier_name: str
    tracking_number: str
    status: ShipmentStatus
    estimated_delivery: str
    created_at: str