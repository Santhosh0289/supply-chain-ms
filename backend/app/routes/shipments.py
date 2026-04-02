from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.shipment import ShipmentCreate, ShipmentUpdate, ShipmentOut
from app.core.dependencies import AdminOrManager, AnyRole
from app.core.pagination import build_cursor_query, make_meta, fmt_doc
from app.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/shipments", tags=["Shipments"])

def fmt(doc) -> dict:
    doc = fmt_doc(doc)
    doc["created_at"] = str(doc.get("created_at", ""))
    return doc

@router.get("/")
async def get_shipments(
    cursor:  Optional[str] = Query(None),
    limit:   int           = Query(10, ge=1, le=100),
    status:  Optional[str] = Query(None),
    carrier: Optional[str] = Query(None),
    search:  Optional[str] = Query(None),
    current_user=AnyRole
):
    db    = get_db()
    extra = {}
    if status:  extra["status"]       = status
    if carrier: extra["carrier_name"] = {"$regex": carrier, "$options": "i"}
    if search:  extra["$or"] = [
        {"tracking_number": {"$regex": search, "$options": "i"}},
        {"order_id":        {"$regex": search, "$options": "i"}},
    ]

    query = build_cursor_query(cursor, extra)
    docs  = await db.shipments.find(query).sort("_id", -1).limit(limit).to_list(limit)
    items = [fmt(d) for d in docs]
    return {"data": items, "meta": make_meta(items, limit, cursor)}

@router.get("/stats")
async def get_shipment_stats(current_user=AnyRole):
    """Shipment status breakdown for charts."""
    db = get_db()
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    by_status = await db.shipments.aggregate(pipeline).to_list(10)

    # Carrier breakdown
    pipeline_carrier = [
        {"$group": {"_id": "$carrier_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 6}
    ]
    by_carrier = await db.shipments.aggregate(pipeline_carrier).to_list(6)

    return {
        "by_status":  [{"status": s["_id"] or "unknown", "count": s["count"]} for s in by_status],
        "by_carrier": [{"carrier": c["_id"] or "Unknown", "count": c["count"]} for c in by_carrier],
    }

@router.get("/{shipment_id}")
async def get_shipment(shipment_id: str, current_user=AnyRole):
    db  = get_db()
    doc = await db.shipments.find_one({"_id": ObjectId(shipment_id)})
    if not doc:
        raise HTTPException(404, "Shipment not found")
    return fmt(doc)

@router.post("/", status_code=201)
async def create_shipment(shipment: ShipmentCreate, current_user=AdminOrManager):
    db    = get_db()
    order = await db.orders.find_one({"_id": ObjectId(shipment.order_id)})
    if not order:
        raise HTTPException(404, "Order not found")
    doc    = {**shipment.model_dump(), "status": "pending", "created_at": datetime.utcnow()}
    result = await db.shipments.insert_one(doc)
    created = await db.shipments.find_one({"_id": result.inserted_id})
    return fmt(created)

@router.patch("/{shipment_id}/status")
async def update_shipment_status(shipment_id: str, update: ShipmentUpdate, current_user=AdminOrManager):
    db          = get_db()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    result      = await db.shipments.update_one({"_id": ObjectId(shipment_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Shipment not found")
    doc = await db.shipments.find_one({"_id": ObjectId(shipment_id)})
    return fmt(doc)

@router.delete("/{shipment_id}")
async def delete_shipment(shipment_id: str, current_user=AdminOrManager):
    db     = get_db()
    result = await db.shipments.delete_one({"_id": ObjectId(shipment_id)})
    if result.deleted_count == 0:
        raise HTTPException(404, "Shipment not found")
    return {"message": "Shipment deleted"}