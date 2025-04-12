import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Users, Store, ShoppingBag, Package, TrendingUp, 
  Search, UserCheck, UserX, Edit, X, Check, 
  MapPin, Clock, AlertCircle 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, 
  DialogTrigger, DialogClose 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";

// Types
type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'restaurant' | 'delivery' | 'admin';
  isActive: boolean;
};

type Restaurant = {
  id: number;
  name: string;
  description: string;
  phone: string;
  locationAddress: string;
  ownerId: number;
  ownerName: string;
};

type Order = {
  id: number;
  status: string;
  totalPrice: number;
  createdAt: string;
  customerName: string;
  restaurantName: string;
  deliveryAddress: string;
};

type DeliveryPerson = {
  userId: number;
  name: string;
  phone: string;
  isAvailable: boolean;
  currentOrders: number;
};

// Main Component
const AdminDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  
  // Set the active tab based on the current route
  useEffect(() => {
    if (location === '/admin/dashboard') {
      setActiveTab('overview');
    } else if (location === '/admin/users') {
      setActiveTab('users');
    } else if (location === '/admin/restaurants') {
      setActiveTab('restaurants');
    } else if (location === '/admin/orders') {
      setActiveTab('orders');
    } else if (location === '/admin/delivery') {
      setActiveTab('delivery');
    }
  }, [location]);

  // Queries
  const { data: overviewData } = useQuery({
    queryKey: ['/api/admin/overview'],
    queryFn: () => apiRequest<any>('/api/admin/overview'),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users', searchTerm],
    queryFn: () => apiRequest<User[]>(`/api/admin/users${searchTerm ? `?search=${searchTerm}` : ''}`),
    enabled: activeTab === 'users',
  });

  const { data: restaurantsData, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['/api/admin/restaurants', searchTerm],
    queryFn: () => apiRequest<Restaurant[]>(`/api/admin/restaurants${searchTerm ? `?search=${searchTerm}` : ''}`),
    enabled: activeTab === 'restaurants',
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/admin/orders', searchTerm],
    queryFn: () => apiRequest<Order[]>(`/api/admin/orders${searchTerm ? `?search=${searchTerm}` : ''}`),
    enabled: activeTab === 'orders',
  });

  const { data: deliveryData, isLoading: deliveryLoading } = useQuery({
    queryKey: ['/api/admin/delivery-persons', searchTerm],
    queryFn: () => apiRequest<DeliveryPerson[]>(`/api/admin/delivery-persons${searchTerm ? `?search=${searchTerm}` : ''}`),
    enabled: activeTab === 'delivery',
  });
  
  // Analytics Queries
  const { data: ordersByDayData } = useQuery({
    queryKey: ['/api/admin/analytics/orders-by-day'],
    queryFn: () => apiRequest<{date: string; count: number}[]>('/api/admin/analytics/orders-by-day'),
    enabled: activeTab === 'overview',
  });
  
  const { data: revenueByDayData } = useQuery({
    queryKey: ['/api/admin/analytics/revenue-by-day'],
    queryFn: () => apiRequest<{date: string; total: number}[]>('/api/admin/analytics/revenue-by-day'),
    enabled: activeTab === 'overview',
  });

  // Mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      apiRequest(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "تم تحديث الدور بنجاح",
        description: "تم تغيير دور المستخدم بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحديث دور المستخدم. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const toggleUserActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      apiRequest(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "تم تحديث حالة المستخدم",
        description: "تم تحديث حالة نشاط المستخدم بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحديث حالة المستخدم. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      apiRequest(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "تم تحديث حالة الطلب",
        description: "تم تحديث حالة الطلب بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تحديث حالة الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const assignDeliveryMutation = useMutation({
    mutationFn: ({ orderId, deliveryPersonId }: { orderId: number; deliveryPersonId: number }) =>
      apiRequest(`/api/admin/orders/${orderId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ deliveryPersonId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/delivery-persons'] });
      toast({
        title: "تم تعيين التوصيل",
        description: "تم تعيين عامل التوصيل للطلب بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تعيين عامل التوصيل. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchTerm('');
  };

  const handleUpdateUserRole = (userId: number, role: string) => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  const handleToggleUserActive = (userId: number, isActive: boolean) => {
    toggleUserActiveMutation.mutate({ userId, isActive: !isActive });
  };

  const handleUpdateOrderStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const handleAssignDelivery = (orderId: number, deliveryPersonId: number) => {
    assignDeliveryMutation.mutate({ orderId, deliveryPersonId });
  };

  // Helper functions for rendering
  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { color: string; bgColor: string }> = {
      pending: { color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
      accepted: { color: 'text-blue-800', bgColor: 'bg-blue-100' },
      preparing: { color: 'text-purple-800', bgColor: 'bg-purple-100' },
      ready_for_pickup: { color: 'text-indigo-800', bgColor: 'bg-indigo-100' },
      on_delivery: { color: 'text-orange-800', bgColor: 'bg-orange-100' },
      delivered: { color: 'text-green-800', bgColor: 'bg-green-100' },
      cancelled: { color: 'text-red-800', bgColor: 'bg-red-100' },
    };

    const style = statusStyles[status] || { color: 'text-gray-800', bgColor: 'bg-gray-100' };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.color} ${style.bgColor}`}>
        {status === 'pending' && 'قيد الانتظار'}
        {status === 'accepted' && 'مقبول'}
        {status === 'preparing' && 'قيد التحضير'}
        {status === 'ready_for_pickup' && 'جاهز للاستلام'}
        {status === 'on_delivery' && 'قيد التوصيل'}
        {status === 'delivered' && 'تم التوصيل'}
        {status === 'cancelled' && 'ملغي'}
      </span>
    );
  };

  const getDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Renderers for different tabs
  const renderOverview = () => {
    const stats = overviewData?.data || {
      totalOrders: 0,
      revenueToday: 0,
      revenueWeek: 0,
      activeRestaurants: 0,
      availableDelivery: 0,
      ordersByStatus: []
    };

    // Colors for order status pie chart
    const COLORS = ['#FFBB28', '#0088FE', '#8884D8', '#6E44FF', '#FF8042', '#00C49F', '#FF0000'];

    // Format dates for Arabic display
    const formatDay = (date: string) => {
      const d = new Date(date);
      return new Intl.DateTimeFormat('ar-SY', { weekday: 'short', day: 'numeric' }).format(d);
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                طلب
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الإيرادات اليوم</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.revenueToday.toLocaleString('ar-SY')} ل.س</div>
              <p className="text-xs text-muted-foreground">
                +2.1% من الأمس
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المطاعم النشطة</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRestaurants}</div>
              <p className="text-xs text-muted-foreground">
                مطعم
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عمال التوصيل المتاحين</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableDelivery}</div>
              <p className="text-xs text-muted-foreground">
                عامل توصيل
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Orders by Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">توزيع الطلبات حسب الحالة</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ status }) => {
                      if (status === 'pending') return 'قيد الانتظار';
                      if (status === 'accepted') return 'مقبول';
                      if (status === 'preparing') return 'قيد التحضير';
                      if (status === 'ready_for_pickup') return 'جاهز للاستلام';
                      if (status === 'on_delivery') return 'قيد التوصيل';
                      if (status === 'delivered') return 'تم التوصيل';
                      if (status === 'cancelled') return 'ملغي';
                      return status;
                    }}
                  >
                    {stats.ordersByStatus?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => {
                      let label = name;
                      if (name === 'pending') label = 'قيد الانتظار';
                      if (name === 'accepted') label = 'مقبول';
                      if (name === 'preparing') label = 'قيد التحضير';
                      if (name === 'ready_for_pickup') label = 'جاهز للاستلام';
                      if (name === 'on_delivery') label = 'قيد التوصيل';
                      if (name === 'delivered') label = 'تم التوصيل';
                      if (name === 'cancelled') label = 'ملغي';
                      return [value, label];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Orders Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">الطلبات خلال آخر 7 أيام</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ordersByDayData?.data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'var(--foreground)' }}
                    tickFormatter={formatDay}
                    tickMargin={10}
                  />
                  <YAxis tick={{ fill: 'var(--foreground)' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    formatter={(value) => [`${value} طلب`, 'الطلبات']}
                    labelFormatter={(label) => formatDay(label)}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="count" name="عدد الطلبات" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Revenue Line Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-md">الإيرادات خلال آخر 7 أيام</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueByDayData?.data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'var(--foreground)' }}
                    tickFormatter={formatDay}
                    tickMargin={10}
                  />
                  <YAxis 
                    tick={{ fill: 'var(--foreground)' }} 
                    tickFormatter={(value) => `${value.toLocaleString('ar-SY')}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    formatter={(value: number) => [`${value.toLocaleString('ar-SY')} ل.س`, 'الإيرادات']}
                    labelFormatter={(label) => formatDay(label)}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="total" name="الإيرادات" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="البحث عن مستخدم..."
            className="pr-10 w-full md:w-1/2"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableCaption>قائمة المستخدمين في النظام</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">الرقم</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">جاري التحميل...</TableCell>
                </TableRow>
              ) : !usersData?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">لا توجد بيانات متاحة</TableCell>
                </TableRow>
              ) : (
                usersData.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell dir="ltr">{user.phone}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            {user.role === 'customer' && 'عميل'}
                            {user.role === 'restaurant' && 'مطعم'}
                            {user.role === 'delivery' && 'توصيل'}
                            {user.role === 'admin' && 'مدير'}
                            <Edit className="ml-2 h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تغيير دور المستخدم</DialogTitle>
                            <DialogDescription>
                              اختر الدور الجديد للمستخدم {user.name}
                            </DialogDescription>
                          </DialogHeader>
                          <Select
                            defaultValue={user.role}
                            onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="اختر دور" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">عميل</SelectItem>
                              <SelectItem value="restaurant">مطعم</SelectItem>
                              <SelectItem value="delivery">توصيل</SelectItem>
                              <SelectItem value="admin">مدير</SelectItem>
                            </SelectContent>
                          </Select>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">إلغاء</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleUserActive(user.id, user.isActive)}
                      />
                    </TableCell>
                    <TableCell className="text-left">
                      <Button
                        size="sm"
                        variant={user.isActive ? "destructive" : "default"}
                        onClick={() => handleToggleUserActive(user.id, user.isActive)}
                      >
                        {user.isActive ? <UserX className="ml-2 h-4 w-4" /> : <UserCheck className="ml-2 h-4 w-4" />}
                        {user.isActive ? "حظر" : "تفعيل"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderRestaurants = () => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="البحث عن مطعم..."
            className="pr-10 w-full md:w-1/2"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableCaption>قائمة المطاعم في النظام</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">الرقم</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>المالك</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurantsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">جاري التحميل...</TableCell>
                </TableRow>
              ) : !restaurantsData?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">لا توجد بيانات متاحة</TableCell>
                </TableRow>
              ) : (
                restaurantsData.data.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium">{restaurant.id}</TableCell>
                    <TableCell>{restaurant.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{restaurant.description}</TableCell>
                    <TableCell dir="ltr">{restaurant.phone}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{restaurant.locationAddress}</TableCell>
                    <TableCell>{restaurant.ownerName}</TableCell>
                    <TableCell className="text-left">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            عرض التفاصيل
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{restaurant.name}</DialogTitle>
                            <DialogDescription>
                              تفاصيل المطعم وقائمة الطعام
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h3 className="mb-2 font-medium">معلومات المطعم</h3>
                              <div className="rounded-lg border p-4 space-y-2">
                                <p><span className="font-medium">الوصف:</span> {restaurant.description}</p>
                                <p><span className="font-medium">الهاتف:</span> <span dir="ltr">{restaurant.phone}</span></p>
                                <p><span className="font-medium">العنوان:</span> {restaurant.locationAddress}</p>
                                <p><span className="font-medium">المالك:</span> {restaurant.ownerName}</p>
                              </div>
                            </div>
                            <div>
                              <h3 className="mb-2 font-medium">قائمة الطعام</h3>
                              <div className="rounded-lg border p-4 h-[250px] overflow-y-auto">
                                {/* Menu items would be loaded here from API */}
                                <p className="text-center text-muted-foreground">اضغط على "تحميل القائمة" لعرض قائمة الطعام</p>
                                <div className="mt-4 flex justify-center">
                                  <Button size="sm">تحميل القائمة</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">غلق</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="البحث عن طلب..."
            className="pr-10 w-full md:w-1/2"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableCaption>قائمة الطلبات في النظام</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">الرقم</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>المطعم</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">جاري التحميل...</TableCell>
                </TableRow>
              ) : !ordersData?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">لا توجد بيانات متاحة</TableCell>
                </TableRow>
              ) : (
                ordersData.data.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.restaurantName}</TableCell>
                    <TableCell>{order.totalPrice.toLocaleString('ar-SY')} ل.س</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getDate(order.createdAt)}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex space-x-2 space-x-reverse">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit className="ml-2 h-4 w-4" />
                              تغيير الحالة
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>تغيير حالة الطلب</DialogTitle>
                              <DialogDescription>
                                اختر الحالة الجديدة للطلب رقم {order.id}
                              </DialogDescription>
                            </DialogHeader>
                            <Select
                              defaultValue={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر الحالة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                <SelectItem value="accepted">مقبول</SelectItem>
                                <SelectItem value="preparing">قيد التحضير</SelectItem>
                                <SelectItem value="ready_for_pickup">جاهز للاستلام</SelectItem>
                                <SelectItem value="on_delivery">قيد التوصيل</SelectItem>
                                <SelectItem value="delivered">تم التوصيل</SelectItem>
                                <SelectItem value="cancelled">ملغي</SelectItem>
                              </SelectContent>
                            </Select>
                            <DialogFooter className="flex space-x-2 space-x-reverse">
                              <DialogClose asChild>
                                <Button variant="outline">إلغاء</Button>
                              </DialogClose>
                              <Button
                                onClick={() => {
                                  // Status already selected in the select component
                                  document.getElementById('closeDialog')?.click();
                                }}
                              >
                                حفظ
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Package className="ml-2 h-4 w-4" />
                              تعيين توصيل
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>تعيين عامل توصيل</DialogTitle>
                              <DialogDescription>
                                اختر عامل التوصيل للطلب رقم {order.id}
                              </DialogDescription>
                            </DialogHeader>
                            {deliveryData?.data && (
                              <Select
                                onValueChange={(value) => handleAssignDelivery(order.id, parseInt(value))}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="اختر عامل توصيل" />
                                </SelectTrigger>
                                <SelectContent>
                                  {deliveryData.data
                                    .filter(d => d.isAvailable)
                                    .map(delivery => (
                                      <SelectItem key={delivery.userId} value={delivery.userId.toString()}>
                                        {delivery.name} ({delivery.currentOrders} طلب نشط)
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">إلغاء</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MapPin className="ml-2 h-4 w-4" />
                              العنوان
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>عنوان التوصيل</DialogTitle>
                              <DialogDescription>
                                عنوان التوصيل للطلب رقم {order.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="p-4 border rounded-md">
                              {order.deliveryAddress}
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">إغلاق</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderDelivery = () => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="البحث عن عامل توصيل..."
            className="pr-10 w-full md:w-1/2"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableCaption>قائمة عمال التوصيل في النظام</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">الرقم</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الطلبات النشطة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">جاري التحميل...</TableCell>
                </TableRow>
              ) : !deliveryData?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">لا توجد بيانات متاحة</TableCell>
                </TableRow>
              ) : (
                deliveryData.data.map((delivery) => (
                  <TableRow key={delivery.userId}>
                    <TableCell className="font-medium">{delivery.userId}</TableCell>
                    <TableCell>{delivery.name}</TableCell>
                    <TableCell dir="ltr">{delivery.phone}</TableCell>
                    <TableCell>
                      <Badge variant={delivery.isAvailable ? "success" : "destructive"}>
                        {delivery.isAvailable ? 'متاح' : 'غير متاح'}
                      </Badge>
                    </TableCell>
                    <TableCell>{delivery.currentOrders}</TableCell>
                    <TableCell className="text-left">
                      <Button size="sm" variant="outline">
                        <Clock className="ml-2 h-4 w-4" />
                        تفاصيل التوصيلات
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  // Get the title based on the current active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'لوحة تحكم المدير';
      case 'users':
        return 'إدارة المستخدمين';
      case 'restaurants':
        return 'إدارة المطاعم';
      case 'orders':
        return 'إدارة الطلبات';
      case 'delivery':
        return 'إدارة التوصيل';
      default:
        return 'لوحة تحكم المدير';
    }
  };

  return (
    <AdminLayout title={getPageTitle()}>
      <div className="flex flex-col space-y-4">
        <div>
          <p className="text-muted-foreground">
            مرحباً! يمكنك إدارة جميع جوانب التطبيق من هنا.
          </p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <Button>
            <AlertCircle className="ml-2 h-4 w-4" />
            تقارير النظام
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center justify-center">
              <TrendingUp className="ml-2 h-4 w-4" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center justify-center">
              <Users className="ml-2 h-4 w-4" />
              <span>المستخدمين</span>
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center justify-center">
              <Store className="ml-2 h-4 w-4" />
              <span>المطاعم</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center justify-center">
              <ShoppingBag className="ml-2 h-4 w-4" />
              <span>الطلبات</span>
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center justify-center">
              <Package className="ml-2 h-4 w-4" />
              <span>التوصيل</span>
            </TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="overview">
              {renderOverview()}
            </TabsContent>
            <TabsContent value="users">
              {renderUsers()}
            </TabsContent>
            <TabsContent value="restaurants">
              {renderRestaurants()}
            </TabsContent>
            <TabsContent value="orders">
              {renderOrders()}
            </TabsContent>
            <TabsContent value="delivery">
              {renderDelivery()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;