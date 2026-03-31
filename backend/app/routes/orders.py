from fastapi import APIRouter, HTTPException
from app.models.order import OrderCreate, OrderStatusUpdate, OrderOut
from app.core.dependencies import AdminOrManager, AnyRole
from app.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["Orders"])

def order_doc(doc) -> dict:
    doc["id"] = str(doc["_id"])
    doc["created_at"] = str(doc.get("created_at", ""))
    return doc

@router.get("/", response_model=list[OrderOut])
async def get_all_orders(current_user=AnyRole):
    db = get_db()
    orders = await db.orders.find().to_list(100)
    return [order_doc(o) for o in orders]

@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: str, current_user=AnyRole):
    db = get_db()
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_doc(doc)

@router.post("/", response_model=OrderOut, status_code=201)
async def create_order(order: OrderCreate, current_user=AnyRole):
    db = get_db()
    total = sum(item.quantity * item.unit_price for item in order.items)
    doc = {
        **order.model_dump(),
        "status": "pending",
        "total_amount": total,
        "created_at": datetime.utcnow()
    }
    result = await db.orders.insert_one(doc)
    created = await db.orders.find_one({"_id": result.inserted_id})
    return order_doc(created)

@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(order_id: str, update: OrderStatusUpdate, current_user=AdminOrManager):
    db = get_db()
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    doc = await db.orders.find_one({"_id": ObjectId(order_id)})
    return order_doc(doc)

@router.delete("/{order_id}")
async def cancel_order(order_id: str, current_user=AdminOrManager):
    db = get_db()
    result = await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "cancelled"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order cancelled"}