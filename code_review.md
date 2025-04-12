# مراجعة شاملة للكود واقتراح إصلاحات

## 1. مراجعة ملف OrdersSection.tsx

### المشكلات المحددة

#### 1.1 التعامل مع الأخطاء
- **المشكلة**: استخدام `console.error` لتسجيل الأخطاء دون معالجة مناسبة
- **الخطورة**: متوسطة
- **الإصلاح المقترح**:

```tsx
// قبل
try {
  // ...
} catch (error: any) {
  console.error('Error updating order status:', error);
  toast({
    title: 'خطأ',
    description: error.message || 'حدث خطأ أثناء تحديث حالة الطلب',
    variant: 'destructive',
  });
}

// بعد
try {
  // ...
} catch (error: any) {
  // تسجيل الخطأ في نظام تتبع الأخطاء
  logError('OrdersSection', 'handleStatusChange', error);
  
  // عرض رسالة خطأ مناسبة للمستخدم
  toast({
    title: 'خطأ',
    description: getErrorMessage(error) || 'حدث خطأ أثناء تحديث حالة الطلب',
    variant: 'destructive',
  });
  
  // محاولة إعادة الاتصال إذا كان الخطأ متعلقًا بالشبكة
  if (isNetworkError(error)) {
    setTimeout(() => {
      // محاولة إعادة الاتصال
    }, 5000);
  }
}
```

#### 1.2 عدم وجود إشعارات صوتية للطلبات الجديدة
- **المشكلة**: لا توجد آلية لتنبيه أصحاب المطاعم عند وصول طلبات جديدة
- **الخطورة**: عالية
- **الإصلاح المقترح**:

```tsx
// إضافة هذه الدالة والمتغيرات
const [previousOrderCount, setPreviousOrderCount] = useState(0);
const newOrderSound = new Audio('/sounds/new-order.mp3');

// إضافة هذا التأثير لتشغيل الصوت عند وصول طلبات جديدة
useEffect(() => {
  const pendingOrders = orders?.filter(order => order.status === 'pending') || [];
  
  if (pendingOrders.length > previousOrderCount && previousOrderCount > 0) {
    // تشغيل صوت التنبيه
    newOrderSound.play();
    
    // عرض إشعار على سطح المكتب إذا كان التطبيق في الخلفية
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('طلب جديد', {
        body: 'لديك طلب جديد في انتظار المراجعة',
        icon: '/logo.png'
      });
    }
  }
  
  setPreviousOrderCount(pendingOrders.length);
}, [orders]);

// إضافة هذا الكود لطلب إذن الإشعارات
useEffect(() => {
  if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}, []);
```

#### 1.3 عدم وجود خيار لتقدير وقت التحضير
- **المشكلة**: لا يمكن لأصحاب المطاعم تحديد وقت التحضير المتوقع
- **الخطورة**: متوسطة
- **الإصلاح المقترح**:

```tsx
// إضافة حالة لتخزين وقت التحضير المقدر
const [estimatedPrepTime, setEstimatedPrepTime] = useState<Record<number, number>>({});

// إضافة هذا المكون في قسم تفاصيل الطلب
<div className="mt-4">
  <h4 className="mb-2 text-sm font-medium text-gray-500">وقت التحضير المتوقع</h4>
  <div className="flex items-center gap-2">
    <select
      value={estimatedPrepTime[order.id] || 15}
      onChange={(e) => {
        const newEstimatedPrepTime = { ...estimatedPrepTime };
        newEstimatedPrepTime[order.id] = parseInt(e.target.value);
        setEstimatedPrepTime(newEstimatedPrepTime);
      }}
      className="rounded-md border border-gray-300 px-3 py-1 text-sm"
    >
      <option value={15}>15 دقيقة</option>
      <option value={30}>30 دقيقة</option>
      <option value={45}>45 دقيقة</option>
      <option value={60}>ساعة واحدة</option>
      <option value={90}>ساعة ونصف</option>
      <option value={120}>ساعتان</option>
    </select>
    <Button 
      size="sm" 
      variant="outline"
      onClick={() => updatePrepTime(order.id, estimatedPrepTime[order.id] || 15)}
    >
      تحديث وقت التحضير
    </Button>
  </div>
</div>

// إضافة هذه الدالة لتحديث وقت التحضير
const updatePrepTime = async (orderId: number, prepTimeMinutes: number) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/prep-time`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prepTimeMinutes }),
    });
    
    if (!response.ok) {
      throw new Error('فشل في تحديث وقت التحضير');
    }
    
    toast({
      title: 'تم تحديث وقت التحضير',
      description: `تم تحديث وقت التحضير المتوقع إلى ${prepTimeMinutes} دقيقة`,
    });
  } catch (error: any) {
    toast({
      title: 'خطأ',
      description: error.message || 'حدث خطأ أثناء تحديث وقت التحضير',
      variant: 'destructive',
    });
  }
};
```

#### 1.4 عدم وجود تقارير وإحصائيات
- **المشكلة**: لا توجد واجهة لعرض التقارير والإحصائيات
- **الخطورة**: متوسطة
- **الإصلاح المقترح**: إضافة علامة تبويب جديدة للتقارير

```tsx
// إضافة علامة تبويب جديدة في TabsList
<TabsTrigger value="reports">
  التقارير
</TabsTrigger>

// إضافة محتوى علامة التبويب
<TabsContent value="reports" className="pt-4">
  <ReportsSection />
</TabsContent>

// إنشاء مكون ReportsSection جديد
// في ملف جديد: /client/src/components/restaurant/ReportsSection.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export default function ReportsSection() {
  const [period, setPeriod] = useState('week');
  
  // استعلام لجلب بيانات المبيعات
  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ['/api/restaurant/reports/sales', period],
    queryFn: () => fetch(`/api/restaurant/reports/sales?period=${period}`).then(res => res.json()),
  });
  
  // استعلام لجلب بيانات الأطباق الأكثر طلباً
  const { data: topItemsData, isLoading: isLoadingTopItems } = useQuery({
    queryKey: ['/api/restaurant/reports/top-items', period],
    queryFn: () => fetch(`/api/restaurant/reports/top-items?period=${period}`).then(res => res.json()),
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">التقارير والإحصائيات</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm"
        >
          <option value="day">اليوم</option>
          <option value="week">الأسبوع</option>
          <option value="month">الشهر</option>
          <option value="year">السنة</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* مخطط المبيعات */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">المبيعات</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingSales ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData?.data || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" name="المبيعات (ل.س)" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* مخطط الأطباق الأكثر طلباً */}
        <Card>
          <CardHeader>
            <CardTitle className="text-md">الأطباق الأكثر طلباً</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoadingTopItems ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topItemsData?.data || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {(topItemsData?.data || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];
```

## 2. مراجعة ملف DeliveryDashboardPage.tsx

### المشكلات المحددة

#### 2.1 عدم وجود معلومات كافية عن المسافة ووقت التوصيل المتوقع
- **المشكلة**: لا يتم عرض معلومات المسافة ووقت التوصيل المتوقع بشكل واضح
- **الخطورة**: عالية
- **الإصلاح المقترح**:

```tsx
// إضافة هذه الدالة لحساب المسافة والوقت
const calculateDistanceAndTime = (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
  if (!window.google || !origin || !destination) return null;
  
  const service = new google.maps.DistanceMatrixService();
  
  return new Promise((resolve, reject) => {
    service.getDistanceMatrix(
      {
        origins: [new google.maps.LatLng(origin.lat, origin.lng)],
        destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          const distance = response.rows[0].elements[0].distance.text;
          const duration = response.rows[0].elements[0].duration.text;
          resolve({ distance, duration });
        } else {
          reject(new Error('فشل في حساب المسافة والوقت'));
        }
      }
    );
  });
};

// إضافة هذه الحالة والتأثير
const [routeInfo, setRouteInfo] = useState<Record<number, { distance: string; duration: string }>>({});

useEffect(() => {
  if (!mapLoaded || !currentPosition || !deliveries?.data) return;
  
  // الحصول على معلومات المسافة والوقت لكل طلب نشط
  const activeOrders = deliveries.data.filter(
    (delivery: any) => delivery.status === 'ready_for_pickup' || delivery.status === 'on_delivery'
  );
  
  activeOrders.forEach(async (order: any) => {
    try {
      // تحديد الوجهة بناءً على حالة الطلب
      const destination = order.status === 'ready_for_pickup'
        ? { lat: order.restaurantLat, lng: order.restaurantLng }
        : { lat: order.deliveryLat, lng: order.deliveryLng };
      
      const info = await calculateDistanceAndTime(currentPosition, destination);
      
      if (info) {
        setRouteInfo(prev => ({
          ...prev,
          [order.id]: info as { distance: string; duration: string }
        }));
      }
    } catch (error) {
      console.error('Error calculating distance and time:', error);
    }
  });
}, [mapLoaded, currentPosition, deliveries?.data]);

// إضافة هذا المكون في قسم عرض الطلبات
<div className="flex items-center justify-between mt-2">
  <div className="text-sm text-gray-500">
    {routeInfo[order.id] ? (
      <>
        <span className="font-medium">المسافة: </span>
        {routeInfo[order.id].distance}
        <span className="mx-2">•</span>
        <span className="font-medium">الوقت المتوقع: </span>
        {routeInfo[order.id].duration}
      </>
    ) : (
      'جاري حساب المسافة والوقت...'
    )}
  </div>
</div>
```

#### 2.2 عدم وجود خيار لترتيب الطلبات المتعددة
- **المشكلة**: لا يمكن لعامل التوصيل ترتيب الطلبات المتعددة لتحسين كفاءة التوصيل
- **الخطورة**: متوسطة
- **الإصلاح المقترح**:

```tsx
// إضافة هذه الحالة
const [orderSequence, setOrderSequence] = useState<number[]>([]);

// إضافة هذا التأثير لتهيئة تسلسل الطلبات
useEffect(() => {
  if (!deliveries?.data) return;
  
  const activeOrders = deliveries.data.filter(
    (delivery: any) => delivery.status === 'ready_for_pickup' || delivery.status === 'on_delivery'
  );
  
  // تهيئة تسلسل الطلبات إذا كان فارغًا أو إذا تغيرت الطلبات النشطة
  if (
    orderSequence.length === 0 || 
    activeOrders.length !== orderSequence.length ||
    !activeOrders.every(order => orderSequence.includes(order.id))
  ) {
    setOrderSequence(activeOrders.map(order => order.id));
  }
}, [deliveries?.data, orderSequence]);

// إضافة هذه الدالة لتحديث تسلسل الطلبات
const updateOrderSequence = async (newSequence: number[]) => {
  setOrderSequence(newSequence);
  
  try {
    const response = await fetch('/api/delivery/order-sequence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sequence: newSequence }),
    });
    
    if (!response.ok) {
      throw new Error('فشل في تحديث تسلسل الطلبات');
    }
    
    toast({
      title: 'تم تحديث تسلسل الطلبات',
      description: 'تم تحديث تسلسل الطلبات بنجاح',
    });
  } catch (error: any) {
    toast({
      title: 'خطأ',
      description: error.message || 'حدث خطأ أثناء تحديث تسلسل الطلبات',
      variant: 'destructive',
    });
  }
};

