import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { useAuth } from '@/hooks/useAuth';
import GoogleMap from '@/components/GoogleMap';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { Package, Clock, MapPin, Phone, User, Home } from 'lucide-react';

const orderStatuses = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-500' },
  accepted: { label: 'تم قبول الطلب', color: 'bg-blue-500' },
  preparing: { label: 'جاري التحضير', color: 'bg-blue-300' },
  ready_for_pickup: { label: 'جاهز للاستلام', color: 'bg-purple-500' },
  on_delivery: { label: 'قيد التوصيل', color: 'bg-indigo-500' },
  delivered: { label: 'تم التوصيل', color: 'bg-green-500' },
  cancelled: { label: 'ملغى', color: 'bg-red-500' },
};

export default function TrackOrderPage() {
  const [, params] = useRoute<{ id: string }>('/track-order/:id');
  const orderId = params?.id ? parseInt(params.id) : undefined;
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    order,
    isLoading,
    isError,
    webSocketConnected,
    locationHistory,
  } = useOrderTracking({
    orderId,
    includeHistory: true,
  });
  
  const [eta, setEta] = useState<string | null>(null);
  
  useEffect(() => {
    if (isError) {
      toast({
        variant: 'destructive',
        title: 'خطأ في تحميل الطلب',
        description: 'حدث خطأ أثناء تحميل تفاصيل الطلب. يرجى المحاولة مرة أخرى.',
      });
    }
  }, [isError, toast]);
  
  // Calculate estimated time of arrival based on order status
  useEffect(() => {
    if (!order) return;
    
    const calculateETA = () => {
      const now = new Date();
      let estimatedMinutes = 0;
      
      switch (order.status) {
        case 'pending':
          estimatedMinutes = 45;
          break;
        case 'accepted':
          estimatedMinutes = 35;
          break;
        case 'preparing':
          estimatedMinutes = 25;
          break;
        case 'ready_for_pickup':
          estimatedMinutes = 15;
          break;
        case 'on_delivery':
          estimatedMinutes = 10;
          break;
        case 'delivered':
          return 'تم التوصيل';
        case 'cancelled':
          return 'تم إلغاء الطلب';
      }
      
      const etaTime = new Date(now.getTime() + estimatedMinutes * 60000);
      const hours = etaTime.getHours();
      const minutes = etaTime.getMinutes();
      
      return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    };
    
    setEta(calculateETA());
  }, [order]);
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto my-12 max-w-2xl px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold">لم يتم العثور على الطلب</h1>
        <p className="mb-6 text-gray-600">
          عذراً، لم نتمكن من العثور على الطلب المطلوب. يرجى التحقق من رقم الطلب والمحاولة مرة أخرى.
        </p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto my-8 max-w-4xl px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تتبع الطلب #{order.id}</h1>
          <p className="text-gray-600">تم الطلب: {formatDateTime(order.createdAt)}</p>
        </div>
        <Badge
          className={`${orderStatuses[order.status as keyof typeof orderStatuses]?.color} px-3 py-1 text-lg text-white`}
        >
          {orderStatuses[order.status as keyof typeof orderStatuses]?.label}
        </Badge>
      </div>
      
      {/* Order Status Timeline */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-max items-center">
          {Object.entries(orderStatuses).map(([status, { label, color }], index, array) => {
            const currentStatusIndex = Object.keys(orderStatuses).indexOf(order.status);
            const thisStatusIndex = Object.keys(orderStatuses).indexOf(status);
            const isActive = thisStatusIndex <= currentStatusIndex;
            const isLast = index === array.length - 1;
            
            // Skip "cancelled" status if the order isn't cancelled
            if (status === 'cancelled' && order.status !== 'cancelled') {
              return null;
            }
            
            return (
              <div key={status} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isActive ? color : 'bg-gray-200'
                    }`}
                  >
                    {status === 'pending' && <Package className="h-5 w-5 text-white" />}
                    {status === 'accepted' && <Package className="h-5 w-5 text-white" />}
                    {status === 'preparing' && <Package className="h-5 w-5 text-white" />}
                    {status === 'ready_for_pickup' && <Package className="h-5 w-5 text-white" />}
                    {status === 'on_delivery' && <Package className="h-5 w-5 text-white" />}
                    {status === 'delivered' && <Package className="h-5 w-5 text-white" />}
                    {status === 'cancelled' && <Package className="h-5 w-5 text-white" />}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`h-1 w-16 ${
                      isActive && 
                      thisStatusIndex < currentStatusIndex 
                        ? color 
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mb-8 grid gap-6 md:grid-cols-6">
        {/* Map Section */}
        <div className="md:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">تتبع الموقع</h2>
            <div className="flex items-center gap-2">
              <span
                className={`block h-3 w-3 rounded-full ${
                  webSocketConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></span>
              <span className="text-sm text-gray-600">
                {webSocketConnected ? 'متصل' : 'غير متصل'}
              </span>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg border">
            <GoogleMap
              height="400px"
              restaurantLocation={order.restaurant?.location}
              deliveryLocation={order.deliveryAddress}
              driverLocation={order.driverLocation}
              showRoute={true}
              zoom={13}
            />
          </div>
          
          {order.status === 'on_delivery' && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">الوصول المتوقع:</span>
                </div>
                <span className="text-lg font-bold">{eta}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Order Details */}
        <div className="md:col-span-2">
          <div className="rounded-lg border p-4">
            <h2 className="mb-4 border-b pb-2 text-lg font-semibold">تفاصيل الطلب</h2>
            
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-500">المطعم</h3>
              <div className="flex items-center gap-2">
                <span className="font-medium">{order.restaurant?.name}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-500">عنوان التوصيل</h3>
              <div className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>{order.deliveryAddress?.address || 'عنوان غير محدد'}</span>
              </div>
            </div>
            
            {order.status === 'on_delivery' && order.deliveryPerson && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-gray-500">معلومات المندوب</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{order.deliveryPerson.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span dir="ltr">{order.deliveryPerson.phone}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-500">ملخص الطلب</h3>
              <ul className="mb-2 space-y-1">
                {order.items?.map((item: any) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.menuItem?.name || 'غير معروف'}
                    </span>
                    <span className="font-medium">{item.totalPrice} ل.س</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span>المجموع</span>
                  <span>{order.totalAmount} ل.س</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}