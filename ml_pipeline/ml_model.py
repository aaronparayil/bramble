"""
Machine Learning Models for BRAMBLE Climate Data Platform
Main ML service file with climate prediction models
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ClimatePredictionModel:
    """Base class for climate prediction models"""
    
    def __init__(self, model_name: str, data_type: str):
        self.model_name = model_name
        self.data_type = data_type
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.accuracy_metrics = {}
        
    def preprocess_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Preprocess climate data for training"""
        # Remove missing values
        data = data.dropna()
        
        # Add time-based features
        if 'date' in data.columns:
            data['date'] = pd.to_datetime(data['date'])
            data['year'] = data['date'].dt.year
            data['month'] = data['date'].dt.month
            data['day_of_year'] = data['date'].dt.dayofyear
            data['day_of_week'] = data['date'].dt.dayofweek
        
        return data
    
    def train(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, float]:
        """Train the model"""
        try:
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.model.fit(X_train_scaled, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test_scaled)
            
            # Calculate metrics
            self.accuracy_metrics = {
                'mae': mean_absolute_error(y_test, y_pred),
                'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
                'r2_score': r2_score(y_test, y_pred),
                'overall_accuracy': 1 - (mean_absolute_error(y_test, y_pred) / y_test.mean())
            }
            
            self.is_trained = True
            logger.info(f"✅ Model {self.model_name} trained successfully")
            
            return self.accuracy_metrics
            
        except Exception as e:
            logger.error(f"❌ Error training model {self.model_name}: {e}")
            raise
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Make predictions"""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
    
    def save_model(self, filepath: str):
        """Save the trained model"""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'accuracy_metrics': self.accuracy_metrics,
            'model_name': self.model_name,
            'data_type': self.data_type,
            'trained_at': datetime.utcnow()
        }
        
        joblib.dump(model_data, filepath)
        logger.info(f"✅ Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load a trained model"""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")
        
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.accuracy_metrics = model_data['accuracy_metrics']
        self.model_name = model_data['model_name']
        self.data_type = model_data['data_type']
        self.is_trained = True
        
        logger.info(f"✅ Model loaded from {filepath}")


