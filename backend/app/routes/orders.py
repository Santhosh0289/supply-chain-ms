from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.order import OrderCreate, OrderStatusUpdate, OrderOut
from app.core.dependencies import AdminOrManager, AnyRole
from app.core.pagination import build_cursor_query, make_meta, fmt_doc
from app.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["Orders"])

def fmt(doc) -> dict:
    doc = fmt_doc(doc)
    doc["created_at"] = str(doc.get("created_at", ""))
    return doc

@router.get("/")
async def get_orders(
    cursor:  Optional[str] = Query(None),
    limit:   int           = Query(10, ge=1, le=100),
    status:  Optional[str] = Query(None),
    search:  Optional[str] = Query(None),
    current_user=AnyRole
):
    db    = get_db()
    extra = {}
    if status: extra["status"] = status
    if search: extra["$or"] = [
        {"customer_name":  {"$regex": search, "$options": "i"}},
        {"customer_email": {"$regex": search, "$options": "i"}},
    ]

    query = build_cursor_query(cursor, extra)
    docs  = await db.orders.find(query).sort("_id", -1).limit(limit).to_list(limit)
    items = [fmt(d) for d in docs]
    return {"data": items, "meta": make_meta(items, limit, cursor)}

@router.get("/stats")
async def get_order_stats(current_user=AnyRole):
    """Returns order status breakdown and revenue by status for charts."""
    db = get_db()

    # Status counts
    pipeline_status = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}, "revenue": {"$sum": "$total_amount"}}},
        {"$sort": {"count": -1}}
    ]
    by_status = await db.orders.aggregate(pipeline_status).to_list(10)

    # Total revenue
    pipeline_rev = [{"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}]
    rev_result   = await db.orders.aggregate(pipeline_rev).to_list(1)
    total_rev    = rev_result[0]["total"] if rev_result else 0

    # Recent 7 orders
    recent_docs = await db.orders.find().sort("_id", -1).limit(7).to_list(7)
    recent      = [fmt(d) for d in recent_docs]

    return {
        "by_status":   [{"status": s["_id"], "count": s["count"], "revenue": round(s["revenue"], 2)} for s in by_status],
        "total_revenue": round(total_rev, 2),
        "recent_orders": recent,
    }

@router.get("/{order_id}")
async def get_order(order_id: str, current_user=AnyRole):
    db  = get_db()
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not doc:
        raise HTTPException(404, "Order not found")
    return fmt(doc)

@router.post("/", status_code=201)
async def create_order(order: OrderCreate, current_user=AnyRole):
    db    = get_db()
    total = sum(i.quantity * i.unit_price for i in order.items)
    doc   = {**order.model_dump(), "status": "pending", "total_amount": total, "created_at": datetime.utcnow()}
    result  = await db.orders.insert_one(doc)
    created = await db.orders.find_one({"_id": result.inserted_id})
    return fmt(created)

@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, update: OrderStatusUpdate, current_user=AdminOrManager):
    db     = get_db()
    result = await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": {"status": update.status}})
    if result.matched_count == 0:
        raise HTTPException(404, "Order not found")
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    return fmt(doc)

@router.delete("/{order_id}")
async def cancel_order(order_id: str, current_user=AdminOrManager):
    db     = get_db()
    result = await db.orders.update_one({"_id": ObjectId(order_id)}, {"$set": {"status": "cancelled"}})
    if result.matched_count == 0:
        raise HTTPException(404, "Order not found")
    return {"message": "Order cancelled"}