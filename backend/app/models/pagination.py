from pydantic import BaseModel
from typing import TypeVar, Generic, List, Optional

T = TypeVar("T")

class PaginatedResponse(BaseModel):
    data: List[dict]
    meta: dict