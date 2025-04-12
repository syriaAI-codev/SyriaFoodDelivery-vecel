import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { user, isLoading } = useAuth();

  // Check if the user is an admin
  if (!isLoading && (!user || user.role !== 'admin')) {
    return <Redirect to="/unauthorized" />;
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar - fixed width on desktop, hidden on mobile */}
      <div className="hidden w-64 md:block">
        <AdminSidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="container p-6">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;