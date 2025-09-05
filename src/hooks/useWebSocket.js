import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:1401';

const useWebSocket = ({ onMessage, onConnect, onDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const { user } = useAuth();

  // Stable callback refs to avoid dependency issues
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
  }, [onMessage, onConnect, onDisconnect]);

  const cleanupConnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      // Remove event listeners to prevent memory leaks
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      
      if (socketRef.current.readyState === WebSocket.OPEN || 
          socketRef.current.readyState === WebSocket.CONNECTING) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (socketRef.current && 
        (socketRef.current.readyState === WebSocket.CONNECTING || 
         socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    // Check reconnection limit
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');
    cleanupConnection();

    try {
      const wsUrl = `${WEBSOCKET_URL}/ws/chat/live?user_id=${user?.id || ''}&username=${user?.email?.split('@')[0] || 'Anonymous'}`;
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0; // Reset counter on successful connection
        if (onConnectRef.current) onConnectRef.current();
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          
          // Handle special "recent_messages" format from server
          if (data.type === 'recent_messages') {
            try {
              let recentData;
              if (typeof data.content === 'string') {
                recentData = JSON.parse(data.content);
              } else if (data.message) {
                recentData = JSON.parse(data.message);
              } else {
                recentData = data;
              }
              
              if (recentData.messages && Array.isArray(recentData.messages)) {
                console.log('Processing recent messages:', recentData.messages.length);
                // Send each message individually to match expected format
                recentData.messages.forEach(msg => {
                  console.log('Adding recent message:', msg);
                  if (onMessageRef.current) onMessageRef.current(msg);
                });
              }
            } catch (parseError) {
              console.error('Error parsing recent messages:', parseError, data);
            }
          } else {
            // Handle normal individual messages
            console.log('Adding new message:', data);
            if (onMessageRef.current) onMessageRef.current(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, event.data);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        if (onDisconnectRef.current) onDisconnectRef.current();
        
        // Auto-reconnect on abnormal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000); // Exponential backoff, max 30s
          
          console.log(`WebSocket disconnected. Attempting reconnect ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };
      
      socketRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('disconnected');
    }
  }, [user, cleanupConnection]);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      cleanupConnection();
    };
  }, [connectWebSocket, cleanupConnection]);

  const sendMessage = (message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        ...message,
        created_at: new Date().toISOString()
      }));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  };

  const manualReconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0; // Reset attempts for manual reconnection
    connectWebSocket();
  }, [connectWebSocket]);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    manualReconnect
  };
};

export default useWebSocket;