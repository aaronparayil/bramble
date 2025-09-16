import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import ClimateMap from './pages/ClimateMap';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Chatbot from './components/Chatbot';
import WelcomeNotification from './components/WelcomeNotification';
import AIClimatePredictor from './components/AIClimatePredictor';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<ClimateMap />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ai-predictor" element={<AIClimatePredictor />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </motion.div>
          </main>
        </div>
        <Chatbot />
        <WelcomeNotification />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
