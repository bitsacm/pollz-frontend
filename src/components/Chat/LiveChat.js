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
  const [selectedSuperChat, setSelectedSuperChat] = useState(null);
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
      // Use WebSocket server API to get recent messages
      const response = await fetch('http://localhost:1401/api/messages/search?limit=50');
      const messages = await response.json();
      setMessages(messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
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
    <div className="bg-white rounded-lg shadow-lg flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
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
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-2 border-b flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center mb-2">
            <FiDollarSign className="text-white mr-1" />
            <span className="text-xs font-bold">SuperChats</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {superChats.map((sc, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSuperChat(sc)}
                  className="bg-white bg-opacity-90 text-gray-800 rounded-lg p-2 min-w-[120px] max-w-[160px] flex-shrink-0 cursor-pointer hover:bg-opacity-100 transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-orange-600">₹{sc.amount}</span>
                    <span className="text-xs text-gray-600 truncate max-w-[60px]">
                      {sc.user === '105864875153426983926' ? 'Anonymous' : (sc.user?.split('@')[0] || 'User')}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-gray-700 truncate">
                    {sc.message || 'SuperChat'}
                  </div>
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
        {user ? (
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
            <button
              type="button"
              onClick={() => setShowSuperChatModal(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-colors"
              title="Send SuperChat"
            >
              <FiDollarSign />
            </button>
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
        )}
      </div>

      {showSuperChatModal && (
        <SuperChatModal
          onClose={() => setShowSuperChatModal(false)}
          onSuccess={handleSuperChatSuccess}
        />
      )}

      {selectedSuperChat && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSuperChat(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <FiDollarSign className="mr-2 text-orange-500" />
                SuperChat Details
              </h3>
              <button
                onClick={() => setSelectedSuperChat(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-lg font-bold text-orange-600">₹{selectedSuperChat.amount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">From:</span>
                <span className="text-sm font-medium text-gray-800">
                  {selectedSuperChat.user === '105864875153426983926' 
                    ? 'Anonymous' 
                    : (selectedSuperChat.user?.split('@')[0] || 'User')}
                </span>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Message:</span>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {selectedSuperChat.message || 'No message'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time:</span>
                <span className="text-sm text-gray-800">
                  {new Date(selectedSuperChat.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChat;