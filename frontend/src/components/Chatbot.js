import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  HelpCircle,
  TrendingUp,
  Map,
  BarChart3,
  Globe,
  Thermometer,
  CloudRain
} from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Welcome message for new users
  const welcomeMessage = {
    id: 1,
    text: "Hello! I'm Bramble, your climate data assistant. I can help you explore our platform and understand climate data. What would you like to know?",
    sender: 'bot',
    timestamp: new Date(),
    suggestions: [
      "What is BRAMBLE?",
      "How to use the climate map?",
      "Understanding the dashboard",
      "Available data types",
      "How to get started"
    ]
  };

  // Chatbot responses
  const responses = {
    "what is bramble": {
      text: "BRAMBLE is a comprehensive climate data visualization platform that helps you explore and understand climate change data through interactive maps, charts, and machine learning predictions. We provide real-time climate data from multiple sources including NASA, NOAA, and OpenWeather.",
      suggestions: ["How to use the climate map?", "Understanding the dashboard", "Available data types"]
    },
    "how to use the climate map": {
      text: "The climate map shows real-time climate data across different locations. You can zoom in/out, click on markers to see detailed information, and filter by data types like temperature, rainfall, CO2 levels, and more. The map updates automatically with the latest data.",
      suggestions: ["Understanding the dashboard", "Available data types", "How to filter data"]
    },
    "understanding the dashboard": {
      text: "The dashboard provides comprehensive climate analytics with interactive charts showing trends over time. You can view temperature patterns, rainfall data, CO2 levels, and other climate indicators. Use the filters to customize your view by location and time period.",
      suggestions: ["Available data types", "How to get started", "Understanding predictions"]
    },
    "available data types": {
      text: "We track 6 main climate data types: Temperature (°C), Rainfall (mm), Wind Speed (km/h), CO2 Levels (ppm), Humidity (%), and Atmospheric Pressure (hPa). Each data point includes location, timestamp, and confidence levels.",
      suggestions: ["How to filter data", "Understanding predictions", "Data sources"]
    },
    "how to get started": {
      text: "To get started: 1) Create an account or log in, 2) Explore the climate map to see global data, 3) Visit the dashboard for detailed analytics, 4) Save your favorite regions and datasets, 5) Check out our ML predictions for future trends.",
      suggestions: ["How to use the climate map?", "Understanding the dashboard", "Available data types"]
    },
    "how to filter data": {
      text: "You can filter data by: Location (select specific regions), Data Type (temperature, rainfall, etc.), Time Range (last 7 days, 30 days, custom), and Source (NASA, NOAA, OpenWeather). Use the filter panels in the map and dashboard views.",
      suggestions: ["Understanding the dashboard", "Available data types", "Data sources"]
    },
    "understanding predictions": {
      text: "Our ML models predict future climate trends based on historical data. We provide temperature forecasts, rainfall predictions, and CO2 level projections with confidence scores. Predictions help understand potential climate changes.",
      suggestions: ["Available data types", "How to get started", "Data sources"]
    },
    "data sources": {
      text: "We aggregate data from multiple reliable sources: NASA (satellite and climate data), NOAA (weather and atmospheric data), OpenWeather (current weather conditions), and custom datasets. All data is validated and quality-checked.",
      suggestions: ["Available data types", "How to filter data", "Understanding predictions"]
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(message.toLowerCase());
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: botResponse.suggestions
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (message) => {
    for (const [key, response] of Object.entries(responses)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    return {
      text: "I'm not sure I understand. Try asking about what BRAMBLE is, how to use the climate map, understanding the dashboard, available data types, or how to get started.",
      suggestions: ["What is BRAMBLE?", "How to use the climate map?", "Understanding the dashboard"]
    };
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot size={20} />
                <div>
                  <h3 className="font-semibold">Bramble Assistant</h3>
                  <p className="text-xs text-blue-100">Climate Data Guide</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-100 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      message.sender === 'user' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs bg-white dark:bg-gray-600 bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about BRAMBLE..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