class TemperatureModel(ClimatePredictionModel):
    """Temperature prediction model"""
    
    def __init__(self):
        super().__init__("temperature_forecast_v1", "temperature")
    
    def prepare_features(self, data: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare features for temperature prediction"""
        data = self.preprocess_data(data)
        
        # Select features for temperature prediction
        feature_columns = ['latitude', 'longitude', 'year', 'month', 'day_of_year']
        target_column = 'value'
        
        X = data[feature_columns]
        y = data[target_column]
        
        return X, y


class RainfallModel(ClimatePredictionModel):
    """Rainfall prediction model"""
    
    def __init__(self):
        super().__init__("rainfall_forecast_v1", "rainfall")
    
    def prepare_features(self, data: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare features for rainfall prediction"""
        data = self.preprocess_data(data)
        
        # Select features for rainfall prediction
        feature_columns = ['latitude', 'longitude', 'year', 'month', 'day_of_year']
        target_column = 'value'
        
        X = data[feature_columns]
        y = data[target_column]
        
        return X, y


class CO2Model(ClimatePredictionModel):
    """CO2 levels prediction model"""
    
    def __init__(self):
        super().__init__("co2_forecast_v1", "co2_levels")
    
    def prepare_features(self, data: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare features for CO2 prediction"""
        data = self.preprocess_data(data)
        
        # Select features for CO2 prediction
        feature_columns = ['latitude', 'longitude', 'year', 'month', 'day_of_year']
        target_column = 'value'
        
        X = data[feature_columns]
        y = data[target_column]
        
        return X, y


class ModelManager:
    """Manager for all climate prediction models"""
    
    def __init__(self, models_dir: str = "models"):
        self.models_dir = models_dir
        self.models = {}
        self._load_models()
    
    def _load_models(self):
        """Load all available models"""
        if not os.path.exists(self.models_dir):
            os.makedirs(self.models_dir)
            logger.info(f"Created models directory: {self.models_dir}")
            return
        
        model_files = {
            'temperature': 'temperature_model.pkl',
            'rainfall': 'rainfall_model.pkl',
            'co2_levels': 'co2_model.pkl'
        }
        
        for data_type, filename in model_files.items():
            filepath = os.path.join(self.models_dir, filename)
            if os.path.exists(filepath):
                try:
                    if data_type == 'temperature':
                        model = TemperatureModel()
                    elif data_type == 'rainfall':
                        model = RainfallModel()
                    elif data_type == 'co2_levels':
                        model = CO2Model()
                    
                    model.load_model(filepath)
                    self.models[data_type] = model
                    logger.info(f"✅ Loaded {data_type} model")
                    
                except Exception as e:
                    logger.error(f"❌ Error loading {data_type} model: {e}")
    
    def get_model(self, data_type: str) -> Optional[ClimatePredictionModel]:
        """Get a specific model"""
        return self.models.get(data_type)
    
    def predict(self, data_type: str, features: pd.DataFrame) -> np.ndarray:
        """Make predictions using the specified model"""
        model = self.get_model(data_type)
        if not model:
            raise ValueError(f"No model available for {data_type}")
        
        return model.predict(features)
    
    def get_model_accuracy(self, data_type: str) -> Dict[str, float]:
        """Get accuracy metrics for a model"""
        model = self.get_model(data_type)
        if not model:
            raise ValueError(f"No model available for {data_type}")
        
        return model.accuracy_metrics


# Global model manager instance
model_manager = ModelManager()


def generate_mock_predictions(location: str, data_type: str, days_ahead: int) -> List[Dict]:
    """Generate mock predictions for development/testing"""
    predictions = []
    base_date = datetime.utcnow()
    
    # Base values for different data types
    base_values = {
        'temperature': 20.0,
        'rainfall': 2.5,
        'co2_levels': 410.0
    }
    
    base_value = base_values.get(data_type, 0.0)
    
    for i in range(days_ahead):
        # Simple mock prediction with some variation
        if data_type == 'temperature':
            predicted_value = base_value + (i * 0.1) + (i % 7 * 0.5)
        elif data_type == 'rainfall':
            predicted_value = max(0, base_value + (i % 7 * 0.5))
        elif data_type == 'co2_levels':
            predicted_value = base_value + (i * 0.1)
        else:
            predicted_value = base_value
        
        confidence = max(0.7, 1.0 - (i * 0.01))
        
        predictions.append({
            'date': (base_date + timedelta(days=i)).isoformat(),
            'value': round(predicted_value, 2),
            'confidence': round(confidence, 3),
            'location': location,
            'data_type': data_type
        })
    
    return predictions


def train_all_models(training_data: pd.DataFrame):
    """Train all climate prediction models"""
    try:
        # Train temperature model
        temp_model = TemperatureModel()
        X_temp, y_temp = temp_model.prepare_features(training_data[training_data['data_type'] == 'temperature'])
        temp_metrics = temp_model.train(X_temp, y_temp)
        temp_model.save_model(os.path.join('models', 'temperature_model.pkl'))
        
        # Train rainfall model
        rain_model = RainfallModel()
        X_rain, y_rain = rain_model.prepare_features(training_data[training_data['data_type'] == 'rainfall'])
        rain_metrics = rain_model.train(X_rain, y_rain)
        rain_model.save_model(os.path.join('models', 'rainfall_model.pkl'))
        
        # Train CO2 model
        co2_model = CO2Model()
        X_co2, y_co2 = co2_model.prepare_features(training_data[training_data['data_type'] == 'co2_levels'])
        co2_metrics = co2_model.train(X_co2, y_co2)
        co2_model.save_model(os.path.join('models', 'co2_model.pkl'))
        
        logger.info("✅ All models trained successfully")
        
        return {
            'temperature': temp_metrics,
            'rainfall': rain_metrics,
            'co2_levels': co2_metrics
        }
        
    except Exception as e:
        logger.error(f"❌ Error training models: {e}")
        raise
