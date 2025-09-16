"""
BRAMBLE - FastAPI Backend Server
Main application entry point for the climate data visualization platform.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from contextlib import asynccontextmanager

from app.routers import auth, climate_data, predictions, users
from app.core.config import settings
from app.core.database import init_db


# Create FastAPI application instance
app = FastAPI(
    title="BRAMBLE Climate Data API",
    description="A comprehensive API for climate change data visualization and ML predictions",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    print("Starting BRAMBLE Climate Data Platform...")
    init_db()
    print("Database initialized successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    print("Shutting down BRAMBLE...")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(climate_data.router, prefix="/api/data", tags=["Climate Data"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["ML Predictions"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to BRAMBLE Climate Data API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "bramble-api"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
