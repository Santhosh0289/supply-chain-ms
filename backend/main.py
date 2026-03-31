from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, close_db
from app.routes import auth, suppliers, inventory, orders, shipments

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(
    title="Supply Chain Management API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(suppliers.router)
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(shipments.router)

@app.get("/")
async def root():
    return {"message": "Supply Chain API is running"}