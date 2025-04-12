import { useLocation, Link } from 'wouter';
import { 
  Home, 
  Users, 
  Utensils, 
  ShoppingBag, 
  Truck, 
  BarChart, 
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const AdminSidebar = () => {
  const [location] = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      title: 'لوحة التحكم',
      icon: <Home className="h-5 w-5" />,
      path: '/admin/dashboard',
    },
    {
      title: 'المستخدمين',
      icon: <Users className="h-5 w-5" />,
      path: '/admin/users',
    },
    {
      title: 'المطاعم',
      icon: <Utensils className="h-5 w-5" />,
      path: '/admin/restaurants',
    },
    {
      title: 'الطلبات',
      icon: <ShoppingBag className="h-5 w-5" />,
      path: '/admin/orders',
    },
    {
      title: 'موظفي التوصيل',
      icon: <Truck className="h-5 w-5" />,
      path: '/admin/delivery',
    },
    {
      title: 'التقارير',
      icon: <BarChart className="h-5 w-5" />,
      path: '/admin/reports',
    },
    {
      title: 'الإعدادات',
      icon: <Settings className="h-5 w-5" />,
      path: '/admin/settings',
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto border-l bg-white p-4">
      <div className="mb-8 flex items-center justify-center py-2">
        <h2 className="text-xl font-bold text-primary">لوحة تحكم المسؤول</h2>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path} 
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              location === item.path 
                ? "bg-primary/10 text-primary" 
                : "text-gray-700 hover:bg-gray-100/60"
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t pt-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;