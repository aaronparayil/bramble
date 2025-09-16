"""
Pydantic models for climate data validation and serialization
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DataType(str, Enum):
    """Climate data types"""
    TEMPERATURE = "temperature"
    RAINFALL = "rainfall"
    WIND_SPEED = "wind_speed"
    CO2_LEVELS = "co2_levels"
    HUMIDITY = "humidity"
    PRESSURE = "pressure"


class DataSource(str, Enum):
    """Data sources"""
    NASA = "nasa"
    NOAA = "noaa"
    OPENWEATHER = "openweather"
    CUSTOM = "custom"


class ClimateDataPoint(BaseModel):
    """Individual climate data point"""
    id: int
    location: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    data_type: DataType
    value: float
    unit: str
    date: datetime
    source: DataSource
    confidence: float = Field(1.0, ge=0.0, le=1.0)
    metadata: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ClimateDataRequest(BaseModel):
    """Request model for climate data queries"""
    data_type: Optional[DataType] = None
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    source: Optional[DataSource] = None
    limit: int = Field(100, ge=1, le=1000)
    offset: int = Field(0, ge=0)


class ClimateDataResponse(BaseModel):
    """Response model for climate data queries"""
    data: List[ClimateDataPoint]
    total: int
    limit: int
    offset: int
    has_more: bool


class ClimateSummary(BaseModel):
    """Climate data summary"""
    data_type: DataType
    location: str
    average_value: float
    min_value: float
    max_value: float
    total_records: int
    date_range: str
    unit: str


class RegionData(BaseModel):
    """Regional climate data"""
    region: str
    latitude: float
    longitude: float
    data_points: List[ClimateDataPoint]
    summary: ClimateSummary


class DataFilter(BaseModel):
    """Data filtering options"""
    data_types: Optional[List[DataType]] = None
    sources: Optional[List[DataSource]] = None
    date_range: Optional[tuple[datetime, datetime]] = None
    regions: Optional[List[str]] = None
