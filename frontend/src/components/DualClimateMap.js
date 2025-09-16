import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Layers, 
  Search, 
  Info, 
  Thermometer, 
  CloudRain, 
  Wind,
  TrendingUp,
  MapPin,
  X,
  Calendar,
  Globe,
  Map,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { climateAPI } from '../services/api';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DualClimateMap = () => {
  const [selectedDataType, setSelectedDataType] = useState('temperature');
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    yearRange: '2024',
    confidence: 0.7
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [viewMode, setViewMode] = useState('global'); // 'global' or 'detailed'
  const [isFullscreen, setIsFullscreen] = useState(false);

  const dataTypes = [
    { value: 'temperature', label: 'Temperature', icon: Thermometer, color: '#ff6b6b' },
    { value: 'rainfall', label: 'Rainfall', icon: CloudRain, color: '#4ecdc4' },
    { value: 'wind_speed', label: 'Wind Speed', icon: Wind, color: '#45b7d1' },
    { value: 'co2_levels', label: 'CO₂ Levels', icon: TrendingUp, color: '#f39c12' },
  ];

  const yearOptions = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: 'all', label: 'All Years' },
  ];

  // Sample location data for search functionality
  const locationDatabase = [
    { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India' },
    { name: 'Delhi', lat: 28.7041, lon: 77.1025, country: 'India' },
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946, country: 'India' },
    { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, country: 'India' },
    { name: 'Chennai', lat: 13.0827, lon: 80.2707, country: 'India' },
    { name: 'Kolkata', lat: 22.5726, lon: 88.3639, country: 'India' },
    { name: 'Pune', lat: 18.5204, lon: 73.8567, country: 'India' },
    { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, country: 'India' },
    { name: 'Jaipur', lat: 26.9124, lon: 75.7873, country: 'India' },
    { name: 'Lucknow', lat: 26.8467, lon: 80.9462, country: 'India' },
    { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'USA' },
    { name: 'London', lat: 51.5074, lon: -0.1278, country: 'UK' },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
    { name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'Egypt' },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'Brazil' },
    { name: 'Moscow', lat: 55.7558, lon: 37.6176, country: 'Russia' },
    { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
    { name: 'Shanghai', lat: 31.2304, lon: 121.4737, country: 'China' },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'UAE' },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'Singapore' },
    { name: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'Thailand' },
    { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'South Korea' },
    { name: 'Jakarta', lat: -6.2088, lon: 106.8456, country: 'Indonesia' },
    { name: 'Manila', lat: 14.5995, lon: 120.9842, country: 'Philippines' },
    { name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869, country: 'Malaysia' },
    { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297, country: 'Vietnam' },
    { name: 'Hanoi', lat: 21.0285, lon: 105.8542, country: 'Vietnam' },
    { name: 'Yangon', lat: 16.8661, lon: 96.1951, country: 'Myanmar' },
    { name: 'Phnom Penh', lat: 11.5564, lon: 104.9282, country: 'Cambodia' },
    { name: 'Vientiane', lat: 17.9757, lon: 102.6331, country: 'Laos' },
    { name: 'Ulaanbaatar', lat: 47.8864, lon: 106.9057, country: 'Mongolia' },
    { name: 'Astana', lat: 51.1694, lon: 71.4491, country: 'Kazakhstan' },
    { name: 'Tashkent', lat: 41.2995, lon: 69.2401, country: 'Uzbekistan' },
    { name: 'Almaty', lat: 43.2220, lon: 76.8512, country: 'Kazakhstan' },
    { name: 'Bishkek', lat: 42.8746, lon: 74.5698, country: 'Kyrgyzstan' },
    { name: 'Dushanbe', lat: 38.5358, lon: 68.7791, country: 'Tajikistan' },
    { name: 'Ashgabat', lat: 37.9601, lon: 58.3261, country: 'Turkmenistan' },
    { name: 'Baku', lat: 40.4093, lon: 49.8671, country: 'Azerbaijan' },
    { name: 'Yerevan', lat: 40.1872, lon: 44.5152, country: 'Armenia' },
    { name: 'Tbilisi', lat: 41.7151, lon: 44.8271, country: 'Georgia' },
    { name: 'Tehran', lat: 35.6892, lon: 51.3890, country: 'Iran' },
    { name: 'Baghdad', lat: 33.3152, lon: 44.3661, country: 'Iraq' },
    { name: 'Riyadh', lat: 24.7136, lon: 46.6753, country: 'Saudi Arabia' },
    { name: 'Jeddah', lat: 21.4858, lon: 39.1925, country: 'Saudi Arabia' },
    { name: 'Amman', lat: 31.9454, lon: 35.9284, country: 'Jordan' },
    { name: 'Beirut', lat: 33.8935, lon: 35.5016, country: 'Lebanon' },
    { name: 'Damascus', lat: 33.5138, lon: 36.2765, country: 'Syria' },
    { name: 'Jerusalem', lat: 31.7683, lon: 35.2137, country: 'Israel' },
    { name: 'Tel Aviv', lat: 32.0853, lon: 34.7818, country: 'Israel' },
    { name: 'Istanbul', lat: 41.0082, lon: 28.9784, country: 'Turkey' },
    { name: 'Ankara', lat: 39.9334, lon: 32.8597, country: 'Turkey' },
    { name: 'Athens', lat: 37.9838, lon: 23.7275, country: 'Greece' },
    { name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'Italy' },
    { name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'Spain' },
    { name: 'Barcelona', lat: 41.3851, lon: 2.1734, country: 'Spain' },
    { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
    { name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'Germany' },
    { name: 'Munich', lat: 48.1351, lon: 11.5820, country: 'Germany' },
    { name: 'Hamburg', lat: 53.5511, lon: 9.9937, country: 'Germany' },
    { name: 'Cologne', lat: 50.9375, lon: 6.9603, country: 'Germany' },
    { name: 'Frankfurt', lat: 50.1109, lon: 8.6821, country: 'Germany' },
    { name: 'Stuttgart', lat: 48.7758, lon: 9.1829, country: 'Germany' },
    { name: 'Düsseldorf', lat: 51.2277, lon: 6.7735, country: 'Germany' },
    { name: 'Dortmund', lat: 51.5136, lon: 7.4653, country: 'Germany' },
    { name: 'Essen', lat: 51.4556, lon: 7.0116, country: 'Germany' },
    { name: 'Leipzig', lat: 51.3397, lon: 12.3731, country: 'Germany' },
    { name: 'Bremen', lat: 53.0793, lon: 8.8017, country: 'Germany' },
    { name: 'Dresden', lat: 51.0504, lon: 13.7373, country: 'Germany' },
    { name: 'Hannover', lat: 52.3759, lon: 9.7320, country: 'Germany' },
    { name: 'Nuremberg', lat: 49.4521, lon: 11.0767, country: 'Germany' },
    { name: 'Duisburg', lat: 51.4344, lon: 6.7623, country: 'Germany' },
    { name: 'Bochum', lat: 51.4818, lon: 7.2162, country: 'Germany' },
    { name: 'Wuppertal', lat: 51.2562, lon: 7.1508, country: 'Germany' },
    { name: 'Bielefeld', lat: 52.0302, lon: 8.5325, country: 'Germany' },
    { name: 'Bonn', lat: 50.7374, lon: 7.0982, country: 'Germany' },
    { name: 'Mannheim', lat: 49.4875, lon: 8.4660, country: 'Germany' },
    { name: 'Karlsruhe', lat: 49.0069, lon: 8.4037, country: 'Germany' },
    { name: 'Wiesbaden', lat: 50.0782, lon: 8.2397, country: 'Germany' },
    { name: 'Gelsenkirchen', lat: 51.5138, lon: 7.0937, country: 'Germany' },
    { name: 'Münster', lat: 51.9607, lon: 7.6261, country: 'Germany' },
    { name: 'Chemnitz', lat: 50.8278, lon: 12.9242, country: 'Germany' },
    { name: 'Augsburg', lat: 48.3705, lon: 10.8978, country: 'Germany' },
    { name: 'Braunschweig', lat: 52.2689, lon: 10.5267, country: 'Germany' },
    { name: 'Aachen', lat: 50.7753, lon: 6.0839, country: 'Germany' },
    { name: 'Krefeld', lat: 51.3392, lon: 6.5531, country: 'Germany' },
    { name: 'Halle', lat: 51.4964, lon: 11.9688, country: 'Germany' },
    { name: 'Kiel', lat: 54.3233, lon: 10.1228, country: 'Germany' },
    { name: 'Magdeburg', lat: 52.1205, lon: 11.6276, country: 'Germany' },
    { name: 'Freiburg', lat: 47.9990, lon: 7.8421, country: 'Germany' },
    { name: 'Krefeld', lat: 51.3392, lon: 6.5531, country: 'Germany' },
    { name: 'Lübeck', lat: 53.8654, lon: 10.6866, country: 'Germany' },
    { name: 'Oberhausen', lat: 51.4699, lon: 6.8514, country: 'Germany' },
    { name: 'Erfurt', lat: 50.9848, lon: 11.0299, country: 'Germany' },
    { name: 'Mainz', lat: 49.9929, lon: 8.2473, country: 'Germany' },
    { name: 'Rostock', lat: 54.0924, lon: 12.0991, country: 'Germany' },
    { name: 'Kassel', lat: 51.3127, lon: 9.4797, country: 'Germany' },
    { name: 'Hagen', lat: 51.3671, lon: 7.4633, country: 'Germany' },
    { name: 'Potsdam', lat: 52.3906, lon: 13.0645, country: 'Germany' },
    { name: 'Mülheim', lat: 51.4275, lon: 6.8834, country: 'Germany' },
    { name: 'Ludwigshafen', lat: 49.4744, lon: 8.4352, country: 'Germany' },
    { name: 'Leverkusen', lat: 51.0459, lon: 6.9853, country: 'Germany' },
    { name: 'Oldenburg', lat: 53.1434, lon: 8.2146, country: 'Germany' },
    { name: 'Osnabrück', lat: 52.2799, lon: 8.0472, country: 'Germany' },
    { name: 'Solingen', lat: 51.1702, lon: 7.0845, country: 'Germany' },
    { name: 'Heidelberg', lat: 49.3988, lon: 8.6724, country: 'Germany' },
    { name: 'Herne', lat: 51.5426, lon: 7.2190, country: 'Germany' },
    { name: 'Neuss', lat: 51.2042, lon: 6.6879, country: 'Germany' },
    { name: 'Darmstadt', lat: 49.8728, lon: 8.6512, country: 'Germany' },
    { name: 'Paderborn', lat: 51.7189, lon: 8.7575, country: 'Germany' },
    { name: 'Regensburg', lat: 49.0134, lon: 12.1016, country: 'Germany' },
    { name: 'Ingolstadt', lat: 48.7644, lon: 11.4241, country: 'Germany' },
    { name: 'Würzburg', lat: 49.7913, lon: 9.9534, country: 'Germany' },
    { name: 'Fürth', lat: 49.4778, lon: 10.9887, country: 'Germany' },
    { name: 'Wolfsburg', lat: 52.4226, lon: 10.7865, country: 'Germany' },
    { name: 'Offenbach', lat: 50.1109, lon: 8.6821, country: 'Germany' },
    { name: 'Ulm', lat: 48.3984, lon: 9.9916, country: 'Germany' },
    { name: 'Heilbronn', lat: 49.1427, lon: 9.2105, country: 'Germany' },
    { name: 'Pforzheim', lat: 48.8926, lon: 8.7051, country: 'Germany' },
    { name: 'Göttingen', lat: 51.5413, lon: 9.9158, country: 'Germany' },
    { name: 'Bottrop', lat: 51.5235, lon: 6.9227, country: 'Germany' },
    { name: 'Trier', lat: 49.7499, lon: 6.6373, country: 'Germany' },
    { name: 'Recklinghausen', lat: 51.6138, lon: 7.1978, country: 'Germany' },
    { name: 'Reutlingen', lat: 48.4914, lon: 9.2045, country: 'Germany' },
    { name: 'Bremerhaven', lat: 53.5396, lon: 8.5809, country: 'Germany' },
    { name: 'Koblenz', lat: 50.3569, lon: 7.5940, country: 'Germany' },
    { name: 'Bergisch Gladbach', lat: 50.9856, lon: 7.1327, country: 'Germany' },
    { name: 'Jena', lat: 50.9279, lon: 11.5892, country: 'Germany' },
    { name: 'Remscheid', lat: 51.1789, lon: 7.1907, country: 'Germany' },
    { name: 'Erlangen', lat: 49.5897, lon: 11.0041, country: 'Germany' },
    { name: 'Moers', lat: 51.4516, lon: 6.6271, country: 'Germany' },
    { name: 'Siegen', lat: 50.8750, lon: 8.0167, country: 'Germany' },
    { name: 'Hildesheim', lat: 52.1508, lon: 9.9511, country: 'Germany' },
    { name: 'Salzgitter', lat: 52.1508, lon: 10.3417, country: 'Germany' },
    { name: 'Cottbus', lat: 51.7563, lon: 14.3329, country: 'Germany' },
    { name: 'Gera', lat: 50.8805, lon: 12.0826, country: 'Germany' },
    { name: 'Kaiserslautern', lat: 49.4447, lon: 7.7690, country: 'Germany' },
    { name: 'Schwerin', lat: 53.6355, lon: 11.4012, country: 'Germany' },
    { name: 'Dessau', lat: 51.8364, lon: 12.2468, country: 'Germany' },
    { name: 'Brandenburg', lat: 52.4125, lon: 12.5316, country: 'Germany' },
  ];

  useEffect(() => {
    // Simulate API call to fetch climate data
    setTimeout(() => {
      setMapData(locationDatabase.map(location => ({
        ...location,
        temperature: Math.random() * 30 + 10,
        rainfall: Math.random() * 100,
        wind_speed: Math.random() * 20 + 5,
        co2_levels: Math.random() * 50 + 400,
      })));
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = locationDatabase.filter(location =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.country.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleLocationSelect = (location) => {
    setMapCenter([location.lat, location.lon]);
    setMapZoom(8);
    setSearchQuery(location.name);
    setShowSearchResults(false);
  };

  const getDataValue = (location) => {
    switch (selectedDataType) {
      case 'temperature':
        return `${location.temperature?.toFixed(1)}°C`;
      case 'rainfall':
        return `${location.rainfall?.toFixed(1)}mm`;
      case 'wind_speed':
        return `${location.wind_speed?.toFixed(1)}km/h`;
      case 'co2_levels':
        return `${location.co2_levels?.toFixed(1)}ppm`;
      default:
        return 'N/A';
    }
  };

  const getDataColor = (location) => {
    const value = location[selectedDataType];
    if (!value) return '#666';
    
    switch (selectedDataType) {
      case 'temperature':
        return value > 25 ? '#ff4444' : value > 15 ? '#ffaa00' : '#44aaff';
      case 'rainfall':
        return value > 50 ? '#4444ff' : value > 20 ? '#44aaff' : '#aaff44';
      case 'wind_speed':
        return value > 15 ? '#ff4444' : value > 8 ? '#ffaa00' : '#44ff44';
      case 'co2_levels':
        return value > 450 ? '#ff4444' : value > 420 ? '#ffaa00' : '#44ff44';
      default:
        return '#666';
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'global' ? 'detailed' : 'global');
    if (viewMode === 'global') {
      setMapZoom(8);
    } else {
      setMapZoom(2);
      setMapCenter([20, 0]);
    }
  };

  const resetMap = () => {
    setMapCenter([20, 0]);
    setMapZoom(2);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''} bg-gray-50 dark:bg-gray-900`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Climate Map</h1>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleViewMode}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'global'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>Global</span>
              </button>
              <button
                onClick={toggleViewMode}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'detailed'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Map className="h-4 w-4" />
                <span>Detailed</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={resetMap}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-4 w-4" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4" />
                  <span>Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for a city or country..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Search Results */}
          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
              >
                {searchResults.map((location) => (
                  <button
                    key={`${location.name}-${location.country}`}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{location.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{location.country}</div>
                    </div>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center space-x-4">
          {/* Data Type Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Type:</label>
            <div className="flex space-x-1">
              {dataTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedDataType(type.value)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    selectedDataType === type.value
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <type.icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year:</label>
            <select
              value={filters.yearRange}
              onChange={(e) => setFilters({ ...filters, yearRange: e.target.value })}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {yearOptions.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.confidence}
              onChange={(e) => setFilters({ ...filters, confidence: parseFloat(e.target.value) })}
              className="w-24"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{(filters.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className={`relative ${isFullscreen ? 'h-full' : 'h-[calc(100vh-200px)]'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="loading-spinner"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading climate data...</span>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            zoomControl={false}
          >
            <ZoomControl position="bottomright" />
            
            {/* Global View - Satellite Style */}
            {viewMode === 'global' && (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            )}
            
            {/* Detailed View - Standard Style */}
            {viewMode === 'detailed' && (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            )}

            {/* Climate Data Markers */}
            {mapData.map((location) => (
              <Circle
                key={`${location.name}-${location.country}`}
                center={[location.lat, location.lon]}
                radius={viewMode === 'global' ? 50000 : 10000}
                pathOptions={{
                  color: getDataColor(location),
                  fillColor: getDataColor(location),
                  fillOpacity: 0.6,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{location.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{location.country}</p>
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        {dataTypes.find(t => t.value === selectedDataType)?.icon && 
                          React.createElement(dataTypes.find(t => t.value === selectedDataType).icon, {
                            className: "h-4 w-4",
                            style: { color: getDataColor(location) }
                          })
                        }
                        <span className="text-sm font-medium">
                          {getDataValue(location)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Low</span>
          </div>
        </div>
      </div>

      {/* View Mode Indicator */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {viewMode === 'global' ? (
            <>
              <Globe className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Global View</span>
            </>
          ) : (
            <>
              <Map className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Detailed View</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DualClimateMap;

