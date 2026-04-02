from bson import ObjectId
from typing import Optional

def fmt_doc(doc: dict) -> dict:
    """Strip ObjectId _id, add string id — makes doc JSON-safe."""
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

def build_cursor_query(cursor: Optional[str], extra_filter: dict = {}) -> dict:
    query = {**extra_filter}
    if cursor:
        try:
            query["_id"] = {"$gt": ObjectId(cursor)}
        except Exception:
            pass
    return query

def make_meta(items: list, limit: int, cursor: Optional[str]) -> dict:
    has_more    = len(items) == limit
    next_cursor = str(items[-1]["id"]) if has_more and items else None
    return {
        "cursor":      cursor,
        "next_cursor": next_cursor,
        "has_more":    has_more,
        "count":       len(items),
        "limit":       limit,
    }