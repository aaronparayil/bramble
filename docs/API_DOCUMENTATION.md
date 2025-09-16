# BRAMBLE API Documentation

## Overview

The BRAMBLE Climate Data Platform provides a comprehensive REST API for accessing climate data, generating predictions, and managing user accounts. The API is built with FastAPI and provides automatic interactive documentation.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.bramble-climate.com`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string",
  "full_name": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "email": "user@example.com",
  "full_name": "string",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### POST /api/auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### GET /api/auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "email": "user@example.com",
  "full_name": "string",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Climate Data

#### GET /api/data
Retrieve climate data with optional filtering.

**Query Parameters:**
- `location` (string, optional): Location name
- `latitude` (float, optional): Latitude coordinate
- `longitude` (float, optional): Longitude coordinate
- `data_type` (string, optional): Type of climate data
- `start_date` (datetime, optional): Start date for filtering
- `end_date` (datetime, optional): End date for filtering
- `limit` (integer, default: 1000): Number of records to return
- `skip` (integer, default: 0): Number of records to skip

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "location": "string",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "data_type": "temperature",
      "value": 22.5,
      "unit": "celsius",
      "date": "2024-01-15T10:00:00Z",
      "source": "nasa",
      "confidence": 0.95
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 1000,
  "has_more": false
}
```

#### GET /api/data/summary
Get climate data summary for a specific location and data type.

**Query Parameters:**
- `location` (string, required): Location name
- `data_type` (string, required): Type of climate data

**Response:**
```json
{
  "location": "New York",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "data_type": "temperature",
  "current_value": 22.5,
  "unit": "celsius",
  "trend": "increasing",
  "change_percentage": 2.1,
  "last_updated": "2024-01-15T10:00:00Z",
  "data_points_count": 100
}
```

#### GET /api/data/regions
Get aggregated climate data by region.

**Query Parameters:**
- `data_type` (string, required): Type of climate data

**Response:**
```json
[
  {
    "region": "North America",
    "data_type": "temperature",
    "average_value": 22.5,
    "min_value": 15.2,
    "max_value": 28.7,
    "unit": "celsius",
    "data_points": 1000,
    "last_updated": "2024-01-15T10:00:00Z"
  }
]
```

#### GET /api/data/types
Get available climate data types.

**Response:**
```json
[
  "temperature",
  "rainfall",
  "humidity",
  "co2_levels",
  "sea_level",
  "glacier_melt",
  "ozone_level",
  "wind_speed",
  "pressure"
]
```

#### GET /api/data/sources
Get available data sources.

**Response:**
```json
[
  "nasa",
  "noaa",
  "world_bank",
  "openweather",
  "custom"
]
```

### ML Predictions

#### GET /api/predictions/temperature
Get temperature predictions for a location.

**Query Parameters:**
- `location` (string, required): Location name
- `days_ahead` (integer, default: 30): Number of days to predict

**Response:**
```json
{
  "location": "New York",
  "data_type": "temperature",
  "predictions": [
    {
      "date": "2024-02-01T00:00:00Z",
      "temperature": 19.5,
      "confidence": 0.85,
      "unit": "celsius"
    }
  ],
  "model_info": {
    "model_name": "temperature_forecast_v1",
    "accuracy": 0.85,
    "last_trained": "2024-01-15T10:00:00Z"
  }
}
```

#### GET /api/predictions/rainfall
Get rainfall predictions for a location.

**Query Parameters:**
- `location` (string, required): Location name
- `days_ahead` (integer, default: 30): Number of days to predict

**Response:**
```json
{
  "location": "New York",
  "data_type": "rainfall",
  "predictions": [
    {
      "date": "2024-02-01T00:00:00Z",
      "rainfall": 52.3,
      "confidence": 0.78,
      "unit": "mm"
    }
  ],
  "model_info": {
    "model_name": "rainfall_forecast_v1",
    "accuracy": 0.78,
    "last_trained": "2024-01-15T10:00:00Z"
  }
}
```

#### GET /api/predictions/co2-levels
Get CO₂ level predictions for a location.

**Query Parameters:**
- `location` (string, required): Location name
- `days_ahead` (integer, default: 30): Number of days to predict

**Response:**
```json
{
  "location": "New York",
  "data_type": "co2_levels",
  "predictions": [
    {
      "date": "2024-02-01T00:00:00Z",
      "co2_level": 415.2,
      "confidence": 0.92,
      "unit": "ppm"
    }
  ],
  "model_info": {
    "model_name": "co2_forecast_v1",
    "accuracy": 0.92,
    "last_trained": "2024-01-15T10:00:00Z"
  }
}
```

#### GET /api/predictions/models
Get available ML models.

**Response:**
```json
{
  "models": [
    {
      "name": "temperature_forecast_v1",
      "description": "Temperature prediction model",
      "data_type": "temperature",
      "accuracy": 0.85,
      "last_trained": "2024-01-15T10:00:00Z",
      "status": "active"
    }
  ]
}
```

#### GET /api/predictions/accuracy
Get model accuracy metrics.

**Query Parameters:**
- `model_name` (string, required): Model name

**Response:**
```json
{
  "overall_accuracy": 0.85,
  "mae": 1.2,
  "rmse": 1.8,
  "r2_score": 0.82,
  "last_evaluated": "2024-01-15T10:00:00Z"
}
```

### User Management

#### GET /api/users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "email": "user@example.com",
  "full_name": "string",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z",
  "favorite_regions": ["New York", "London"],
  "favorite_datasets": ["temperature", "rainfall"]
}
```

#### PUT /api/users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "string",
  "email": "user@example.com",
  "full_name": "string"
}
```

#### GET /api/users/favorites/regions
Get user's favorite regions.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
["New York", "London", "Tokyo"]
```

#### POST /api/users/favorites/regions
Add a region to favorites.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `region` (string, required): Region name

#### DELETE /api/users/favorites/regions/{region}
Remove a region from favorites.

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /api/users/favorites/datasets
Get user's favorite datasets.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
["temperature", "rainfall", "co2_levels"]
```

#### POST /api/users/favorites/datasets
Add a dataset to favorites.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `dataset` (string, required): Dataset name

#### DELETE /api/users/favorites/datasets/{dataset}
Remove a dataset from favorites.

**Headers:**
```
Authorization: Bearer <token>
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

API requests are limited to:
- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

## Interactive Documentation

Visit `/docs` or `/redoc` on your API server for interactive documentation powered by FastAPI.

## SDKs and Libraries

### Python
```python
import requests

# Example usage
response = requests.get(
    "http://localhost:8000/api/data",
    headers={"Authorization": "Bearer your-token"}
)
data = response.json()
```

### JavaScript
```javascript
// Example usage
const response = await fetch('http://localhost:8000/api/data', {
  headers: {
    'Authorization': 'Bearer your-token'
  }
});
const data = await response.json();
```

## Support

For API support and questions:
- Email: api-support@bramble-climate.com
- Documentation: https://docs.bramble-climate.com
- GitHub Issues: https://github.com/bramble-climate/api/issues
