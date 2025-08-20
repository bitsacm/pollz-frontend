import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiDollarSign, FiMessageCircle, FiWifi, FiWifiOff, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import ChatMessage from './ChatMessage';
import SuperChatModal from './SuperChatModal';
import useWebSocket from '../../hooks/useWebSocket';
import api from '../../services/api';

const LiveChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showSuperChatModal, setShowSuperChatModal] = useState(false);
  const [superChats, setSuperChats] = useState([]);
  const messagesEndRef = useRef(null);
  
  const { sendMessage, isConnected, connectionStatus, manualReconnect } = useWebSocket({
    onMessage: (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    },
    onConnect: () => {
      fetchRecentMessages();
    },
    onDisconnect: () => {
    }
  });

  useEffect(() => {
    fetchSuperChats();
    const interval = setInterval(fetchSuperChats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecentMessages = async () => {
    try {
      // Recent messages will come through WebSocket connection, not HTTP API
      // This function is called onConnect, but recent messages are sent automatically
      // by the WebSocket server when client connects, so we don't need to fetch separately
      console.log('WebSocket connected - waiting for recent messages...');
    } catch (error) {
      console.error('Error in fetchRecentMessages:', error);
    }
  };

  const fetchSuperChats = async () => {
    try {
      const response = await api.get('/superchat/get-super-chats/');
      setSuperChats(response.data);
    } catch (error) {
      console.error('Error fetching superchats:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.warning('Please login to send messages');
      return;
    }
    
    if (!inputMessage.trim()) return;
    
    if (isConnected) {
      sendMessage({
        type: 'text',
        message: inputMessage,
        username: user.email?.split('@')[0] || 'Anonymous',
        user_id: user.id
      });
      setInputMessage('');
    } else {
      toast.error('Chat connection lost. Please refresh the page.');
    }
  };

  const handleSuperChatSuccess = (superchat) => {
    sendMessage({
      type: 'superchat',
      message: superchat.message,
      username: user.email?.split('@')[0] || 'Anonymous',
      user_id: user.id,
      amount: superchat.amount
    });
    setShowSuperChatModal(false);
    fetchSuperChats();
    toast.success('SuperChat sent successfully!');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-full">
      <div className="bg-theme-accent-yellow text-theme-black p-3 rounded-t-lg flex-shrink-0">
        <h2 className="text-lg font-bold flex items-center">
          <FiMessageCircle className="mr-2" />
          Live Chat
          <div className="ml-auto flex items-center space-x-2">
            {connectionStatus === 'connected' && (
              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center">
                <FiWifi className="mr-1" />
                Connected
              </span>
            )}
            {connectionStatus === 'connecting' && (
              <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded flex items-center">
                <FiLoader className="mr-1 animate-spin" />
                Connecting...
              </span>
            )}
            {connectionStatus === 'disconnected' && (
              <>
                <span className="text-xs bg-red-600 text-white px-2 py-1 rounded flex items-center">
                  <FiWifiOff className="mr-1" />
                  Disconnected
                </span>
                <button
                  onClick={manualReconnect}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center"
                  title="Retry connection"
                >
                  <FiRefreshCw className="mr-1" />
                  Retry
                </button>
              </>
            )}
          </div>
        </h2>
      </div>

      {superChats.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-2 border-b flex-shrink-0">
          <div className="text-xs font-semibold text-gray-700 mb-1">Top SuperChats</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {superChats.slice(0, 2).map((sc, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white bg-opacity-70 rounded p-1">
                <span className="text-xs font-medium truncate">{sc.message}</span>
                <span className="text-xs font-bold text-orange-600">₹{sc.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <FiMessageCircle className="text-3xl mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No messages yet. Be the first to chat!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3 flex-shrink-0">
        {/* Live chat messaging temporarily disabled */}
        <div className="text-center text-gray-500 py-2 bg-gray-50 rounded-lg">
          Live chat messaging is temporarily disabled
        </div>
        {/* {user ? (
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                connectionStatus === 'connected' 
                  ? "Type your message..." 
                  : connectionStatus === 'connecting'
                  ? "Connecting to chat..."
                  : "Chat disconnected - click retry to reconnect"
              }
              disabled={connectionStatus !== 'connected'}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent-yellow disabled:bg-gray-100 disabled:text-gray-500"
              maxLength={200}
            />
            <div 
              className="relative group"
              title="SuperChat feature coming soon - PR in progress"
            >
              <button
                type="button"
                disabled={true}
                className="bg-gray-400 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed opacity-50"
              >
                <FiDollarSign />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                SuperChat coming soon - PR in progress
              </div>
            </div>
            <button
              type="submit"
              disabled={!isConnected || !inputMessage.trim()}
              className="bg-theme-accent-yellow text-theme-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend />
            </button>
          </form>
        ) : (
          <div className="text-center text-gray-500 py-2">
            Please login to participate in chat
          </div>
        )} */}
      </div>

      {showSuperChatModal && (
        <SuperChatModal
          onClose={() => setShowSuperChatModal(false)}
          onSuccess={handleSuperChatSuccess}
        />
      )}
    </div>
  );
};

export default LiveChat;