// إضافة هذا المكون إذا كان هناك أكثر من طلب نشط
{activeOrders.length > 1 && (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle>ترتيب الطلبات</CardTitle>
      <CardDescription>
        اسحب وأفلت لترتيب الطلبات حسب مسار التوصيل المفضل
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {orderSequence.map((orderId, index) => {
          const order = deliveries.data.find((o: any) => o.id === orderId);
          if (!order) return null;
          
          return (
            <div 
              key={order.id} 
              className="flex items-center justify-between p-3 bg-muted/30 rounded-md cursor-move"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = index;
                
                if (fromIndex === toIndex) return;
                
                const newSequence = [...orderSequence];
                const [movedItem] = newSequence.splice(fromIndex, 1);
                newSequence.splice(toIndex, 0, movedItem);
                
                updateOrderSequence(newSequence);
              }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">طلب #{order.id}</div>
                  <div className="text-sm text-gray-500">
                    {order.status === 'ready_for_pickup' ? order.restaurantName : order.customerName}
                  </div>
                </div>
              </div>
              <Badge className={`${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                {statusTranslations[order.status]}
              </Badge>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
)}
```

#### 2.3 محدودية خيارات التواصل مع العملاء
- **المشكلة**: لا توجد خيارات كافية للتواصل مع العملاء
- **الخطورة**: متوسطة
- **الإصلاح المقترح**:

```tsx
// إضافة هذه الدالة للاتصال بالعميل
const callCustomer = (phoneNumber: string) => {
  window.location.href = `tel:${phoneNumber}`;
};

// إضافة هذه الدالة لإرسال رسالة نصية للعميل
const sendSMS = (phoneNumber: string, message: string) => {
  window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
};

// إضافة هذه الدالة لإرسال رسالة داخل التطبيق
const sendInAppMessage = async (orderId: number, message: string) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error('فشل في إرسال الرسالة');
    }
    
    toast({
      title: 'تم إرسال الرسالة',
      description: 'تم إرسال الرسالة بنجاح',
    });
  } catch (error: any) {
    toast({
      title: 'خطأ',
      description: error.message || 'حدث خطأ أثناء إرسال الرسالة',
      variant: 'destructive',
    });
  }
};

// إضافة هذه الحالة والمكون
const [messageText, setMessageText] = useState('');
const [messageDialogOpen, setMessageDialogOpen] = useState(false);
const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

// إضافة هذا المكون في قسم معلومات العميل
<div className="flex items-center gap-2 mt-2">
  <Button
    size="sm"
    variant="outline"
    onClick={() => callCustomer(order.customerPhone)}
    className="flex items-center gap-1"
  >
    <Phone className="h-4 w-4" />
    <span>اتصال</span>
  </Button>
  
  <Button
    size="sm"
    variant="outline"
    onClick={() => {
      setSelectedOrderId(order.id);
      setMessageDialogOpen(true);
    }}
    className="flex items-center gap-1"
  >
    <MessageSquare className="h-4 w-4" />
    <span>رسالة</span>
  </Button>
</div>

// إضافة هذا المكون في نهاية الملف
<Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>إرسال رسالة للعميل</DialogTitle>
      <DialogDescription>
        أدخل الرسالة التي تريد إرسالها للعميل
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <textarea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="اكتب رسالتك هنا..."
        className="w-full min-h-[100px] p-3 rounded-md border border-gray-300"
      />
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (!selectedOrderId) return;
            const order = deliveries.data.find((o: any) => o.id === selectedOrderId);
            if (!order) return;
            
            sendSMS(order.customerPhone, messageText);
          }}
        >
          إرسال كرسالة نصية
        </Button>
        
        <Button
          onClick={() => {
            if (!selectedOrderId) return;
            sendInAppMessage(selectedOrderId, messageText);
            setMessageDialogOpen(false);
            setMessageText('');
          }}
        >
          إرسال داخل التطبيق
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

## 3. مراجعة ملف schema.ts

### المشكلات المحددة

#### 3.1 عدم وجود تحقق من صحة البيانات
- **المشكلة**: لا يوجد تحقق كافٍ من صحة البيانات في مخطط قاعدة البيانات
- **الخطورة**: عالية
- **الإصلاح المقترح**:

```ts
// إضافة تحقق من صحة البيانات لجدول المستخدمين
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('customer'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// إضافة تحقق من صحة البيانات لجدول المطاعم
export const restaurants = pgTable('restaurants', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  logo: varchar('logo', { length: 255 }),
  coverImage: varchar('cover_image', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  locationAddress: varchar('location_address', { length: 255 }).notNull(),
  locationLat: numeric('location_lat', { precision: 10, scale: 7 }).notNull(),
  locationLng: numeric('location_lng', { precision: 10, scale: 7 }).notNull(),
  openingTime: time('opening_time'),
  closingTime: time('closing_time'),
  isOpen: boolean('is_open').notNull().default(true),
  minOrderAmount: numeric('min_order_amount', { precision: 10, scale: 2 }),
  deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 }),
  averageDeliveryTime: integer('average_delivery_time'),
  rating: numeric('rating', { precision: 3, scale: 2 }),
  reviewCount: integer('review_count').notNull().default(0),
  ownerId: integer('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// إضافة تحقق من صحة البيانات لجدول الطلبات
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => users.id).notNull(),
  restaurantId: integer('restaurant_id').references(() => restaurants.id).notNull(),
  deliveryPersonId: integer('delivery_person_id').references(() => users.id),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: varchar('delivery_address', { length: 255 }).notNull(),
  deliveryLat: numeric('delivery_lat', { precision: 10, scale: 7 }).notNull(),
  deliveryLng: numeric('delivery_lng', { precision: 10, scale: 7 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 20 }).notNull(),
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('pending'),
  notes: text('notes'),
  prepTimeMinutes: integer('prep_time_minutes'),
  estimatedDeliveryTime: timestamp('estimated_delivery_time'),
  actualDeliveryTime: timestamp('actual_delivery_time'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

#### 3.2 عدم وجود علاقات كافية بين الجداول
- **المشكلة**: بعض العلاقات بين الجداول غير محددة بشكل صحيح
- **الخطورة**: متوسطة
- **الإصلاح المقترح**:

```ts
// إضافة علاقات لجدول عناصر الطلب
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  menuItemId: integer('menu_item_id').references(() => menuItems.id).notNull(),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
});

// إضافة علاقات لجدول التقييمات
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  restaurantId: integer('restaurant_id').references(() => restaurants.id, { onDelete: 'cascade' }).notNull(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// إضافة جدول للرسائل
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  senderId: integer('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  receiverId: integer('receiver_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

## 4. مراجعة ملف App.tsx

### المشكلات المحددة

#### 4.1 عدم وجود معالجة للأخطاء على مستوى التطبيق
- **المشكلة**: لا توجد معالجة للأخطاء على مستوى التطبيق
- **الخطورة**: عالية
- **الإصلاح المقترح**:

```tsx
// إضافة مكون ErrorBoundary
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // يمكن تسجيل الخطأ في خدمة تتبع الأخطاء هنا
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">حدث خطأ غير متوقع</h1>
          <p className="mb-6 text-gray-600">
            نعتذر عن هذا الخطأ. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقًا.
          </p>
          <div className="space-x-4 space-x-reverse">
            <Button onClick={() => window.location.reload()}>
              تحديث الصفحة
            </Button>
            <Button variant="outline" onClick={() => this.setState({ hasError: false, error: null })}>
              محاولة مرة أخرى
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 max-w-full overflow-auto rounded border p-4 text-left">
              <p className="mb-2 font-mono font-bold">{this.state.error.toString()}</p>
              <pre className="text-sm text-gray-700">
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// استخدام ErrorBoundary في App.tsx
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <div dir="rtl" className="min-h-screen bg-background font-sans antialiased">
              <Routes />
              <Toaster />
            </div>
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

#### 4.2 عدم وجود وضع عدم الاتصال
- **المشكلة**: لا توجد آلية للتعامل مع انقطاع الاتصال
- **الخطورة**: عالية
- **الإصلاح المقترح**:

```tsx
// إضافة مكون OfflineDetector
import { useState, useEffect } from 'react';

function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-500 p-2 text-center text-white">
      أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل بشكل صحيح.
    </div>
  );
}

// استخدام OfflineDetector في App.tsx
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <div dir="rtl" className="min-h-screen bg-background font-sans antialiased">
              <Routes />
              <Toaster />
              <OfflineDetector />
            </div>
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

## 5. مراجعة ملف routes.ts

### المشكلات المحددة

#### 5.1 عدم وجود تحقق من الصلاحيات
- **المشكلة**: لا يوجد تحقق كافٍ من صلاحيات المستخدمين في بعض المسارات
- **الخطورة**: عالية
- **الإصلاح المقترح**:

```ts
// إضافة وسيط للتحقق من الصلاحيات
const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'غير مصرح به' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number; role: string };
      
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'ليس لديك صلاحية للوصول إلى هذا المورد' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'غير مصرح به' });
    }
  };
};

// استخدام وسيط التحقق من الصلاحيات في المسارات
// مسارات المطاعم
router.get('/api/restaurants', getAllRestaurants);
router.get('/api/restaurants/:id', getRestaurantById);
router.post('/api/restaurants', checkRole(['admin']), createRestaurant);
router.put('/api/restaurants/:id', checkRole(['admin', 'restaurant']), updateRestaurant);
router.delete('/api/restaurants/:id', checkRole(['admin']), deleteRestaurant);

// مسارات الطلبات
router.get('/api/orders', checkRole(['admin', 'restaurant', 'delivery', 'customer']), getOrders);
router.get('/api/orders/:id', checkRole(['admin', 'restaurant', 'delivery', 'customer']), getOrderById);
router.post('/api/orders', checkRole(['customer']), createOrder);
router.put('/api/orders/:id/status', checkRole(['admin', 'restaurant', 'delivery']), updateOrderStatus);
```

#### 5.2 عدم وجود تحقق من صحة البيانات المدخلة
- **المشكلة**: لا يوجد تحقق كافٍ من صحة البيانات المدخلة في بعض المسارات
- **الخطورة**: عالية
- **الإصلاح المقترح**:

```ts
// إضافة مكتبة zod للتحقق من صحة البيانات
import { z } from 'zod';

// إنشاء مخططات للتحقق من صحة البيانات
const createOrderSchema = z.object({
  restaurantId: z.number().positive('معرف المطعم مطلوب'),
  items: z.array(
    z.object({
      menuItemId: z.number().positive('معرف عنصر القائمة مطلوب'),
      quantity: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
      notes: z.string().optional(),
    })
  ).min(1, 'يجب أن يحتوي الطلب على عنصر واحد على الأقل'),
  deliveryAddress: z.string().min(5, 'عنوان التوصيل مطلوب'),
  deliveryLat: z.number(),
  deliveryLng: z.number(),
  paymentMethod: z.enum(['cash', 'card', 'wallet'], {
    errorMap: () => ({ message: 'طريقة الدفع غير صالحة' }),
  }),
  notes: z.string().optional(),
});

// إضافة وسيط للتحقق من صحة البيانات
const validateRequest = (schema: z.ZodSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'بيانات غير صالحة',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

// استخدام وسيط التحقق من صحة البيانات في المسارات
router.post('/api/orders', checkRole(['customer']), validateRequest(createOrderSchema), createOrder);
```

## 6. الخلاصة والتوصيات

### 6.1 المشكلات ذات الأولوية القصوى
1. إضافة معالجة للأخطاء على مستوى التطبيق
2. إضافة تحقق من الصلاحيات في المسارات
3. إضافة تحقق من صحة البيانات المدخلة
4. إضافة إشعارات صوتية للطلبات الجديدة
5. تحسين آلية التعامل مع انقطاع الاتصال

### 6.2 التحسينات المقترحة للإصدار التالي
1. إضافة تقارير وإحصائيات لأصحاب المطاعم
2. تحسين واجهة الخريطة والملاحة لعمال التوصيل
3. إضافة خيار لتقدير وقت التحضير
4. إضافة خيار لترتيب الطلبات المتعددة
5. تحسين خيارات التواصل بين العملاء وعمال التوصيل

### 6.3 توصيات طويلة المدى
1. إعادة هيكلة الكود لتحسين قابلية الصيانة
2. تحسين أداء التطبيق وتقليل وقت التحميل
3. إضافة اختبارات آلية لضمان جودة الكود
4. تحسين أمان التطبيق وحماية البيانات
5. تطوير واجهة برمجة تطبيقات (API) أكثر استقرارًا وتوثيقًا
