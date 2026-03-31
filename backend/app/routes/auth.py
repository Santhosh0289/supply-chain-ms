from fastapi import APIRouter, HTTPException, status
from app.models.user import UserCreate, LoginRequest, TokenResponse, UserOut
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut, status_code=201)
async def register(user: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    doc = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role
    }
    result = await db.users.insert_one(doc)
    return UserOut(id=str(result.inserted_id), name=user.name, email=user.email, role=user.role)

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    payload = {"sub": str(user["_id"]), "role": user["role"]}
    return TokenResponse(
        access_token=create_access_token(payload),
        refresh_token=create_refresh_token(payload),
        role=user["role"],
        name=user["name"]
    )