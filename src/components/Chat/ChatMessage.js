import React from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign } from 'react-icons/fi';

const ChatMessage = ({ message }) => {
  const isSuperChat = message.type === 'superchat';
  
  if (isSuperChat) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-3 shadow-lg"
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center">
            <FiDollarSign className="mr-1" />
            <span className="font-bold">{message.username}</span>
          </div>
          <span className="bg-white text-orange-600 px-2 py-1 rounded text-sm font-bold">
            ₹{message.amount}
          </span>
        </div>
        <p className="text-white font-medium">{message.message}</p>
        <span className="text-xs text-yellow-100">
          {new Date(message.created_at).toLocaleTimeString()}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex items-start space-x-2"
    >
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600">
        {message.username?.charAt(0).toUpperCase() || '?'}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline space-x-2">
          <span className="font-semibold text-sm text-gray-700">
            {message.username || 'Anonymous'}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-gray-800 text-sm mt-1">{message.message}</p>
      </div>
    </motion.div>
  );
};

export default ChatMessage;