import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Thermometer, 
  CloudRain, 
  Wind, 
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Brain
} from 'lucide-react';
import { climateAPI, predictionsAPI } from '../services/api';
import AIClimatePredictor from '../components/AIClimatePredictor';

const Dashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');
  const [selectedDataType, setSelectedDataType] = useState('temperature');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [showAIPredictor, setShowAIPredictor] = useState(false);

  // Mock data for demonstration
  const mockTemperatureData = [
    { date: '2024-01-01', value: 18.5, predicted: 18.2 },
    { date: '2024-01-02', value: 19.2, predicted: 18.8 },
    { date: '2024-01-03', value: 20.1, predicted: 19.5 },
    { date: '2024-01-04', value: 21.3, predicted: 20.2 },
    { date: '2024-01-05', value: 22.0, predicted: 20.8 },
    { date: '2024-01-06', value: 21.8, predicted: 21.1 },
    { date: '2024-01-07', value: 20.5, predicted: 20.9 },
    { date: '2024-01-08', value: 19.7, predicted: 20.3 },
    { date: '2024-01-09', value: 18.9, predicted: 19.7 },
    { date: '2024-01-10', value: 18.2, predicted: 19.1 },
  ];

  const mockRainfallData = [
    { date: '2024-01-01', value: 45.2, predicted: 42.1 },
    { date: '2024-01-02', value: 67.8, predicted: 65.3 },
    { date: '2024-01-03', value: 89.3, predicted: 88.7 },
    { date: '2024-01-04', value: 34.7, predicted: 35.2 },
    { date: '2024-01-05', value: 23.1, predicted: 24.8 },
    { date: '2024-01-06', value: 56.4, predicted: 55.9 },
    { date: '2024-01-07', value: 78.9, predicted: 77.3 },
    { date: '2024-01-08', value: 12.3, predicted: 13.1 },
    { date: '2024-01-09', value: 34.5, predicted: 33.8 },
    { date: '2024-01-10', value: 67.2, predicted: 66.5 },
  ];

  const mockRegionalData = [
    { region: 'North America', temperature: 22.5, rainfall: 45.2, co2: 415.2 },
    { region: 'Europe', temperature: 18.2, rainfall: 67.8, co2: 408.9 },
    { region: 'Asia', temperature: 25.8, rainfall: 89.3, co2: 420.1 },
    { region: 'Africa', temperature: 28.4, rainfall: 34.7, co2: 412.5 },
    { region: 'South America', temperature: 24.1, rainfall: 78.9, co2: 418.3 },
    { region: 'Oceania', temperature: 26.7, rainfall: 56.4, co2: 414.8 },
  ];

  const dataTypes = [
    { value: 'temperature', label: 'Temperature', icon: Thermometer, color: '#ff6b6b', unit: '°C' },
    { value: 'rainfall', label: 'Rainfall', icon: CloudRain, color: '#4ecdc4', unit: 'mm' },
    { value: 'wind_speed', label: 'Wind Speed', icon: Wind, color: '#45b7d1', unit: 'm/s' },
  ];

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setDashboardData({
        temperature: mockTemperatureData,
        rainfall: mockRainfallData,
        regional: mockRegionalData,
        summary: {
          currentTemp: 20.5,
          tempChange: '+2.1°C',
          currentRainfall: 67.8,
          rainfallChange: '+12.3mm',
          currentCO2: 415.2,
          co2Change: '+2.5ppm',
        }
      });
      setLoading(false);
    }, 1500);
  }, []);

  const getCurrentData = () => {
    const dataKey = selectedDataType === 'temperature' ? 'temperature' : 'rainfall';
    return dashboardData[dataKey] || [];
  };

  const getChartColor = () => {
    return dataTypes.find(t => t.value === selectedDataType)?.color || '#0ea5e9';
  };

  const getUnit = () => {
    return dataTypes.find(t => t.value === selectedDataType)?.unit || '';
  };

  if (showAIPredictor) {
    return <AIClimatePredictor />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Climate Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive analytics and insights for climate data analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="input-field text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          
          <button 
            onClick={() => setShowAIPredictor(true)}
            className="btn-primary flex items-center"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Predictor
          </button>
          
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          
          <button className="btn-secondary flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Temperature</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.summary?.currentTemp}°C</p>
              <p className="text-sm text-climate-warning flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {dashboardData.summary?.tempChange}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Thermometer className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Rainfall</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.summary?.currentRainfall}mm</p>
              <p className="text-sm text-climate-cool flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {dashboardData.summary?.rainfallChange}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CloudRain className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CO₂ Levels</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.summary?.currentCO2}ppm</p>
              <p className="text-sm text-climate-warning flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {dashboardData.summary?.co2Change}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Quality</p>
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
              <p className="text-sm text-climate-cool flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2.1%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Type Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Type:</label>
          <div className="flex space-x-2">
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
      </div>

      {/* Main Chart - Full Width and Immersive */}
      <div className="card p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {dataTypes.find(t => t.value === selectedDataType)?.label} Trends Analysis
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Historical Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>ML Predictions</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive analysis of {selectedDataType} patterns with machine learning insights
          </p>
        </div>
        
        <div className="p-6">
          <div className="chart-container" style={{ height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getCurrentData()}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={getChartColor()} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${value}${getUnit()}`}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [value + getUnit(), name === 'value' ? 'Historical' : 'Predicted']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getChartColor()} 
                  fill="url(#colorValue)"
                  strokeWidth={3}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getChartColor()} 
                  strokeWidth={3}
                  dot={{ fill: getChartColor(), strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: getChartColor(), strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#22c55e', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Regional Comparison - Larger and More Immersive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Global Regional Comparison</h3>
            <p className="text-gray-600 dark:text-gray-400">Temperature and rainfall patterns across major regions</p>
          </div>
          <div className="p-6">
            <div className="chart-container" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.regional}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.4}/>
                    </linearGradient>
                    <linearGradient id="rainfallGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ecdc4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4ecdc4" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="region" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="temperature" fill="url(#tempGradient)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rainfall" fill="url(#rainfallGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">CO₂ Distribution Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400">Atmospheric CO₂ levels by region</p>
          </div>
          <div className="p-6">
            <div className="chart-container" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.regional}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ region, value }) => `${region}: ${value}ppm`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="co2"
                  >
                    {dashboardData.regional.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#9b59b6', '#e74c3c'][index % 6]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value} ppm`, 'CO₂ Level']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* AI Predictor Call-to-Action */}
      <div className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Ready for AI-Powered Climate Predictions?</h3>
            <p className="text-blue-100">
              Get personalized climate forecasts for any location worldwide using our advanced AI models
            </p>
          </div>
          <button 
            onClick={() => setShowAIPredictor(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-2"
          >
            <Brain className="h-5 w-5" />
            <span>Try AI Predictor</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
