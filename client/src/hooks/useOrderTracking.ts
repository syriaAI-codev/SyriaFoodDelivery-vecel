import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '../context/WebSocketContext';
import { useAuth } from './useAuth';
import { Order } from '@shared/schema';

interface OrderTrackingOptions {
  orderId?: number;
  includeHistory?: boolean;
}

export function useOrderTracking(options: OrderTrackingOptions = {}) {
  const { orderId, includeHistory = false } = options;
  const { user } = useAuth();
  const { connected, lastMessage } = useWebSocket();
  const queryClient = useQueryClient();
  const [locationUpdates, setLocationUpdates] = useState<Array<{ lat: number; lng: number; timestamp: Date }>>([]);
  
  // Determine which API endpoint to use based on user role and orderId
  const getEndpoint = () => {
    if (orderId) {
      return `/api/orders/${orderId}`;
    }
    
    if (!user) return null;
    
    switch (user.role) {
      case 'customer':
        return '/api/orders';
      case 'restaurant':
        return '/api/restaurant/orders';
      case 'delivery':
        return '/api/delivery/orders';
      case 'admin':
        return '/api/admin/orders';
      default:
        return null;
    }
  };
  
  const endpoint = getEndpoint();
  
  // Fetch order data
  const orderQuery = useQuery({
    queryKey: endpoint ? [endpoint] : null,
    enabled: !!endpoint && !!user,
    refetchInterval: connected ? false : 5000, // Only poll if WebSocket is disconnected
  });
  
  // Process WebSocket messages for real-time updates
  useEffect(() => {
    if (!lastMessage) return;
    
    try {
      // Handle different message types
      switch (lastMessage.type) {
        case 'order_status_update':
          if (orderId && lastMessage.orderId === orderId) {
            // Update single order
            queryClient.setQueryData([`/api/orders/${orderId}`], (oldData: any) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  status: lastMessage.status,
                  updatedAt: new Date().toISOString(),
                },
              };
            });
          } else {
            // Invalidate orders list queries based on role
            queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
            queryClient.invalidateQueries({ queryKey: ['/api/restaurant/orders'] });
            queryClient.invalidateQueries({ queryKey: ['/api/delivery/orders'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
          }
          break;
          
        case 'driver_location_update':
          if (orderId && lastMessage.orderId === orderId) {
            // Add to location history if tracking a specific order
            if (includeHistory) {
              setLocationUpdates(prev => [
                ...prev,
                {
                  lat: lastMessage.lat,
                  lng: lastMessage.lng,
                  timestamp: new Date(),
                },
              ]);
            }
            
            // Update the current order with driver location
            queryClient.setQueryData([`/api/orders/${orderId}`], (oldData: any) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  driverLocation: {
                    lat: lastMessage.lat,
                    lng: lastMessage.lng,
                  },
                },
              };
            });
          }
          break;
          
        case 'new_order':
          // For restaurant owners, refresh their orders list
          if (user?.role === 'restaurant' || user?.role === 'admin') {
            queryClient.invalidateQueries({ 
              queryKey: [user.role === 'restaurant' ? '/api/restaurant/orders' : '/api/admin/orders']
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, [lastMessage, orderId, queryClient, user, includeHistory]);
  
  return {
    order: orderId ? orderQuery.data?.data : null,
    orders: !orderId ? orderQuery.data?.data : null,
    isLoading: orderQuery.isLoading,
    isError: orderQuery.isError,
    error: orderQuery.error,
    locationHistory: locationUpdates,
    webSocketConnected: connected,
  };
}