from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.supplier import SupplierCreate, SupplierUpdate, SupplierOut
from app.core.dependencies import AdminOrManager, AnyRole
from app.core.pagination import build_cursor_query, make_meta, fmt_doc
from app.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

def fmt(doc) -> dict:
    return fmt_doc(doc)

@router.get("/")
async def get_suppliers(
    cursor:   Optional[str] = Query(None),
    limit:    int           = Query(10, ge=1, le=100),
    status:   Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search:   Optional[str] = Query(None),
    current_user=AnyRole
):
    db    = get_db()
    extra = {}
    if status:   extra["status"]   = status
    if category: extra["category"] = {"$regex": category, "$options": "i"}
    if search:   extra["name"]     = {"$regex": search,   "$options": "i"}

    query = build_cursor_query(cursor, extra)
    docs  = await db.suppliers.find(query).sort("_id", 1).limit(limit).to_list(limit)
    items = [fmt(d) for d in docs]
    return {"data": items, "meta": make_meta(items, limit, cursor)}

@router.get("/all")
async def get_all_suppliers(current_user=AnyRole):
    db   = get_db()
    docs = await db.suppliers.find().to_list(500)
    return [fmt(d) for d in docs]

@router.get("/{supplier_id}")
async def get_supplier(supplier_id: str, current_user=AnyRole):
    db  = get_db()
    doc = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    if not doc:
        raise HTTPException(404, "Supplier not found")
    return fmt(doc)

@router.post("/", status_code=201)
async def create_supplier(supplier: SupplierCreate, current_user=AdminOrManager):
    db     = get_db()
    result = await db.suppliers.insert_one(supplier.model_dump())
    doc    = await db.suppliers.find_one({"_id": result.inserted_id})
    return fmt(doc)

@router.put("/{supplier_id}")
async def update_supplier(supplier_id: str, updates: SupplierUpdate, current_user=AdminOrManager):
    db          = get_db()
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result      = await db.suppliers.update_one({"_id": ObjectId(supplier_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Supplier not found")
    doc = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    return fmt(doc)

@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: str, current_user=AdminOrManager):
    db     = get_db()
    result = await db.suppliers.delete_one({"_id": ObjectId(supplier_id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "Supplier not found")
    return {"message": "Supplier deleted"}