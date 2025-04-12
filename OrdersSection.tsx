import { useState, useEffect } from 'react';
import { Clock, User, MapPin, ChevronDown, ChevronUp, Search, Filter, AlertCircle, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { Order } from '@shared/schema';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Define order status color mapping
const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  accepted: { bg: 'bg-blue-100', text: 'text-blue-800' },
  preparing: { bg: 'bg-purple-100', text: 'text-purple-800' },
  ready_for_pickup: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  on_delivery: { bg: 'bg-orange-100', text: 'text-orange-800' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
};

// Define status translations
const statusTranslations: Record<string, string> = {
  pending: 'في الانتظار',
  accepted: 'تم القبول',
  preparing: 'قيد التحضير',
  ready_for_pickup: 'جاهز للتسليم',
  on_delivery: 'قيد التوصيل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

// Define next status options
const nextStatusOptions: Record<string, string[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['on_delivery', 'cancelled'],
  on_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

// صوت الإشعار للطلبات الجديدة
const NEW_ORDER_SOUND = '/sounds/new-order.mp3';

export default function OrdersSection() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [notificationAudio, setNotificationAudio] = useState<HTMLAudioElement | null>(null);
  
  // Use the order tracking hook to get real-time order updates
  const { 
    orders, 
    isLoading, 
    isError, 
    webSocketConnected 
  } = useOrderTracking();
  
  // إعداد عنصر الصوت عند تحميل المكون
  useEffect(() => {
    const audio = new Audio(NEW_ORDER_SOUND);
    audio.preload = 'auto';
    setNotificationAudio(audio);
    
    // تخزين إعداد الصوت في التخزين المحلي
    const savedSoundSetting = localStorage.getItem('orderSoundEnabled');
    if (savedSoundSetting !== null) {
      setSoundEnabled(savedSoundSetting === 'true');
    }
    
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);
  
  // حفظ إعداد الصوت عند تغييره
  useEffect(() => {
    localStorage.setItem('orderSoundEnabled', soundEnabled.toString());
  }, [soundEnabled]);
  
  // التحقق من وجود طلبات جديدة وتشغيل الصوت
  useEffect(() => {
    if (!orders || !notificationAudio) return;
    
    const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
    
    // إذا كان هناك طلبات جديدة وتم تمكين الصوت
    if (pendingOrdersCount > lastOrderCount && soundEnabled) {
      try {
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(err => {
          console.error('فشل في تشغيل صوت الإشعار:', err);
        });
        
        // عرض إشعار
        toast({
          title: 'طلب جديد!',
          description: 'لديك طلب جديد في انتظار الموافقة',
          variant: 'default',
        });
      } catch (error) {
        console.error('خطأ في تشغيل صوت الإشعار:', error);
      }
    }
    
    setLastOrderCount(pendingOrdersCount);
  }, [orders, lastOrderCount, soundEnabled, notificationAudio, toast]);
  
  // Update order status
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في تحديث حالة الطلب');
      }
      
      toast({
        title: 'تم تحديث حالة الطلب',
        description: `تم تغيير حالة الطلب إلى ${statusTranslations[newStatus]}`,
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تحديث حالة الطلب',
        variant: 'destructive',
      });
    }
  };
  
  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  // تبديل حالة تمكين الصوت
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // اختبار صوت الإشعار
  const testNotificationSound = () => {
    if (notificationAudio && soundEnabled) {
      notificationAudio.currentTime = 0;
      notificationAudio.play().catch(err => {
        console.error('فشل في تشغيل صوت الإشعار:', err);
        toast({
          title: 'تنبيه',
          description: 'فشل في تشغيل صوت الإشعار. يرجى التأكد من السماح بتشغيل الصوت في المتصفح.',
          variant: 'destructive',
        });
      });
    }
  };
  
  // Filter orders based on search query, status filter, and active tab
  const filterOrders = (order: Order) => {
    // Filter by tab
    if (activeTab === 'pending' && order.status !== 'pending') return false;
    if (activeTab === 'processing' && !['accepted', 'preparing', 'ready_for_pickup'].includes(order.status)) return false;
    if (activeTab === 'completed' && !['delivered', 'cancelled'].includes(order.status)) return false;
    
    // Filter by status if selected
    if (statusFilter && order.status !== statusFilter) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesId = order.id.toString().includes(query);
      const matchesCustomer = order.customerName?.toLowerCase().includes(query) || false;
      const matchesPhone = order.customerPhone?.toLowerCase().includes(query) || false;
      
      return matchesId || matchesCustomer || matchesPhone;
    }
    
    return true;
  };
  
  // Group orders by date
  const groupOrdersByDate = (orders: Order[]) => {
    const groups: Record<string, Order[]> = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt || Date.now()).toLocaleDateString('ar-SY');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
    });
    
    return groups;
  };
  
  // Sort orders by date (newest first)
  const sortedOrders = [...(orders || [])].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  
  const filteredOrders = sortedOrders.filter(filterOrders);
  const groupedOrders = groupOrdersByDate(filteredOrders);
  
  // Count orders by status
  const pendingCount = (orders || []).filter(order => order.status === 'pending').length;
  const processingCount = (orders || []).filter(order => ['accepted', 'preparing', 'ready_for_pickup'].includes(order.status)).length;
  
  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">الطلبات</CardTitle>
            <CardDescription className="mt-1">إدارة وتتبع طلبات العملاء</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!webSocketConnected && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                وضع غير متصل
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              <span>تحديث</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* إعدادات الإشعارات الصوتية */}
        <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center gap-2">
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-primary" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <h3 className="text-sm font-medium">إشعارات صوتية للطلبات الجديدة</h3>
              <p className="text-xs text-gray-500">
                {soundEnabled 
                  ? 'سيتم تشغيل صوت تنبيه عند وصول طلبات جديدة' 
                  : 'الإشعارات الصوتية معطلة حاليًا'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testNotificationSound}
              disabled={!soundEnabled}
            >
              اختبار
            </Button>
            <div className="flex items-center gap-2">
              <Switch 
                id="sound-toggle" 
                checked={soundEnabled} 
                onCheckedChange={toggleSound} 
              />
              <Label htmlFor="sound-toggle">
                {soundEnabled ? 'مفعل' : 'معطل'}
              </Label>
            </div>
          </div>
        </div>
        
        {/* Tabs for order status filtering */}
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              الكل
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              في الانتظار
              {pendingCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 p-0 text-[10px] text-white">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processing" className="relative">
              قيد التنفيذ
              {processingCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-500 p-0 text-[10px] text-white">
                  {processingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              مكتملة
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <form onSubmit={handleSearch} className="flex flex-1 overflow-hidden rounded-lg border border-gray-300 bg-white">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث برقم الطلب أو اسم العميل..."
                className="flex-grow border-none px-4 py-2 outline-none"
              />
              <button
                type="submit"
                className="bg-primary px-4 py-2 text-white"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
            
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">جميع الحالات</option>
              {Object.entries(statusTranslations).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Orders List */}
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <AlertCircle className="mb-2 h-10 w-10 text-red-500" />
            <h3 className="mb-2 text-lg font-medium">حدث خطأ</h3>
            <p className="text-sm text-gray-500">
              تعذر تحميل الطلبات. يرجى المحاولة مرة أخرى لاحقًا.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <AlertCircle className="mb-2 h-10 w-10 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">لا توجد طلبات</h3>
            <p className="text-sm text-gray-500">
              {statusFilter
                ? `لا توجد طلبات بحالة ${statusTranslations[statusFilter]}`
                : searchQuery
                ? 'لا توجد نتائج مطابقة لبحثك'
                : 'لم يتم العثور على أي طلبات، ستظهر الطلبات هنا عندما يقوم العملاء بالطلب من مطعمك'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedOrders).map(([date, dateOrders]) => (
              <div key={date} className="space-y-4">
                <div className="sticky top-0 z-10 bg-background py-2">
                  <h3 className="text-sm font-medium text-gray-500">{date}</h3>
                </div>
                
                <div className="space-y-4">
                  {dateOrders.map((order) => (
                    <div key={order.id} className="overflow-hidden rounded-lg border">
                      {/* Order Header */}
                      <div
                        onClick={() => toggleOrderExpansion(order.id)}
                        className={`flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50 ${
                          order.status === 'pending' ? 'bg-yellow-50' : 'bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`rounded-full p-2 ${
                            order.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">طلب #{order.id}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                  statusColors[order.status]?.bg
                                } ${statusColors[order.status]?.text}`}
                              >
                                {statusTranslations[order.status]}
                              </span>
                              {order.status === 'pending' && (
                                <span className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                                  جديد
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              {new Date(order.createdAt || Date.now()).toLocaleTimeString('ar-SY')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{order.total} ل.س</div>
                            <div className="text-sm text-gray-500">{order.itemCount || 0} عناصر</div>
                          </div>
                          {expandedOrderId === order.id ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
