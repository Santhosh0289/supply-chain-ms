from fastapi import APIRouter, HTTPException
from app.models.inventory import InventoryCreate, InventoryUpdate, InventoryOut
from app.core.dependencies import AdminOrManager, AnyRole
from app.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/inventory", tags=["Inventory"])

def inv_doc(doc) -> dict:
    doc["id"] = str(doc["_id"])
    doc["is_low_stock"] = doc["quantity"] <= doc.get("low_stock_threshold", 10)
    return doc

@router.get("/", response_model=list[InventoryOut])
async def get_all_items(current_user=AnyRole):
    db = get_db()
    items = await db.inventory.find().to_list(100)
    return [inv_doc(i) for i in items]

@router.get("/low-stock", response_model=list[InventoryOut])
async def get_low_stock(current_user=AnyRole):
    db = get_db()
    items = await db.inventory.find(
        {"$expr": {"$lte": ["$quantity", "$low_stock_threshold"]}}
    ).to_list(100)
    return [inv_doc(i) for i in items]

@router.get("/{item_id}", response_model=InventoryOut)
async def get_item(item_id: str, current_user=AnyRole):
    db = get_db()
    doc = await db.inventory.find_one({"_id": ObjectId(item_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found")
    return inv_doc(doc)

@router.post("/", response_model=InventoryOut, status_code=201)
async def create_item(item: InventoryCreate, current_user=AdminOrManager):
    db = get_db()
    existing = await db.inventory.find_one({"sku": item.sku})
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    result = await db.inventory.insert_one(item.model_dump())
    doc = await db.inventory.find_one({"_id": result.inserted_id})
    return inv_doc(doc)

@router.put("/{item_id}", response_model=InventoryOut)
async def update_item(item_id: str, updates: InventoryUpdate, current_user=AdminOrManager):
    db = get_db()
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result = await db.inventory.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    doc = await db.inventory.find_one({"_id": ObjectId(item_id)})
    return inv_doc(doc)

@router.delete("/{item_id}")
async def delete_item(item_id: str, current_user=AdminOrManager):
    db = get_db()
    result = await db.inventory.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}