"""
Users router for BRAMBLE Climate Data Platform
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import logging
from sqlalchemy import and_

from app.models.user import UserResponse, UserUpdate
from app.models.database_models import User, UserFavoriteRegion, UserFavoriteDataset
from app.core.database import get_db
from app.core.security import get_current_user_email
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


async def get_current_user(token: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    """Get current user from token"""
    user = db.query(User).filter(User.email == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user profile
    """
    try:
        logger.info(f"✅ Retrieved profile for user: {current_user.email}")
        return UserResponse.from_orm(current_user)
        
    except Exception as e:
        logger.error(f"❌ Error fetching user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile
    """
    try:
        # Prepare update data
        update_data = user_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Check for unique constraints
        if "email" in update_data:
            existing_user = db.query(User).filter(User.email == update_data["email"]).first()
            if existing_user and existing_user.id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        if "username" in update_data:
            existing_user = db.query(User).filter(User.username == update_data["username"]).first()
            if existing_user and existing_user.id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Update user
        for field, value in update_data.items():
            setattr(current_user, field, value)
        
        db.commit()
        db.refresh(current_user)
        
        logger.info(f"✅ Updated profile for user: {current_user.email}")
        
        return UserResponse.from_orm(current_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating user profile: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )


@router.post("/favorites/regions")
async def add_favorite_region(
    region_name: str,
    latitude: float,
    longitude: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a region to user's favorites
    """
    try:
        # Check if region already exists
        existing_favorite = db.query(UserFavoriteRegion).filter(
            and_(
                UserFavoriteRegion.user_id == current_user.id,
                UserFavoriteRegion.region_name == region_name
            )
        ).first()
        
        if existing_favorite:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Region already in favorites"
            )
        
        # Add region to favorites
        favorite_region = UserFavoriteRegion(
            user_id=current_user.id,
            region_name=region_name,
            latitude=latitude,
            longitude=longitude
        )
        
        db.add(favorite_region)
        db.commit()
        
        logger.info(f"✅ Added region {region_name} to favorites for user: {current_user.email}")
        
        return {"message": f"Region {region_name} added to favorites"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error adding favorite region: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add favorite region"
        )


@router.delete("/favorites/regions/{region_name}")
async def remove_favorite_region(
    region_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a region from user's favorites
    """
    try:
        # Find and remove region from favorites
        favorite_region = db.query(UserFavoriteRegion).filter(
            and_(
                UserFavoriteRegion.user_id == current_user.id,
                UserFavoriteRegion.region_name == region_name
            )
        ).first()
        
        if not favorite_region:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Region not in favorites"
            )
        
        db.delete(favorite_region)
        db.commit()
        
        logger.info(f"✅ Removed region {region_name} from favorites for user: {current_user.email}")
        
        return {"message": f"Region {region_name} removed from favorites"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error removing favorite region: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove favorite region"
        )


@router.get("/favorites/regions", response_model=List[str])
async def get_favorite_regions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get user's favorite regions
    """
    try:
        # Get user's favorite regions
        favorite_regions = db.query(UserFavoriteRegion).filter(
            UserFavoriteRegion.user_id == current_user.id
        ).all()
        
        region_names = [region.region_name for region in favorite_regions]
        
        logger.info(f"✅ Retrieved favorite regions for user: {current_user.email}")
        
        return region_names
        
    except Exception as e:
        logger.error(f"❌ Error fetching favorite regions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch favorite regions"
        )


@router.post("/favorites/datasets")
async def add_favorite_dataset(
    data_type: str,
    source: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a dataset to user's favorites
    """
    try:
        # Check if dataset already exists
        existing_favorite = db.query(UserFavoriteDataset).filter(
            and_(
                UserFavoriteDataset.user_id == current_user.id,
                UserFavoriteDataset.data_type == data_type,
                UserFavoriteDataset.source == source
            )
        ).first()
        
        if existing_favorite:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dataset already in favorites"
            )
        
        # Add dataset to favorites
        favorite_dataset = UserFavoriteDataset(
            user_id=current_user.id,
            data_type=data_type,
            source=source
        )
        
        db.add(favorite_dataset)
        db.commit()
        
        logger.info(f"✅ Added dataset {data_type} to favorites for user: {current_user.email}")
        
        return {"message": f"Dataset {data_type} added to favorites"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error adding favorite dataset: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add favorite dataset"
        )


@router.delete("/favorites/datasets/{data_type}")
async def remove_favorite_dataset(
    data_type: str,
    source: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a dataset from user's favorites
    """
    try:
        # Find and remove dataset from favorites
        favorite_dataset = db.query(UserFavoriteDataset).filter(
            and_(
                UserFavoriteDataset.user_id == current_user.id,
                UserFavoriteDataset.data_type == data_type,
                UserFavoriteDataset.source == source
            )
        ).first()
        
        if not favorite_dataset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dataset not in favorites"
            )
        
        db.delete(favorite_dataset)
        db.commit()
        
        logger.info(f"✅ Removed dataset {data_type} from favorites for user: {current_user.email}")
        
        return {"message": f"Dataset {data_type} removed from favorites"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error removing favorite dataset: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove favorite dataset"
        )


@router.get("/favorites/datasets", response_model=List[str])
async def get_favorite_datasets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get user's favorite datasets
    """
    try:
        # Get user's favorite datasets
        favorite_datasets = db.query(UserFavoriteDataset).filter(
            UserFavoriteDataset.user_id == current_user.id
        ).all()
        
        dataset_names = [f"{dataset.data_type}_{dataset.source}" for dataset in favorite_datasets]
        
        logger.info(f"✅ Retrieved favorite datasets for user: {current_user.email}")
        
        return dataset_names
        
    except Exception as e:
        logger.error(f"❌ Error fetching favorite datasets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch favorite datasets"
        )
