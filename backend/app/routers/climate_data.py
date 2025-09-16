"""
Climate data router for BRAMBLE Climate Data Platform
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from app.models.climate_data import (
    ClimateDataRequest, ClimateDataResponse, ClimateSummary, 
    RegionData, DataFilter, DataType, DataSource, ClimateDataPoint
)
from app.models.database_models import ClimateData
from app.core.database import get_db
from app.core.security import get_current_user_email
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


@router.get("/", response_model=ClimateDataResponse)
async def get_climate_data(
    location: Optional[str] = Query(None, description="Location name"),
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Latitude"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Longitude"),
    data_type: Optional[DataType] = Query(None, description="Type of climate data"),
    start_date: Optional[datetime] = Query(None, description="Start date"),
    end_date: Optional[datetime] = Query(None, description="End date"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    token: Optional[str] = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get climate data with optional filtering
    """
    try:
        # Build query filter
        query = db.query(ClimateData)
        
        if location:
            query = query.filter(ClimateData.location.ilike(f"%{location}%"))
        
        if latitude and longitude:
            query = query.filter(
                and_(
                    ClimateData.latitude == latitude,
                    ClimateData.longitude == longitude
                )
            )
        
        if data_type:
            query = query.filter(ClimateData.data_type == data_type)
        
        if start_date or end_date:
            if start_date and end_date:
                query = query.filter(
                    and_(
                        ClimateData.date >= start_date,
                        ClimateData.date <= end_date
                    )
                )
            elif start_date:
                query = query.filter(ClimateData.date >= start_date)
            elif end_date:
                query = query.filter(ClimateData.date <= end_date)
        
        # Get total count
        total = query.count()
        
        # Get data with pagination
        data = query.order_by(ClimateData.date.desc()).offset(offset).limit(limit).all()
        
        # Convert to Pydantic models
        climate_data_points = [ClimateDataPoint.from_orm(item) for item in data]
        
        logger.info(f"✅ Retrieved {len(climate_data_points)} climate data records")
        
        return ClimateDataResponse(
            data=climate_data_points,
            total=total,
            limit=limit,
            offset=offset,
            has_more=offset + limit < total
        )
        
    except Exception as e:
        logger.error(f"❌ Error fetching climate data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch climate data"
        )


@router.get("/summary", response_model=ClimateSummary)
async def get_climate_summary(
    location: str = Query(..., description="Location name"),
    data_type: DataType = Query(..., description="Type of climate data"),
    token: Optional[str] = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get climate data summary for a specific location and data type
    """
    try:
        # Get recent data for the location and type
        recent_data = db.query(ClimateData).filter(
            and_(
                ClimateData.location == location,
                ClimateData.data_type == data_type
            )
        ).order_by(ClimateData.date.desc()).limit(10).all()
        
        if not recent_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for {location} - {data_type}"
            )
        
        # Calculate summary statistics
        values = [item.value for item in recent_data]
        current_value = values[0]
        avg_value = sum(values) / len(values)
        min_value = min(values)
        max_value = max(values)
        
        # Get date range
        date_range = f"{recent_data[-1].date.strftime('%Y-%m-%d')} to {recent_data[0].date.strftime('%Y-%m-%d')}"
        
        logger.info(f"✅ Generated climate summary for {location} - {data_type}")
        
        return ClimateSummary(
            data_type=data_type,
            location=location,
            average_value=avg_value,
            min_value=min_value,
            max_value=max_value,
            total_records=len(recent_data),
            date_range=date_range,
            unit=recent_data[0].unit
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error generating climate summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate climate summary"
        )


@router.get("/regions", response_model=List[RegionData])
async def get_regional_data(
    data_type: DataType = Query(..., description="Type of climate data"),
    token: Optional[str] = Depends(get_current_user_email),
    db: Session = Depends(get_db)
):
    """
    Get aggregated climate data by region
    """
    try:
        # Aggregate data by region using SQLAlchemy
        results = db.query(
            ClimateData.location,
            func.avg(ClimateData.value).label('average_value'),
            func.min(ClimateData.value).label('min_value'),
            func.max(ClimateData.value).label('max_value'),
            func.count(ClimateData.id).label('data_points'),
            ClimateData.unit
        ).filter(
            ClimateData.data_type == data_type
        ).group_by(
            ClimateData.location, ClimateData.unit
        ).order_by(
            func.avg(ClimateData.value).desc()
        ).limit(20).all()
        
        # Convert to RegionData objects
        regional_data = []
        for result in results:
            # Get sample data points for this region
            sample_data = db.query(ClimateData).filter(
                and_(
                    ClimateData.location == result.location,
                    ClimateData.data_type == data_type
                )
            ).limit(5).all()
            
            climate_data_points = [ClimateDataPoint.from_orm(item) for item in sample_data]
            
            regional_data.append(RegionData(
                region=result.location,
                latitude=sample_data[0].latitude if sample_data else 0.0,
                longitude=sample_data[0].longitude if sample_data else 0.0,
                data_points=climate_data_points,
                summary=ClimateSummary(
                    data_type=data_type,
                    location=result.location,
                    average_value=result.average_value,
                    min_value=result.min_value,
                    max_value=result.max_value,
                    total_records=result.data_points,
                    date_range="Recent data",
                    unit=result.unit
                )
            ))
        
        logger.info(f"✅ Retrieved regional data for {data_type}")
        
        return regional_data
        
    except Exception as e:
        logger.error(f"❌ Error fetching regional data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch regional data"
        )


@router.get("/types", response_model=List[str])
async def get_data_types(token: Optional[str] = Depends(get_current_user_email)):
    """
    Get available climate data types
    """
    try:
        # Return all available data types
        data_types = [data_type.value for data_type in DataType]
        
        logger.info("✅ Retrieved available data types")
        
        return data_types
        
    except Exception as e:
        logger.error(f"❌ Error fetching data types: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch data types"
        )


@router.get("/sources", response_model=List[str])
async def get_data_sources(token: Optional[str] = Depends(get_current_user_email)):
    """
    Get available data sources
    """
    try:
        # Return all available data sources
        data_sources = [source.value for source in DataSource]
        
        logger.info("✅ Retrieved available data sources")
        
        return data_sources
        
    except Exception as e:
        logger.error(f"❌ Error fetching data sources: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch data sources"
        )
