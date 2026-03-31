from fastapi import APIRouter, HTTPException, Depends
from app.models.supplier import SupplierCreate, SupplierUpdate, SupplierOut
from app.core.dependencies import AdminOrManager, AnyRole
from app.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

def supplier_doc(doc) -> dict:
    doc["id"] = str(doc["_id"])
    return doc

@router.get("/", response_model=list[SupplierOut])
async def get_all_suppliers(current_user=AnyRole):
    db = get_db()
    suppliers = await db.suppliers.find().to_list(100)
    return [supplier_doc(s) for s in suppliers]

@router.get("/{supplier_id}", response_model=SupplierOut)
async def get_supplier(supplier_id: str, current_user=AnyRole):
    db = get_db()
    doc = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier_doc(doc)

@router.post("/", response_model=SupplierOut, status_code=201)
async def create_supplier(supplier: SupplierCreate, current_user=AdminOrManager):
    db = get_db()
    result = await db.suppliers.insert_one(supplier.model_dump())
    doc = await db.suppliers.find_one({"_id": result.inserted_id})
    return supplier_doc(doc)

@router.put("/{supplier_id}", response_model=SupplierOut)
async def update_supplier(supplier_id: str, updates: SupplierUpdate, current_user=AdminOrManager):
    db = get_db()
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = await db.suppliers.update_one({"_id": ObjectId(supplier_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    doc = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    return supplier_doc(doc)

@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: str, current_user=AdminOrManager):
    db = get_db()
    result = await db.suppliers.delete_one({"_id": ObjectId(supplier_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted successfully"}