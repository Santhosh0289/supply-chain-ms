from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.inventory import InventoryCreate, InventoryUpdate, InventoryOut
from app.core.dependencies import AdminOrManager, AnyRole
from app.core.pagination import build_cursor_query, make_meta, fmt_doc
from app.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/inventory", tags=["Inventory"])

def fmt(doc) -> dict:
    doc = fmt_doc(doc)
    doc["is_low_stock"] = doc["quantity"] <= doc.get("low_stock_threshold", 10)
    return doc

@router.get("/")
async def get_inventory(
    cursor:    Optional[str]  = Query(None),
    limit:     int            = Query(10, ge=1, le=100),
    search:    Optional[str]  = Query(None),
    sku:       Optional[str]  = Query(None),
    location:  Optional[str]  = Query(None),
    low_stock: Optional[bool] = Query(None),
    current_user=AnyRole
):
    db    = get_db()
    extra = {}
    if search:    extra["product_name"]      = {"$regex": search,   "$options": "i"}
    if sku:       extra["sku"]               = sku
    if location:  extra["warehouse_location"]= {"$regex": location, "$options": "i"}
    if low_stock: extra["$expr"]             = {"$lte": ["$quantity", "$low_stock_threshold"]}

    query = build_cursor_query(cursor, extra)
    docs  = await db.inventory.find(query).sort("_id", 1).limit(limit).to_list(limit)
    items = [fmt(d) for d in docs]
    return {"data": items, "meta": make_meta(items, limit, cursor)}

@router.get("/low-stock")
async def get_low_stock(current_user=AnyRole):
    db   = get_db()
    docs = await db.inventory.find(
        {"$expr": {"$lte": ["$quantity", "$low_stock_threshold"]}}
    ).to_list(100)
    return [fmt(d) for d in docs]

@router.get("/stats")
async def get_inventory_stats(current_user=AnyRole):
    """Returns per-warehouse stock counts and top products for charts."""
    db = get_db()

    # Group by warehouse location
    pipeline_warehouse = [
        {"$group": {"_id": "$warehouse_location", "total_qty": {"$sum": "$quantity"}, "item_count": {"$sum": 1}}},
        {"$sort": {"total_qty": -1}},
        {"$limit": 8}
    ]
    warehouses = await db.inventory.aggregate(pipeline_warehouse).to_list(8)

    # Top 8 products by quantity
    pipeline_top = [
        {"$sort": {"quantity": -1}},
        {"$limit": 8},
        {"$project": {"_id": 0, "product_name": 1, "quantity": 1, "sku": 1}}
    ]
    top_products = await db.inventory.aggregate(pipeline_top).to_list(8)

    # Low stock count
    low_stock_count = await db.inventory.count_documents(
        {"$expr": {"$lte": ["$quantity", "$low_stock_threshold"]}}
    )

    return {
        "warehouses":      [{"name": w["_id"] or "Unknown", "qty": w["total_qty"], "items": w["item_count"]} for w in warehouses],
        "top_products":    top_products,
        "low_stock_count": low_stock_count,
    }

@router.get("/{item_id}")
async def get_item(item_id: str, current_user=AnyRole):
    db  = get_db()
    doc = await db.inventory.find_one({"_id": ObjectId(item_id)})
    if not doc:
        raise HTTPException(404, "Item not found")
    return fmt(doc)

@router.post("/", status_code=201)
async def create_item(item: InventoryCreate, current_user=AdminOrManager):
    db       = get_db()
    existing = await db.inventory.find_one({"sku": item.sku})
    if existing:
        raise HTTPException(400, "SKU already exists")
    result = await db.inventory.insert_one(item.model_dump())
    doc    = await db.inventory.find_one({"_id": result.inserted_id})
    return fmt(doc)

@router.put("/{item_id}")
async def update_item(item_id: str, updates: InventoryUpdate, current_user=AdminOrManager):
    db          = get_db()
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    result      = await db.inventory.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Item not found")
    doc = await db.inventory.find_one({"_id": ObjectId(item_id)})
    return fmt(doc)

@router.delete("/{item_id}")
async def delete_item(item_id: str, current_user=AdminOrManager):
    db     = get_db()
    result = await db.inventory.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "Item not found")
    return {"message": "Item deleted"}