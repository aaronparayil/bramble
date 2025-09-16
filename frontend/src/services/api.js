import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Climate Data API
export const climateAPI = {
  // Get climate data
  getClimateData: (params) => api.get('/api/data', { params }),
  
  // Get climate summary
  getClimateSummary: (location, dataType) => 
    api.get('/api/data/summary', { 
      params: { location, data_type: dataType } 
    }),
  
  // Get regional data
  getRegionalData: (dataType) => 
    api.get('/api/data/regions', { 
      params: { data_type: dataType } 
    }),
  
  // Get data types
  getDataTypes: () => api.get('/api/data/types'),
  
  // Get data sources
  getDataSources: () => api.get('/api/data/sources'),
};

// Predictions API
export const predictionsAPI = {
  // Get temperature predictions
  getTemperaturePredictions: (location, daysAhead) => 
    api.get('/api/predictions/temperature', { 
      params: { location, days_ahead: daysAhead } 
    }),
  
  // Get rainfall predictions
  getRainfallPredictions: (location, daysAhead) => 
    api.get('/api/predictions/rainfall', { 
      params: { location, days_ahead: daysAhead } 
    }),
  
  // Get CO2 predictions
  getCO2Predictions: (location, daysAhead) => 
    api.get('/api/predictions/co2-levels', { 
      params: { location, days_ahead: daysAhead } 
    }),
  
  // Get available models
  getAvailableModels: () => api.get('/api/predictions/models'),
  
  // Get model accuracy
  getModelAccuracy: (modelName) => 
    api.get('/api/predictions/accuracy', { 
      params: { model_name: modelName } 
    }),

  // Run notebook-based prediction
  runNotebookPrediction: (inputs) => 
    api.post('/api/predictions/notebook', inputs),
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: () => api.get('/api/users/profile'),
  
  // Update user profile
  updateProfile: (profileData) => api.put('/api/users/profile', profileData),
  
  // Get favorite regions
  getFavoriteRegions: () => api.get('/api/users/favorites/regions'),
  
  // Add favorite region
  addFavoriteRegion: (region) => 
    api.post('/api/users/favorites/regions', null, { 
      params: { region } 
    }),
  
  // Remove favorite region
  removeFavoriteRegion: (region) => 
    api.delete(`/api/users/favorites/regions/${region}`),
  
  // Get favorite datasets
  getFavoriteDatasets: () => api.get('/api/users/favorites/datasets'),
  
  // Add favorite dataset
  addFavoriteDataset: (dataset) => 
    api.post('/api/users/favorites/datasets', null, { 
      params: { dataset } 
    }),
  
  // Remove favorite dataset
  removeFavoriteDataset: (dataset) => 
    api.delete(`/api/users/favorites/datasets/${dataset}`),
};

// Auth API
export const authAPI = {
  // Login
  login: (credentials) => api.post('/api/auth/login', credentials),
  
  // Register
  register: (userData) => api.post('/api/auth/register', userData),
  
  // Get current user
  getCurrentUser: () => api.get('/api/auth/me'),
};

export default api;
