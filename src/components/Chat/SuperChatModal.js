import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import useRazorpay from '../../hooks/useRazorpay';
import api from '../../services/api';

const SuperChatModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { initiatePayment } = useRazorpay();

  const predefinedAmounts = [50, 100, 200, 500, 1000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 10) {
      toast.error('Minimum SuperChat amount is ₹10');
      return;
    }
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    if (message.length > 200) {
      toast.error('Message must be less than 200 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const orderResponse = await api.post('/superchat/create-order/', {
        amount: amountNum,
        message: message.trim()
      });
      
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.order_id,
        name: 'POLLZ SuperChat',
        description: 'Support the election with a SuperChat',
        prefill: {
          name: user?.first_name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#FFC107'
        },
        handler: function(response) {
          onSuccess({
            message: message.trim(),
            amount: amountNum,
            payment_id: response.razorpay_payment_id
          });
        }
      };
      
      initiatePayment(options);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FiDollarSign className="mr-2 text-yellow-500" />
              Send SuperChat
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Amount (₹)
              </label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className={`py-2 px-3 rounded-lg border transition-colors ${
                      amount === amt.toString()
                        ? 'bg-theme-accent-yellow border-yellow-600 text-theme-black font-semibold'
                        : 'bg-white border-gray-300 hover:border-yellow-400'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Or enter custom amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent-yellow"
                min="10"
                max="10000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your SuperChat message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent-yellow resize-none"
                rows="3"
                maxLength="200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/200 characters
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Your SuperChat will be highlighted in the chat and displayed prominently for all users to see!
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !amount || !message.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Processing...' : `Pay ₹${amount || '0'}`}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SuperChatModal;