"""
Ohio Maternity Access Map - Main FastAPI Application
"""
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager

from app.db import create_db_and_tables
from app.seed import seed_db_if_empty
from app.services.geocode import load_zip_data
from app.routers import api, pages


class IframeMiddleware(BaseHTTPMiddleware):
    """Allow embedding in iframes on any website"""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "ALLOWALL"
        response.headers["Content-Security-Policy"] = "frame-ancestors *"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("Starting Ohio Maternity Access Map...")
    create_db_and_tables()
    seed_db_if_empty()
    load_zip_data()
    print("✓ Application ready")
    
    yield
    
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title="Ohio Maternity Access Map",
    description="Interactive map of Ohio hospitals with Labor & Delivery and NICU services",
    version="1.0.0",
    lifespan=lifespan
)

# Iframe embedding middleware (allows embedding on any website)
app.add_middleware(IframeMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(pages.router)
app.include_router(api.router)


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
