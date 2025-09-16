"""
SQLAlchemy database models for BRAMBLE Climate Data Platform
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.core.database import Base


class DataType(str, enum.Enum):
    """Climate data types"""
    TEMPERATURE = "temperature"
    RAINFALL = "rainfall"
    WIND_SPEED = "wind_speed"
    CO2_LEVELS = "co2_levels"
    HUMIDITY = "humidity"
    PRESSURE = "pressure"


class DataSource(str, enum.Enum):
    """Data sources"""
    NASA = "nasa"
    NOAA = "noaa"
    OPENWEATHER = "openweather"
    CUSTOM = "custom"


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100))
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    favorite_regions = relationship("UserFavoriteRegion", back_populates="user")
    favorite_datasets = relationship("UserFavoriteDataset", back_populates="user")


class ClimateData(Base):
    """Climate data model"""
    __tablename__ = "climate_data"
    
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    data_type = Column(String(20), nullable=False)  # Store enum value as string
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    date = Column(DateTime, nullable=False)
    source = Column(String(20), nullable=False)  # Store enum value as string
    confidence = Column(Float, default=1.0)
    data_metadata = Column(Text)  # JSON string for additional data
    created_at = Column(DateTime, default=func.now())


class Prediction(Base):
    """ML prediction model"""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    data_type = Column(String(20), nullable=False)  # Store enum value as string
    predicted_value = Column(Float, nullable=False)
    confidence = Column(Float, default=0.0)
    prediction_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())
    data_metadata = Column(Text)  # JSON string for additional data


class UserFavoriteRegion(Base):
    """User favorite regions"""
    __tablename__ = "user_favorite_regions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    region_name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationship
    user = relationship("User", back_populates="favorite_regions")


class UserFavoriteDataset(Base):
    """User favorite datasets"""
    __tablename__ = "user_favorite_datasets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    data_type = Column(String(20), nullable=False)  # Store enum value as string
    source = Column(String(20), nullable=False)  # Store enum value as string
    created_at = Column(DateTime, default=func.now())
    
    # Relationship
    user = relationship("User", back_populates="favorite_datasets")
