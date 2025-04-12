import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContext } from '@/context/AuthContext';

interface WebSocketContextType {
  socket: WebSocket | null;
  connected: boolean;
  sendMessage: (message: any) => void;
  lastMessage: any | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const auth = useContext(AuthContext);
  
  // Handle case when auth context is not yet initialized
  const isAuthenticated = auth?.isAuthenticated || false;

  // Function to create the WebSocket connection
  const createWebSocketConnection = () => {
    try {
      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Attempting to connect to WebSocket at:', wsUrl);
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        setConnected(true);
        
        // If user is authenticated, identify them to the server
        if (auth?.user) {
          newSocket.send(JSON.stringify({
            type: 'identify',
            userId: auth.user.id,
            role: auth.user.role,
          }));
        }
      };
      
      newSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          setLastMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      newSocket.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        setConnected(false);
        
        // Attempt to reconnect after delay unless it was an intentional close
        if (event.code !== 1000) {
          setTimeout(() => {
            if (document.visibilityState !== 'hidden') {
              createWebSocketConnection();
            }
          }, 3000);
        }
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };
      
      setSocket(newSocket);
      
      return newSocket;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return null;
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = createWebSocketConnection();
    
    // Cleanup function
    return () => {
      if (newSocket && newSocket.readyState === WebSocket.OPEN) {
        newSocket.close(1000, 'Component unmounted');
      }
    };
  }, []);

  // Implement a ping/pong mechanism to keep the connection alive
  useEffect(() => {
    if (!socket || !connected) return;
    
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
    
    return () => {
      clearInterval(pingInterval);
    };
  }, [socket, connected]);

  // Function to send messages through the WebSocket
  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        connected,
        sendMessage,
        lastMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  
  // Instead of throwing an error, return a default object if used outside provider
  if (context === undefined) {
    console.warn('useWebSocket was called outside of WebSocketProvider. Using fallback values.');
    return {
      socket: null,
      connected: false,
      sendMessage: () => console.warn('WebSocket not available'),
      lastMessage: null
    };
  }
  
  return context;
};