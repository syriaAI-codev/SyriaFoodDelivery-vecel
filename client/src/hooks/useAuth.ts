import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.warn('useAuth was called outside of AuthProvider. Using fallback values.');
    // Return a fallback auth context with empty/default values
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isCustomer: false,
      isRestaurantOwner: false,
      isDeliveryPerson: false,
      isAdmin: false,
      login: async () => { 
        console.error('Auth provider not available');
        throw new Error('Auth provider not available');
      },
      signup: async () => {
        console.error('Auth provider not available');
        throw new Error('Auth provider not available');
      },
      logout: async () => {
        console.error('Auth provider not available');
      },
      checkAuthStatus: async () => {
        console.error('Auth provider not available');
      },
      updateUserProfile: () => {
        console.error('Auth provider not available');
      }
    };
  }
  
  return context;
}