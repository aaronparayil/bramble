"""
Configuration settings for BRAMBLE Climate Data Platform
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "BRAMBLE Climate Data API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]
    
    # Database
    DATABASE_URL: str = "sqlite:///./bramble_climate.db"
    
    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API Keys (for external climate data sources)
    NASA_API_KEY: str = ""
    NOAA_API_KEY: str = ""
    OPENWEATHER_API_KEY: str = ""
    
    # ML Model Settings
    MODEL_PATH: str = "ml_pipeline/models"
    PREDICTION_HORIZON_DAYS: int = 365
    
    # Data Pipeline
    DATA_UPDATE_INTERVAL_HOURS: int = 24
    MAX_DATA_POINTS: int = 10000
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables


# Create settings instance
settings = Settings()
