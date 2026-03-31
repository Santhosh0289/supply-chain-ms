from fastapi import APIRouter, HTTPException
from app.models.shipment import ShipmentCreate, ShipmentUpdate, ShipmentOut
from app.core.dependencies import AdminOrManager, AnyRole
from app.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/shipments", tags=["Shipments"])

def ship_doc(doc) -> dict:
    doc["id"] = str(doc["_id"])
    doc["created_at"] = str(doc.get("created_at", ""))
    return doc

@router.get("/", response_model=list[ShipmentOut])
async def get_all_shipments(current_user=AnyRole):
    db = get_db()
    shipments = await db.shipments.find().to_list(100)
    return [ship_doc(s) for s in shipments]

@router.get("/{shipment_id}", response_model=ShipmentOut)
async def get_shipment(shipment_id: str, current_user=AnyRole):
    db = get_db()
    doc = await db.shipments.find_one({"_id": ObjectId(shipment_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return ship_doc(doc)

@router.post("/", response_model=ShipmentOut, status_code=201)
async def create_shipment(shipment: ShipmentCreate, current_user=AdminOrManager):
    db = get_db()
    order = await db.orders.find_one({"_id": ObjectId(shipment.order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    doc = {
        **shipment.model_dump(),
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    result = await db.shipments.insert_one(doc)
    created = await db.shipments.find_one({"_id": result.inserted_id})
    return ship_doc(created)

@router.patch("/{shipment_id}/status", response_model=ShipmentOut)
async def update_shipment_status(shipment_id: str, update: ShipmentUpdate, current_user=AdminOrManager):
    db = get_db()
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    result = await db.shipments.update_one(
        {"_id": ObjectId(shipment_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Shipment not found")
    doc = await db.shipments.find_one({"_id": ObjectId(shipment_id)})
    return ship_doc(doc)

@router.delete("/{shipment_id}")
async def delete_shipment(shipment_id: str, current_user=AdminOrManager):
    db = get_db()
    result = await db.shipments.delete_one({"_id": ObjectId(shipment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return {"message": "Shipment deleted successfully"}