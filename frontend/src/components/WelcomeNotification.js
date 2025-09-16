import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Sparkles } from 'lucide-react';

const WelcomeNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenNotification, setHasSeenNotification] = useState(false);

  useEffect(() => {
    // Check if user has seen the notification before
    const seen = localStorage.getItem('bramble-welcome-notification');
    if (!seen) {
      // Show notification after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setHasSeenNotification(true);
    localStorage.setItem('bramble-welcome-notification', 'true');
  };

  const handleChatbotClick = () => {
    // Trigger chatbot to open (we'll need to pass this as a prop or use context)
    setIsVisible(false);
    setHasSeenNotification(true);
    localStorage.setItem('bramble-welcome-notification', 'true');
  };

  if (hasSeenNotification) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-6 right-6 z-50 max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 p-4"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Welcome to BRAMBLE! 🌍
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                New to climate data? Our AI assistant can help you explore the platform and understand climate trends.
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleChatbotClick}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>Ask Assistant</span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-3 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeNotification;
