import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSection from '@/components/restaurant/ProfileSection';
import MenuSection from '@/components/restaurant/MenuSection';
import OrdersSection from '@/components/restaurant/OrdersSection';
import { useAuth } from '@/hooks/useAuth';

export default function RestaurantDashboardPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">لوحة تحكم المطعم</h1>
        <p className="mt-2 text-gray-600">مرحباً {user.name}، يمكنك إدارة مطعمك من هنا</p>
      </div>
      
      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-8 grid w-full grid-cols-3 rounded-md bg-muted">
          <TabsTrigger value="profile" className="rounded-sm py-3">
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="menu" className="rounded-sm py-3">
            قائمة الطعام
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-sm py-3">
            الطلبات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="pt-4">
          <ProfileSection />
        </TabsContent>
        
        <TabsContent value="menu" className="pt-4">
          <MenuSection />
        </TabsContent>
        
        <TabsContent value="orders" className="pt-4">
          <OrdersSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}