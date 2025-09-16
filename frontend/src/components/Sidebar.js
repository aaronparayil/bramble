import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Map, 
  BarChart3, 
  Filter, 
  ChevronRight,
  Thermometer,
  CloudRain,
  Wind,
  TrendingUp,
  Globe,
  Settings,
  Brain
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Climate Map', path: '/map', icon: Map },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'AI Predictor', path: '/ai-predictor', icon: Brain },
  ];

  const dataTypes = [
    { name: 'Temperature', value: 'temperature', icon: Thermometer, color: 'text-climate-warm' },
    { name: 'Rainfall', value: 'rainfall', icon: CloudRain, color: 'text-climate-cool' },
    { name: 'Wind Speed', value: 'wind_speed', icon: Wind, color: 'text-climate-neutral' },
    { name: 'CO₂ Levels', value: 'co2_levels', icon: TrendingUp, color: 'text-climate-warning' },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleFilter = (filter) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <motion.div
      initial={{ width: isExpanded ? 280 : 80 }}
      animate={{ width: isExpanded ? 280 : 80 }}
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 transition-colors duration-300"
    >
      <div className="p-4">
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          <ChevronRight 
            className={`h-4 w-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
          />
        </button>
      </div>

      {/* Navigation */}
      <div className="px-4 space-y-2">
        <h3 className={`font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider ${
          isExpanded ? 'block' : 'hidden'
        }`}>
          Navigation
        </h3>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Data Type Filters */}
      {isAuthenticated && (
        <div className="mt-8 px-4">
          <h3 className={`font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-3 ${
            isExpanded ? 'block' : 'hidden'
          }`}>
            Data Types
          </h3>
          
          <div className="space-y-2">
            {dataTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeFilters.includes(type.value);
              
              return (
                <button
                  key={type.value}
                  onClick={() => toggleFilter(type.value)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 w-full ${
                    isActive
                      ? 'text-white bg-primary-600'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${type.color}`} />
                  {isExpanded && <span>{type.name}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 px-4">
        <h3 className={`font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-3 ${
          isExpanded ? 'block' : 'hidden'
        }`}>
          Quick Actions
        </h3>
        
        <div className="space-y-2">
          <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 w-full">
            <Globe className="h-5 w-5 flex-shrink-0" />
            {isExpanded && <span>Global View</span>}
          </button>
          
          <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 w-full">
            <Filter className="h-5 w-5 flex-shrink-0" />
            {isExpanded && <span>Advanced Filters</span>}
          </button>
          
          {isAuthenticated && (
            <Link
              to="/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 w-full"
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span>Settings</span>}
            </Link>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {isAuthenticated && activeFilters.length > 0 && isExpanded && (
        <div className="mt-8 px-4">
          <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-3">
            Active Filters
          </h3>
          
          <div className="space-y-2">
            {activeFilters.map((filter) => {
              const filterType = dataTypes.find(t => t.value === filter);
              return (
                <div
                  key={filter}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm"
                >
                  <span>{filterType?.name}</span>
                  <button
                    onClick={() => toggleFilter(filter)}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className={`text-xs text-gray-400 dark:text-gray-500 text-center ${
          isExpanded ? 'block' : 'hidden'
        }`}>
          <p>BRAMBLE v1.0.0</p>
          <p className="mt-1">Climate Data Platform</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
