from pydantic import BaseModel
from typing import Optional

class InventoryCreate(BaseModel):
    product_name: str
    sku: str
    quantity: int
    unit_price: float
    warehouse_location: str
    supplier_id: str
    low_stock_threshold: int = 10

class InventoryUpdate(BaseModel):
    product_name: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    warehouse_location: Optional[str] = None
    low_stock_threshold: Optional[int] = None

class InventoryOut(BaseModel):
    id: str
    product_name: str
    sku: str
    quantity: int
    unit_price: float
    warehouse_location: str
    supplier_id: str
    low_stock_threshold: int
    is_low_stock: bool