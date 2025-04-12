import { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Order } from '@shared/schema';

interface OrderTrackerProps {
  orderId: number;
  showMap?: boolean;
}

export default function OrderTracker({ orderId, showMap = true }: OrderTrackerProps) {
  const { toast } = useToast();
  const { connected, sendMessage } = useWebSocket();
  const { order, isLoading, isError, locationHistory, webSocketConnected } = useOrderTracking({
    orderId,
    includeHistory: true,
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [path, setPath] = useState<google.maps.Polyline | null>(null);

  // Subscribe to order updates via WebSocket
  useEffect(() => {
    if (connected) {
      sendMessage({
        type: 'subscribe',
        orderId,
      });
      
      console.log(`Subscribed to order #${orderId} updates`);
    }
  }, [connected, orderId, sendMessage]);

  // Initialize Google Maps if showMap is true
  useEffect(() => {
    if (!showMap || !order || !order.driverLocation) return;

    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [showMap, order]);

  // Initialize map when Google Maps is loaded and we have order data
  useEffect(() => {
    if (!mapLoaded || !showMap || !order || !order.driverLocation) return;

    const mapElement = document.getElementById('order-tracker-map');
    if (!mapElement) return;

    // Create map centered on driver location
    const newMap = new google.maps.Map(mapElement, {
      center: { lat: order.driverLocation.lat, lng: order.driverLocation.lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Create marker for driver location
    const newMarker = new google.maps.Marker({
      position: { lat: order.driverLocation.lat, lng: order.driverLocation.lng },
      map: newMap,
      icon: {
        url: '/assets/delivery-bike.png',
        scaledSize: new google.maps.Size(40, 40),
      },
      title: 'عامل التوصيل',
    });

    // Create path for driver's route
    const newPath = new google.maps.Polyline({
      path: locationHistory.map(loc => ({ lat: loc.lat, lng: loc.lng })),
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: newMap,
    });

    // Add restaurant marker
    if (order.restaurantLat && order.restaurantLng) {
      new google.maps.Marker({
        position: { lat: order.restaurantLat, lng: order.restaurantLng },
        map: newMap,
        icon: {
          url: '/assets/restaurant.png',
          scaledSize: new google.maps.Size(40, 40),
        },
        title: order.restaurantName || 'المطعم',
      });
    }

    // Add delivery address marker
    if (order.deliveryLat && order.deliveryLng) {
      new google.maps.Marker({
        position: { lat: order.deliveryLat, lng: order.deliveryLng },
        map: newMap,
        icon: {
          url: '/assets/home.png',
          scaledSize: new google.maps.Size(40, 40),
        },
        title: 'عنوان التوصيل',
      });
    }

    setMap(newMap);
    setMarker(newMarker);
    setPath(newPath);

    return () => {
      // Cleanup
      if (newPath) newPath.setMap(null);
      if (newMarker) newMarker.setMap(null);
    };
  }, [mapLoaded, showMap, order, locationHistory]);

  // Update driver marker position when location changes
  useEffect(() => {
    if (!marker || !order || !order.driverLocation) return;
    
    const newPosition = { lat: order.driverLocation.lat, lng: order.driverLocation.lng };
    marker.setPosition(newPosition);
    
    // Update path
    if (path && locationHistory.length > 0) {
      const pathCoordinates = locationHistory.map(loc => ({ lat: loc.lat, lng: loc.lng }));
      path.setPath(pathCoordinates);
    }
    
    // Center map on driver if needed
    if (map) {
      map.panTo(newPosition);
    }
  }, [order?.driverLocation, marker, map, path, locationHistory]);

  // Get status color and text
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; bgColor: string; text: string }> = {
      pending: { color: 'text-yellow-800', bgColor: 'bg-yellow-100', text: 'في الانتظار' },
      accepted: { color: 'text-blue-800', bgColor: 'bg-blue-100', text: 'تم القبول' },
      preparing: { color: 'text-purple-800', bgColor: 'bg-purple-100', text: 'قيد التحضير' },
      ready_for_pickup: { color: 'text-indigo-800', bgColor: 'bg-indigo-100', text: 'جاهز للتسليم' },
      on_delivery: { color: 'text-orange-800', bgColor: 'bg-orange-100', text: 'قيد التوصيل' },
      delivered: { color: 'text-green-800', bgColor: 'bg-green-100', text: 'تم التسليم' },
      cancelled: { color: 'text-red-800', bgColor: 'bg-red-100', text: 'ملغي' },
    };

    return statusMap[status] || { color: 'text-gray-800', bgColor: 'bg-gray-100', text: 'غير معروف' };
  };

  // Get estimated delivery time
  const getEstimatedDeliveryTime = () => {
    if (!order) return 'غير متوفر';
    
    if (order.status === 'delivered') {
      return 'تم التوصيل';
    }
    
    if (order.status === 'cancelled') {
      return 'ملغي';
    }
    
    if (order.estimatedDeliveryTime) {
      return new Date(order.estimatedDeliveryTime).toLocaleTimeString('ar-SY', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    return 'قيد التحديد';
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (isError || !order) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <AlertCircle className="mb-2 h-10 w-10 text-red-500" />
            <h3 className="mb-2 text-lg font-medium">تعذر تحميل معلومات الطلب</h3>
            <p className="text-sm text-gray-500">
              حدث خطأ أثناء تحميل معلومات الطلب. يرجى المحاولة مرة أخرى لاحقًا.
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
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">تتبع الطلب #{order.id}</CardTitle>
            <CardDescription className="mt-1">تابع حالة طلبك في الوقت الحقيقي</CardDescription>
          </div>
          {!webSocketConnected && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
              وضع غير متصل
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Order Status */}
        <div className="mb-6 rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span className="font-medium">حالة الطلب:</span>
            </div>
            <Badge className={`${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.text}
            </Badge>
          </div>
          
          <div className="relative mb-6">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gray-200"></div>
            <div className="relative flex justify-between">
              {['pending', 'accepted', 'preparing', 'ready_for_pickup', 'on_delivery', 'delivered'].map((status, index) => {
                const isCompleted = ['delivered', 'cancelled'].includes(order.status) 
                  ? status !== 'delivered' || order.status === 'delivered'
                  : ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'on_delivery'].indexOf(order.status) >= 
                    ['pending', 'accepted', 'preparing', 'ready_for_pickup', 'on_delivery'].indexOf(status);
                
                const isCurrent = order.status === status;
                
                return (
                  <div key={status} className="flex flex-col items-center">
                    <div 
                      className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                        isCompleted 
                          ? 'bg-primary text-white' 
                          : isCurrent 
                            ? 'border-2 border-primary bg-white' 
                            : 'border border-gray-300 bg-white'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <span className={`mt-2 text-xs ${isCurrent ? 'font-bold text-primary' : 'text-gray-500'}`}>
                      {getStatusInfo(status).text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">وقت الطلب:</span>
              <span className="font-medium">
                {new Date(order.createdAt || Date.now()).toLocaleString('ar-SY')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">وقت التوصيل المتوقع:</span>
              <span className="font-medium">{getEstimatedDeliveryTime()}</span>
            </div>
            {order.deliveryPersonName && (
              <div className="flex justify-between">
                <span className="text-gray-500">عامل التوصيل:</span>
                <span className="font-medium">{order.deliveryPersonName}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Map */}
        {showMap && (
          <div className="mb-6 overflow-hidden rounded-lg border">
            <div 
              id="order-tracker-map" 
              className="h-64 w-full"
              style={{ height: '250px' }}
            ></div>
          </div>
        )}
        
        {/* Delivery Address */}
        <div className="mb-6 rounded-lg border p-4">
          <h3 className="mb-3 font-medium">عنوان التوصيل</h3>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            <span>{order.deliveryAddress || 'غير متوفر'}</span>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-medium">ملخص الطلب</h3>
          <div className="mb-4 space-y-2 divide-y">
            {(order.items || []).map((item, index) => (
              <div key={index} className="flex justify-between py-2">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500"> × {item.quantity}</span>
                </div>
                <span>{item.price * item.quantity} ل.س</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 border-t pt-2">
            <div className="flex justify-between">
              <span className="text-gray-500">المجموع الفرعي:</span>
              <span>{order.subtotal || order.total} ل.س</span>
            </div>
            {order.deliveryFee !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-500">رسوم التوصيل:</span>
                <span>
                  {order.deliveryFee === 0 ? 'مجاني' : `${order.deliveryFee} ل.س`}
                </span>
              </div>
            )}
            {order.discount !== undefined && order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">الخصم:</span>
                <span className="text-green-600">-{order.discount} ل.س</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>المجموع:</span>
              <span>{order.total} ل.س</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
