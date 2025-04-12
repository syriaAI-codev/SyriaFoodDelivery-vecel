import { createContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../lib/queryClient';
import { User, InsertUser } from '@shared/schema';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCustomer: boolean;
  isRestaurantOwner: boolean;
  isDeliveryPerson: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Omit<InsertUser, "password"> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateUserProfile: (updatedUser: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Role checks
  const isCustomer = isAuthenticated && user?.role === 'customer';
  const isRestaurantOwner = isAuthenticated && user?.role === 'restaurant';
  const isDeliveryPerson = isAuthenticated && user?.role === 'delivery';
  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Function to get user data from our API based on Supabase user
  const fetchUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Use the user's email to find our internal user data
      const response = await fetch(`/api/users/by-email/${supabaseUser.email}`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching user data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Check auth status on mount and set up listener for auth changes
  useEffect(() => {
    setIsLoading(true);
    
    // Get initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData = await fetchUserData(session.user);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await fetchUserData(session.user);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData = await fetchUserData(session.user);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw new Error(error.message || 'فشل تسجيل الدخول');
      }
      
      if (data?.user) {
        // Get user data from our API
        const userData = await fetchUserData(data.user);
        
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: `مرحباً بك ${userData.name}`,
          });
        } else {
          throw new Error('لم يتم العثور على بيانات المستخدم');
        }
      } else {
        throw new Error('فشل تسجيل الدخول');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error instanceof Error ? error.message : "فشل تسجيل الدخول، يرجى التحقق من بياناتك",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Omit<InsertUser, "password"> & { password: string }) => {
    try {
      setIsLoading(true);
      
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone
          }
        }
      });
      
      if (error) {
        throw new Error(error.message || 'فشل إنشاء الحساب');
      }
      
      if (data?.user) {
        // Create user in our database
        const response = await apiRequest('POST', '/api/auth/register', userData);
        const responseData = await response.json();
        
        if (responseData.success && responseData.data) {
          setUser(responseData.data);
          setIsAuthenticated(true);
          toast({
            title: "تم إنشاء الحساب بنجاح",
            description: "تم تسجيل الدخول تلقائياً",
          });
        } else {
          // If our API fails, clean up the Supabase user
          await supabase.auth.signOut();
          throw new Error(responseData.error || 'فشل تسجيل البيانات في قاعدة البيانات');
        }
      } else {
        throw new Error('فشل إنشاء الحساب');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error instanceof Error ? error.message : "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message || 'فشل تسجيل الخروج');
      }
      
      setUser(null);
      setIsAuthenticated(false);
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isCustomer,
        isRestaurantOwner,
        isDeliveryPerson,
        isAdmin,
        login,
        signup,
        logout,
        checkAuthStatus,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
