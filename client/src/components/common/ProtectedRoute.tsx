import { ReactNode } from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('customer' | 'restaurant' | 'delivery' | 'admin')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // If roles are specified, check if the user has one of the allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role as any)) {
      return <Redirect to="/unauthorized" />;
    }
  }

  // If authenticated (and has the right role if specified), render the children
  return <>{children}</>;
};

export default ProtectedRoute;