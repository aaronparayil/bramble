"""
ML Predictions router for BRAMBLE Climate Data Platform
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import json
import os

try:
    import papermill as pm
    import nbformat as nbf
    PAPERMILL_AVAILABLE = True
except Exception:
    PAPERMILL_AVAILABLE = False

from app.models.climate_data import DataType
from app.core.security import get_current_user_email
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

@router.post("/notebook")
async def run_notebook_prediction(
    payload: Dict[str, Any] = Body(..., description="Inputs for the notebook model") ,
    token: Optional[str] = Depends(get_current_user_email)
):
    """
    Execute bramble.ipynb with provided inputs and return parsed results.
    Expects the notebook to write a JSON result to a cell tagged 'result_json' or
    to an output file path provided in inputs under key 'output_path'.
    """
    try:
        notebook_path = os.path.join(os.getcwd(), "bramble.ipynb")
        if not os.path.exists(notebook_path):
            raise HTTPException(status_code=404, detail="bramble.ipynb not found in backend root")

        # Decide output path
        output_path = payload.get("output_path") or os.path.join(os.getcwd(), "bramble_out.ipynb")

        if PAPERMILL_AVAILABLE:
            try:
                # Execute notebook with parameters
                pm.execute_notebook(
                    input_path=notebook_path,
                    output_path=output_path,
                    parameters=payload,
                    request_save_on_cell_execute=True,
                    log_output=False,
                    stdout_file=False,
                )

                # Try to parse JSON from a cell tagged 'result_json' in the executed notebook
                try:
                    nb = nbf.read(output_path, as_version=4)
                    for cell in nb.cells:
                        if cell.cell_type == "code" and cell.metadata.get("tags") and "result_json" in cell.metadata.get("tags", []):
                            # Look for last output stream or execute_result with JSON
                            if cell.get("outputs"):
                                for out in cell["outputs"]:
                                    if out.get("output_type") in ("stream", "execute_result", "display_data"):
                                        text = None
                                        if "text" in out:
                                            text = "".join(out["text"]) if isinstance(out["text"], list) else out["text"]
                                        elif "data" in out and "text/plain" in out["data"]:
                                            text = out["data"]["text/plain"]
                                        if text:
                                            try:
                                                return json.loads(text)
                                            except Exception:
                                                pass
                    # If tag not found, fallback to a generic success with file reference
                    return {"status": "ok", "message": "Notebook executed", "output_notebook": output_path}
                except Exception as parse_err:
                    logger.warning(f"Could not parse JSON result from notebook: {parse_err}")
                    return {"status": "ok", "message": "Notebook executed", "output_notebook": output_path}
            except Exception as exec_err:
                logger.error(f"Notebook execution failed, falling back to simulated result: {exec_err}")
                # Fall through to simulated response below
        else:
            # Fallback simulation if papermill isn't available in env
            logger.warning("papermill not available; returning simulated prediction result")
            location = payload.get("location") or payload.get("locationName") or "Unknown"
            target_year = str(payload.get("target_year") or payload.get("targetYear") or datetime.utcnow().year)
            current_temp = float(payload.get("current_temperature") or payload.get("currentTemperature") or 20.0)
            years_diff = int(target_year) - datetime.utcnow().year
            predicted = current_temp + 0.02 * years_diff
            return {
                "location": location,
                "target_year": target_year,
                "current_temperature": current_temp,
                "predicted_temperature": round(predicted, 2),
                "confidence": 0.9,
                "status": "simulated"
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing notebook: {e}")
        raise HTTPException(status_code=500, detail="Failed to run notebook prediction")


@router.get("/temperature")
async def predict_temperature(
    location: str = Query(..., description="Location name"),
    days_ahead: int = Query(30, ge=1, le=365, description="Days to predict"),
    token: Optional[str] = Depends(get_current_user_email)
):
    """
    Predict temperature for a specific location
    """
    try:
        # This is a placeholder - in a real implementation,
        # you would load the trained model and make predictions
        
        # Mock prediction data
        base_temp = 20.0  # Base temperature in Celsius
        predictions = []
        
        for i in range(days_ahead):
            # Simple mock prediction with some variation
            predicted_temp = base_temp + (i * 0.1) + (i % 7 * 0.5)
            confidence = max(0.7, 1.0 - (i * 0.01))  # Decreasing confidence over time
            
            predictions.append({
                "date": (datetime.utcnow() + timedelta(days=i)).isoformat(),
                "temperature": round(predicted_temp, 2),
                "confidence": round(confidence, 3),
                "unit": "celsius"
            })
        
        logger.info(f"✅ Generated temperature predictions for {location}")
        
        return {
            "location": location,
            "data_type": "temperature",
            "predictions": predictions,
            "model_info": {
                "model_name": "temperature_forecast_v1",
                "accuracy": 0.85,
                "last_trained": "2024-01-15T10:00:00Z"
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating temperature predictions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate temperature predictions"
        )


@router.get("/rainfall")
async def predict_rainfall(
    location: str = Query(..., description="Location name"),
    days_ahead: int = Query(30, ge=1, le=365, description="Days to predict"),
    token: Optional[str] = Depends(get_current_user_email)
):
    """
    Predict rainfall for a specific location
    """
    try:
        # Mock prediction data
        predictions = []
        
        for i in range(days_ahead):
            # Simple mock prediction with seasonal patterns
            day_of_year = (datetime.utcnow() + timedelta(days=i)).timetuple().tm_yday
            seasonal_factor = 1 + 0.3 * (1 + (day_of_year % 365) / 365)
            
            predicted_rainfall = max(0, 2.5 * seasonal_factor + (i % 7 * 0.5))
            confidence = max(0.6, 1.0 - (i * 0.015))
            
            predictions.append({
                "date": (datetime.utcnow() + timedelta(days=i)).isoformat(),
                "rainfall": round(predicted_rainfall, 2),
                "confidence": round(confidence, 3),
                "unit": "mm"
            })
        
        logger.info(f"✅ Generated rainfall predictions for {location}")
        
        return {
            "location": location,
            "data_type": "rainfall",
            "predictions": predictions,
            "model_info": {
                "model_name": "rainfall_forecast_v1",
                "accuracy": 0.78,
                "last_trained": "2024-01-15T10:00:00Z"
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating rainfall predictions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate rainfall predictions"
        )


@router.get("/co2-levels")
async def predict_co2_levels(
    location: str = Query(..., description="Location name"),
    days_ahead: int = Query(30, ge=1, le=365, description="Days to predict"),
    token: Optional[str] = Depends(get_current_user_email)
):
    """
    Predict CO2 levels for a specific location
    """
    try:
        # Mock prediction data
        base_co2 = 410.0  # Base CO2 level in ppm
        predictions = []
        
        for i in range(days_ahead):
            # Simple mock prediction with gradual increase
            predicted_co2 = base_co2 + (i * 0.1) + (i % 30 * 0.5)
            confidence = max(0.8, 1.0 - (i * 0.005))
            
            predictions.append({
                "date": (datetime.utcnow() + timedelta(days=i)).isoformat(),
                "co2_level": round(predicted_co2, 2),
                "confidence": round(confidence, 3),
                "unit": "ppm"
            })
        
        logger.info(f"✅ Generated CO2 level predictions for {location}")
        
        return {
            "location": location,
            "data_type": "co2_levels",
            "predictions": predictions,
            "model_info": {
                "model_name": "co2_forecast_v1",
                "accuracy": 0.92,
                "last_trained": "2024-01-15T10:00:00Z"
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating CO2 predictions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate CO2 predictions"
        )


@router.get("/models")
async def get_available_models(token: Optional[str] = Depends(get_current_user_email)):
    """
    Get available ML models
    """
    try:
        models = [
            {
                "name": "temperature_forecast_v1",
                "description": "Temperature prediction model",
                "data_type": "temperature",
                "accuracy": 0.85,
                "last_trained": "2024-01-15T10:00:00Z",
                "status": "active"
            },
            {
                "name": "rainfall_forecast_v1",
                "description": "Rainfall prediction model",
                "data_type": "rainfall",
                "accuracy": 0.78,
                "last_trained": "2024-01-15T10:00:00Z",
                "status": "active"
            },
            {
                "name": "co2_forecast_v1",
                "description": "CO2 levels prediction model",
                "data_type": "co2_levels",
                "accuracy": 0.92,
                "last_trained": "2024-01-15T10:00:00Z",
                "status": "active"
            }
        ]
        
        logger.info("✅ Retrieved available ML models")
        
        return {"models": models}
        
    except Exception as e:
        logger.error(f"❌ Error fetching models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch available models"
        )


@router.get("/accuracy")
async def get_model_accuracy(
    model_name: str = Query(..., description="Model name"),
    token: Optional[str] = Depends(get_current_user_email)
):
    """
    Get model accuracy metrics
    """
    try:
        # Mock accuracy data
        accuracy_data = {
            "temperature_forecast_v1": {
                "overall_accuracy": 0.85,
                "mae": 1.2,
                "rmse": 1.8,
                "r2_score": 0.82,
                "last_evaluated": "2024-01-15T10:00:00Z"
            },
            "rainfall_forecast_v1": {
                "overall_accuracy": 0.78,
                "mae": 2.5,
                "rmse": 3.2,
                "r2_score": 0.75,
                "last_evaluated": "2024-01-15T10:00:00Z"
            },
            "co2_forecast_v1": {
                "overall_accuracy": 0.92,
                "mae": 0.8,
                "rmse": 1.1,
                "r2_score": 0.89,
                "last_evaluated": "2024-01-15T10:00:00Z"
            }
        }
        
        if model_name not in accuracy_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Model {model_name} not found"
            )
        
        logger.info(f"✅ Retrieved accuracy metrics for {model_name}")
        
        return accuracy_data[model_name]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching model accuracy: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch model accuracy"
        )
