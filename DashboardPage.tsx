import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/context/WebSocketContext';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Clock, Navigation, Phone, User, CheckCircle, XCircle, AlertTriangle, Car, Timer } from 'lucide-react';
import { Link } from 'wouter';
import { withErrorHandling } from '@/utils/error-handler';

// Define delivery status color mapping
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

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { connected, sendMessage } = useWebSocket();
  const [isAvailable, setIsAvailable] = useState(false);
  const [selectedTab, setSelectedTab] = useState('assigned');
  const [watchPosition, setWatchPosition] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markers, setMarkers] = useState<Record<string, google.maps.Marker>>({});
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [distanceMatrix, setDistanceMatrix] = useState<google.maps.DistanceMatrixService | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    destination: string;
  } | null>(null);
  const [sortOption, setSortOption] = useState<'distance' | 'time'>('distance');

  // Fetch delivery person info
  const { data: deliveryPersonData, isLoading } = useQuery({
    queryKey: ['/api/delivery/profile'],
    enabled: !!user?.id,
  });

  // Fetch deliveries
  const { data: deliveries, isLoading: isLoadingDeliveries } = useQuery({
    queryKey: ['/api/delivery/orders', selectedTab],
    enabled: !!user?.id,
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const response = await apiRequest('POST', '/api/delivery/availability', { isAvailable });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/delivery/profile'] });
      toast({
        title: "تم تحديث الحالة",
        description: isAvailable ? "أنت متاح الآن للتوصيل" : "أنت غير متاح للتوصيل الآن",
      });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/delivery/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/delivery/orders'] });
      toast({
        title: "تم تحديث حالة الطلب",
        description: `تم تغيير حالة الطلب إلى ${statusTranslations[variables.status]}`,
      });
    },
  });

  // Initialize availability state from data
  useEffect(() => {
    if (deliveryPersonData?.data) {
      setIsAvailable(deliveryPersonData.data.isAvailable);
    }
  }, [deliveryPersonData]);

  // Handle availability toggle
  const handleAvailabilityToggle = () => {
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);
    updateAvailabilityMutation.mutate(newAvailability);
    
    // Start or stop location tracking based on availability
    if (newAvailability) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  };

  // Start location tracking
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "خطأ",
        description: "تعذر الوصول إلى خدمة تحديد الموقع",
        variant: "destructive",
      });
      return;
    }
    
    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        
        // Send initial position to server
        if (connected) {
          sendLocationUpdate(latitude, longitude);
        }
      },
      (error) => {
        console.error('Error getting current position:', error);
        toast({
          title: "خطأ",
          description: "تعذر تحديد موقعك الحالي",
          variant: "destructive",
        });
      }
    );
    
    // Watch position changes
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        
        // Send position update to server
        if (connected) {
          sendLocationUpdate(latitude, longitude);
        }
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    
    setWatchPosition(watchId);
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (watchPosition !== null) {
      navigator.geolocation.clearWatch(watchPosition);
      setWatchPosition(null);
    }
  };

  // Send location update to server
  const sendLocationUpdate = (lat: number, lng: number) => {
    // Get active delivery orders
    const activeOrders = deliveries?.data?.filter(
      (delivery: any) => delivery.status === 'ready_for_pickup' || delivery.status === 'on_delivery'
    );
    
    if (activeOrders && activeOrders.length > 0) {
      // Send location update for each active order
      activeOrders.forEach((order: any) => {
        sendMessage({
          type: 'updateDriverLocation',
          orderId: order.id,
          lat,
          lng,
        });
      });
    }
  };

  // Initialize Google Maps
  useEffect(() => {
    if (!isAvailable || !currentPosition) return;

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
  }, [isAvailable, currentPosition]);

  // Initialize map when Google Maps is loaded and we have position data
  useEffect(() => {
    if (!mapLoaded || !currentPosition) return;

    const mapElement = document.getElementById('delivery-map');
    if (!mapElement) return;

    // Create map centered on current position
    const newMap = new google.maps.Map(mapElement, {
      center: currentPosition,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Create marker for current position
    const newMarker = new google.maps.Marker({
      position: currentPosition,
      map: newMap,
      icon: {
        url: '/assets/delivery-bike.png',
        scaledSize: new google.maps.Size(40, 40),
      },
      title: 'موقعك الحالي',
    });

    // Create directions renderer
    const newDirectionsRenderer = new google.maps.DirectionsRenderer({
      map: newMap,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      },
    });

    // Create directions service
    const newDirectionsService = new google.maps.DirectionsService();
    
    // Create distance matrix service
    const newDistanceMatrix = new google.maps.DistanceMatrixService();

    setMap(newMap);
    setMarkers({ current: newMarker });
    setDirectionsRenderer(newDirectionsRenderer);
    setDirectionsService(newDirectionsService);
    setDistanceMatrix(newDistanceMatrix);

    return () => {
      // Cleanup
      newMarker.setMap(null);
      newDirectionsRenderer.setMap(null);
    };
  }, [mapLoaded, currentPosition]);

  // Update current position marker when position changes
  useEffect(() => {
    if (!markers.current || !currentPosition) return;
    markers.current.setPosition(currentPosition);
  }, [currentPosition, markers]);

  // Calculate and display route to active delivery
  useEffect(() => {
    if (!map || !directionsRenderer || !directionsService || !currentPosition || !deliveries?.data) return;

    // Get active delivery orders
    const activeOrders = deliveries.data.filter(
      (delivery: any) => delivery.status === 'ready_for_pickup' || delivery.status === 'on_delivery'
    );

    if (activeOrders.length === 0) {
      directionsRenderer.setDirections({ routes: [] });
      setRouteInfo(null);
      return;
    }

    // Get the first active order
    const activeOrder = activeOrders[0];
    
    // Determine destination based on order status
    let destination;
    let destinationName = '';
    if (activeOrder.status === 'ready_for_pickup') {
      // If order is ready for pickup, route to restaurant
      destination = { lat: activeOrder.restaurantLat, lng: activeOrder.restaurantLng };
      destinationName = activeOrder.restaurantName;
    } else {
      // If order is on delivery, route to customer
      destination = { lat: activeOrder.deliveryLat, lng: activeOrder.deliveryLng };
      destinationName = activeOrder.customerName;
    }

    if (!destination) return;

    // Calculate route
    directionsService.route(
      {
        origin: currentPosition,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          
          // Extract route information
          const route = result.routes[0];
          if (route && route.legs[0]) {
            setRouteInfo({
              distance: route.legs[0].distance?.text || 'غير معروف',
              duration: route.legs[0].duration?.text || 'غير معروف',
              destination: destinationName,
            });
          }
        } else {
          console.error('Directions request failed:', status);
          setRouteInfo(null);
        }
      }
    );
  }, [map, directionsRenderer, directionsService, currentPosition, deliveries?.data]);

  // Calculate distances for all orders
  useEffect(() => {
    if (!distanceMatrix || !currentPosition || !deliveries?.data || selectedTab !== 'assigned') return;

    const assignedOrders = deliveries.data.filter(
      (delivery: any) => delivery.status === 'ready_for_pickup'
    );

    if (assignedOrders.length === 0) return;

    // Create origins and destinations arrays
    const origins = [new google.maps.LatLng(currentPosition.lat, currentPosition.lng)];
    const destinations = assignedOrders.map((order: any) => 
      new google.maps.LatLng(order.restaurantLat, order.restaurantLng)
    );

    // Calculate distances
    distanceMatrix.getDistanceMatrix(
      {
        origins,
        destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK && response) {
          // Process response and update orders with distance and duration info
          const updatedOrders = assignedOrders.map((order: any, index: number) => {
            const distanceInfo = response.rows[0].elements[index];
            return {
              ...order,
              distanceText: distanceInfo.distance?.text || 'غير معروف',
              distanceValue: distanceInfo.distance?.value || 999999,
              durationText: distanceInfo.duration?.text || 'غير معروف',
              durationValue: distanceInfo.duration?.value || 999999,
            };
          });

          // Sort orders based on selected option
          const sortedOrders = [...updatedOrders].sort((a, b) => {
            if (sortOption === 'distance') {
              return a.distanceValue - b.distanceValue;
            } else {
              return a.durationValue - b.durationValue;
            }
          });

          // Update the orders in the query cache
          queryClient.setQueryData(['/api/delivery/orders', selectedTab], {
            ...deliveries,
            data: [
              ...sortedOrders,
              ...deliveries.data.filter((order: any) => order.status !== 'ready_for_pickup')
            ]
          });
        }
      }
    );
  }, [distanceMatrix, currentPosition, deliveries?.data, selectedTab, sortOption, queryClient]);

  // Handle order status update
  const handleOrderStatusUpdate = (orderId: number, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, newStatus });
  };

  // Handle sort option change
  const handleSortOptionChange = (option: 'distance' | 'time') => {
    setSortOption(option);
  };

  // Handle call customer
  const handleCallCustomer = (phoneNumber: string) => {
    if (!phoneNumber) {
      toast({
        title: "خطأ",
        description: "رقم الهاتف غير متوفر",
        variant: "destructive",
      });
      return;
    }
    
    window.location.href = `tel:${phoneNumber}`;
  };

  // Handle open maps navigation
  const handleOpenNavigation = (lat: number, lng: number, name: string) => {
    if (!lat || !lng) {
      toast({
        title: "خطأ",
        description: "الإحداثيات غير متوفرة",
        variant: "destructive",
      });
      return;
    }
    
    // Open Google Maps navigation in a new tab
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_name=${encodeURIComponent(name)}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">لوحة تحكم عامل التوصيل</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>حالة التوصيل</CardTitle>
          <CardDescription>
            قم بتغيير حالتك للتوصيل. عندما تكون متاحًا، ستتمكن من استلام طلبات جديدة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Switch 
              id="availability" 
              checked={isAvailable} 
              onCheckedChange={handleAvailabilityToggle} 
            />
            <Label htmlFor="availability" className="mr-2">
              {isAvailable ? 'متاح للتوصيل' : 'غير متاح للتوصيل'}
            </Label>
            {!connected && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 mr-auto">
                وضع غير متصل
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Map for active deliveries */}
      {isAvailable && currentPosition && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>خريطة التوصيل</CardTitle>
            <CardDescription>
              موقعك الحالي ومسار التوصيل النشط
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              id="delivery-map" 
              className="h-64 w-full rounded-md border"
              style={{ height: '300px' }}
            ></div>
            
            {routeInfo && (
              <div className="mt-4 p-4 bg-muted/30 rounded-md">
                <h3 className="font-medium mb-2">معلومات المسار</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <MapPin className="h-5 w-5 mb-1 text-primary" />
                    <div className="text-sm font-medium">الوجهة</div>
                    <div className="text-sm text-gray-500">{routeInfo.destination}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Navigation className="h-5 w-5 mb-1 text-primary" />
                    <div className="text-sm font-medium">المسافة</div>
                    <div className="text-sm text-gray-500">{routeInfo.distance}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock className="h-5 w-5 mb-1 text-primary" />
                    <div className="text-sm font-medium">الوقت المتوقع</div>
                    <div className="text-sm text-gray-500">{routeInfo.duration}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="assigned" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="assigned">قيد الاستلام</TabsTrigger>
          <TabsTrigger value="on_delivery">قيد التوصيل</TabsTrigger>
          <TabsTrigger value="completed">مكتملة</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedTab === 'assigned' ? 'طلبات قيد الاستلام' : 
                 selectedTab === 'on_delivery' ? 'طلبات قيد التوصيل' : 
                 'طلبات مكتملة'}
              </CardTitle>
              
              {selectedTab === 'assigned' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">ترتيب حسب:</span>
                  <div className="flex rounded-md overflow-hidden border">
                    <button
                      className={`px-3 py-1 text-sm ${sortOption === 'distance' ? 'bg-primary text-white' : 'bg-muted'}`}
                      onClick={() => handleSortOptionChange('distance')}
                    >
                      المسافة
                    </button>
                    <button
                      className={`px-3 py-1 text-sm ${sortOption === 'time' ? 'bg-primary text-white' : 'bg-muted'}`}
                      onClick={() => handleSortOptionChange('time')}
                    >
                      الوقت
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="assigned" className="mt-0">
              {isLoadingDeliveries ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : deliveries?.data?.filter((order: any) => order.status === 'ready_for_pickup').length > 0 ? (
                <div className="space-y-4">
                  {deliveries.data
                    .filter((order: any) => order.status === 'ready_for_pickup')
                    .map((order: any) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">طلب #{order.id}</CardTitle>
                              <CardDescription>
                                {new Date(order.createdAt).toLocaleString('ar-SY')}
                              </CardDescription>
                            </div>
                            <Badge className={`${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                              {statusTranslations[order.status]}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">المطعم</h4>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                                <div>
                                  <div className="font-medium">{order.restaurantName}</div>
                                  <div className="text-sm text-gray-500">{order.restaurantAddress}</div>
                                  {order.distanceText && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                                      <Navigation className="h-3 w-3" />
                                      <span>{order.distanceText}</span>
                                      <span className="mx-1">•</span>
                                      <Clock className="h-3 w-3" />
                                      <span>{order.durationText}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">العميل</h4>
                              <div className="flex items-start gap-2">
                                <User className="h-4 w-4 mt-0.5 text-gray-400" />
                                <div>
                                  <div className="font-medium">{order.customerName}</div>
                                  <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleOrderStatusUpdate(order.id, 'on_delivery')}
                            >
                              <Car className="h-4 w-4 mr-1" />
                              استلام الطلب
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenNavigation(order.restaurantLat, order.restaurantLng, order.restaurantName)}
                            >
                              <Navigation className="h-4 w-4 mr-1" />
                              فتح الملاحة
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCallCustomer(order.restaurantPhone)}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              اتصال بالمطعم
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">لا توجد طلبات قيد الاستلام</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    لا توجد طلبات جاهزة للاستلام حاليًا. ستظهر الطلبات هنا عندما تكون جاهزة للاستلام من المطاعم.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="on_delivery" className="mt-0">
              {isLoadingDeliveries ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : deliveries?.data?.filter((order: any) => order.status === 'on_delivery').length > 0 ? (
                <div className="space-y-4">
                  {deliveries.data
                    .filter((order: any) => order.status === 'on_delivery')
                    .map((order: any) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">طلب #{order.id}</CardTitle>
                              <CardDescription>
                                {new Date(order.createdAt).toLocaleString('ar-SY')}
                              </CardDescription>
                            </div>
                            <Badge className={`${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                              {statusTranslations[order.status]}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">العميل</h4>
                              <div className="flex items-start gap-2">
                                <User className="h-4 w-4 mt-0.5 text-gray-400" />
                                <div>
                                  <div className="font-medium">{order.customerName}</div>
                                  <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">عنوان التوصيل</h4>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                                <div>
                                  <div className="font-medium">{order.deliveryAddress}</div>
                                  {routeInfo && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                                      <Navigation className="h-3 w-3" />
                                      <span>{routeInfo.distance}</span>
                                      <span className="mx-1">•</span>
                                      <Clock className="h-3 w-3" />
                                      <span>{routeInfo.duration}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleOrderStatusUpdate(order.id, 'delivered')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              تأكيد التسليم
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenNavigation(order.deliveryLat, order.deliveryLng, order.customerName)}
                            >
                              <Navigation className="h-4 w-4 mr-1" />
                              فتح الملاحة
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCallCustomer(order.customerPhone)}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              اتصال بالعميل
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">لا توجد طلبات قيد التوصيل</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    لا توجد طلبات قيد التوصيل حاليًا. ستظهر الطلبات هنا عندما تقوم باستلام طلب من المطعم.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              {isLoadingDeliveries ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : deliveries?.data?.filter((order: any) => ['delivered', 'cancelled'].includes(order.status)).length > 0 ? (
                <div className="space-y-4">
                  {deliveries.data
                    .filter((order: any) => ['delivered', 'cancelled'].includes(order.status))
                    .map((order: any) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">طلب #{order.id}</CardTitle>
                              <CardDescription>
                                {new Date(order.createdAt).toLocaleString('ar-SY')}
                              </CardDescription>
                            </div>
                            <Badge className={`${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                              {statusTranslations[order.status]}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">المطعم</h4>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                                <div>
                                  <div className="font-medium">{order.restaurantName}</div>
                                  <div className="text-sm text-gray-500">{order.restaurantAddress}</div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">العميل</h4>
                              <div className="flex items-start gap-2">
                                <User className="h-4 w-4 mt-0.5 text-gray-400" />
                                <div>
                                  <div className="font-medium">{order.customerName}</div>
                                  <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 rounded-md bg-muted/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Timer className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">
                                  وقت التوصيل: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString('ar-SY') : 'غير متوفر'}
                                </span>
                              </div>
                              <div className="text-sm font-medium">
                                {order.deliveryFee} ل.س
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">لا توجد طلبات مكتملة</h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    لا توجد طلبات مكتملة حاليًا. ستظهر الطلبات هنا بعد تسليمها للعملاء.
                  </p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
