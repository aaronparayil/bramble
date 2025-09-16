import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  MapPin, 
  Thermometer, 
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { predictionsAPI, climateAPI } from '../services/api';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, BarChart, Bar } from 'recharts';

const AIClimatePredictor = () => {
  const [formData, setFormData] = useState({
    locationName: '',
    currentTemperature: '',
    targetYear: '2025'
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historical, setHistorical] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [city, setCity] = useState('mumbai');
  const [useCustom, setUseCustom] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const y = String(currentYear + i);
    return { value: y, label: y };
  });

  const INDIAN_CITIES = [
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bengaluru', label: 'Bengaluru' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'pune', label: 'Pune' },
    { value: 'jaipur', label: 'Jaipur' },
    { value: 'ahmedabad', label: 'Ahmedabad' },
    { value: 'surat', label: 'Surat' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.locationName.trim()) {
      setError('Location name is required');
      return false;
    }
    if (!formData.currentTemperature) {
      setError('Current temperature is required');
      return false;
    }
    if (isNaN(parseFloat(formData.currentTemperature))) {
      setError('Current temperature must be a valid number');
      return false;
    }
    return true;
  };

  const generatePrediction = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        location: formData.locationName,
        current_temperature: parseFloat(formData.currentTemperature),
        target_year: formData.targetYear,
      };

      const { data } = await predictionsAPI.runNotebookPrediction(payload);

      const location = data.location || formData.locationName;
      const currentTemp = typeof data.current_temperature !== 'undefined'
        ? parseFloat(data.current_temperature)
        : parseFloat(formData.currentTemperature);
      const targetYear = data.target_year || formData.targetYear;
      const predictedTemp = parseFloat(
        data.predicted_temperature ?? (currentTemp + 0.02 * (parseInt(targetYear) - new Date().getFullYear()))
      );
      const confidence = parseFloat(data.confidence ?? 0.9);

      setPrediction({
        location,
        currentTemperature: currentTemp,
        predictedTemperature: predictedTemp.toFixed(1),
        temperatureChange: (predictedTemp - currentTemp).toFixed(1),
        targetYear,
        confidence: confidence.toFixed(2),
        factors: data.factors || [
          'Historical temperature trends',
          'Global warming patterns',
          'Regional climate models',
          'Atmospheric CO₂ levels',
          'Ocean current influences'
        ],
        recommendations: data.recommendations || [
          'Monitor local climate adaptation strategies',
          'Consider renewable energy investments',
          'Plan for potential agricultural impacts',
          'Review infrastructure resilience'
        ]
      });

      // Fetch historical temperature data for charts (last 5 years)
      const now = new Date();
      const start = new Date(now);
      start.setFullYear(start.getFullYear() - 5);
      const params = {
        location: location,
        data_type: 'temperature',
        start_date: start.toISOString(),
        end_date: now.toISOString(),
        limit: 1000,
      };
      try {
        const resp = await climateAPI.getClimateData(params);
        const rows = (resp.data?.data || resp.data || []).map(d => ({
          date: d.date || d.timestamp || d.created_at,
          value: d.value || d.temperature || d.predicted_value || 0,
        }));
        // Normalize date label (YYYY-MM)
        const normalized = rows
          .filter(r => r.date)
          .map(r => ({
            date: new Date(r.date),
            value: Number(r.value),
            label: new Date(r.date).toISOString().slice(0, 10),
            monthKey: `${new Date(r.date).getFullYear()}-${String(new Date(r.date).getMonth() + 1).padStart(2,'0')}`
          }))
          .sort((a,b) => a.date - b.date);
        setHistorical(normalized.map(r => ({ date: r.label, temperature: r.value })));
        // Monthly aggregation (average)
        const monthMap = new Map();
        normalized.forEach(r => {
          const key = r.monthKey;
          const curr = monthMap.get(key) || { key, sum: 0, n: 0 };
          curr.sum += r.value; curr.n += 1; monthMap.set(key, curr);
        });
        const monthlySeries = Array.from(monthMap.values())
          .map(m => ({ month: m.key, avg: m.sum / m.n }))
          .sort((a,b) => a.month.localeCompare(b.month));
        setMonthly(monthlySeries);
      } catch (e) {
        // Non-fatal; charts just won't render
        setHistorical([]);
        setMonthly([]);
      }
    } catch (err) {
      setError('Failed to generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Climate Predictor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get AI-powered predictions for future temperature changes in any location worldwide
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prediction Parameters Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prediction Parameters</h2>
            </div>

            <div className="space-y-6">
              {/* India City Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location in India
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={useCustom ? 'custom' : city}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === 'custom') {
                          setUseCustom(true);
                          setCity('custom');
                          setFormData(prev => ({ ...prev, locationName: '' }));
                        } else {
                          setUseCustom(false);
                          setCity(v);
                          const chosen = INDIAN_CITIES.find(c => c.value === v)?.label || v;
                          setFormData(prev => ({ ...prev, locationName: chosen }));
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white"
                    >
                      {INDIAN_CITIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                      <option value="custom">Custom (enter city)</option>
                    </select>
                  </div>
                  {useCustom && (
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="locationName"
                        value={formData.locationName}
                        onChange={handleInputChange}
                        placeholder="Enter Indian city (e.g., Nagpur)"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Current Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Temperature (°C)
                </label>
                <div className="relative">
                  <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="currentTemperature"
                    value={formData.currentTemperature}
                    onChange={handleInputChange}
                    placeholder="e.g., 25.5"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Target Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Year
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="targetYear"
                    value={formData.targetYear}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white"
                  >
                    {yearOptions.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generatePrediction}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating Prediction...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    <span>Generate AI Prediction</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* AI Prediction Results Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Prediction Results</h2>
            </div>

            {!prediction ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Brain className="h-12 w-12 text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Enter location details and current temperature to get AI-powered climate predictions
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Prediction Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{prediction.location}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Target: {prediction.targetYear}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Temperature</p>
                      <p className="text-2xl font-bold text-blue-600">{prediction.currentTemperature}°C</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Predicted Temperature</p>
                      <p className="text-2xl font-bold text-orange-600">{prediction.predictedTemperature}°C</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Temperature Change</p>
                    <p className={`text-lg font-semibold ${parseFloat(prediction.temperatureChange) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {prediction.temperatureChange > 0 ? '+' : ''}{prediction.temperatureChange}°C
                    </p>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Confidence</span>
                    <span className="text-lg font-bold text-green-600">{(parseFloat(prediction.confidence) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${parseFloat(prediction.confidence) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Analysis Factors */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Analysis Factors</h4>
                  <div className="space-y-2">
                    {prediction.factors.map((factor, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {prediction.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p>
                    <strong>Disclaimer:</strong> These predictions are based on AI analysis of historical climate data and current trends. 
                    They should be used for planning purposes only and not as definitive forecasts. 
                    Actual climate changes may vary due to numerous environmental and human factors.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Charts Section */}
        {prediction && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Historical Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historical Temperature Trend (Last 5 Years)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historical} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                    <XAxis dataKey="date" hide />
                    <YAxis tick={{ fill: '#6b7280' }} />
                    <Tooltip formatter={(v) => [`${v}°C`, 'Temperature']} labelFormatter={() => ''} />
                    <Area type="monotone" dataKey="temperature" stroke="#3b82f6" fillOpacity={1} fill="url(#tempFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Averages */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Average Temperature</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                    <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                    <YAxis tick={{ fill: '#6b7280' }} />
                    <Tooltip formatter={(v) => [`${v.toFixed ? v.toFixed(1) : v}°C`, 'Avg Temp']} />
                    <Bar dataKey="avg" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIClimatePredictor;
