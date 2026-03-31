from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class Role(str, Enum):
    admin = "admin"
    manager = "manager"
    warehouse_staff = "warehouse_staff"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role = Role.warehouse_staff

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Role

class TokenPayload(BaseModel):
    sub: str          # user id
    role: str
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    name: str