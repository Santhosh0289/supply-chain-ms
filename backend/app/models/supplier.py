from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class SupplierStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    blacklisted = "blacklisted"

class SupplierCreate(BaseModel):
    name: str
    contact_email: str
    phone: str
    address: str
    category: str
    status: SupplierStatus = SupplierStatus.active

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    status: Optional[SupplierStatus] = None

class SupplierOut(BaseModel):
    id: str
    name: str
    contact_email: str
    phone: str
    address: str
    category: str
    status: SupplierStatus