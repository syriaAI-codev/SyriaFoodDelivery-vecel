import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { 
  UserIcon, 
  LogOutIcon, 
  HomeIcon, 
  PackageIcon, 
  PlusIcon, 
  MapPinIcon, 
  Trash2Icon, 
  EditIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Order, Address } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GoogleMap from "@/components/GoogleMap";
import { Helmet } from "react-helmet";

// Form schema for profile
const profileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().min(10, "رقم الهاتف غير صالح"),
});

// Form schema for address
const addressSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  address: z.string().min(5, "يرجى إدخال عنوان صالح"),
  lat: z.number(),
  lng: z.number(),
  isDefault: z.boolean().default(false),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for address management
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addressSearchText, setAddressSearchText] = useState("");
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate("/");
    return null;
  }
  
  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });
  
  // Address form
  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      title: "",
      address: "",
      lat: 33.5138, // Damascus default
      lng: 36.2765,
      isDefault: false,
    },
  });
  
  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  // Fetch user addresses
  const { data: addresses, isLoading: addressesLoading, refetch: refetchAddresses } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PUT", `/api/auth/user`, data);
      return await response.json();
    },
    onSuccess: (data) => {
      updateUserProfile(data.data);
      toast({
        title: "تم تحديث الملف الشخصي بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "فشل تحديث الملف الشخصي",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive",
      });
    },
  });
  
  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const response = await apiRequest("POST", "/api/addresses", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تمت إضافة العنوان بنجاح",
      });
      setShowAddressDialog(false);
      addressForm.reset();
      refetchAddresses();
    },
    onError: (error) => {
      toast({
        title: "فشل إضافة العنوان",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إضافة العنوان",
        variant: "destructive",
      });
    },
  });
  
  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AddressFormData> }) => {
      const response = await apiRequest("PUT", `/api/addresses/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث العنوان بنجاح",
      });
      setShowAddressDialog(false);
      addressForm.reset();
      refetchAddresses();
    },
    onError: (error) => {
      toast({
        title: "فشل تحديث العنوان",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث العنوان",
        variant: "destructive",
      });
    },
  });
  
  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/addresses/${id}`, undefined);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف العنوان بنجاح",
      });
      refetchAddresses();
    },
    onError: (error) => {
      toast({
        title: "فشل حذف العنوان",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حذف العنوان",
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };
  
  // Handle address form submission
  const onAddressSubmit = (data: AddressFormData) => {
    if (isEditingAddress && currentAddressId) {
      updateAddressMutation.mutate({ id: currentAddressId, data });
    } else {
      addAddressMutation.mutate(data);
    }
  };
  
  // Handle edit address
  const handleEditAddress = (address: Address) => {
    setIsEditingAddress(true);
    setCurrentAddressId(address.id);
    addressForm.reset({
      title: address.title,
      address: address.address,
      lat: address.lat,
      lng: address.lng,
      isDefault: address.isDefault ?? false,
    });
    setSelectedLocation({ lat: address.lat, lng: address.lng });
    setAddressSearchText(address.address);
    setShowAddressDialog(true);
  };
  
  // Handle add new address
  const handleAddAddress = () => {
    setIsEditingAddress(false);
    setCurrentAddressId(null);
    addressForm.reset({
      title: "",
      address: "",
      lat: 33.5138,
      lng: 36.2765,
      isDefault: false,
    });
    setSelectedLocation({ lat: 33.5138, lng: 36.2765 });
    setAddressSearchText("");
    setShowAddressDialog(true);
  };
  
  // Handle delete address
  const handleDeleteAddress = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا العنوان؟")) {
      deleteAddressMutation.mutate(id);
    }
  };
  
  // Status translations
  const statusTranslations: Record<string, string> = {
    "pending": "قيد الانتظار",
    "confirmed": "تم التأكيد",
    "preparing": "قيد التحضير",
    "delivering": "قيد التوصيل",
    "delivered": "تم التوصيل",
    "cancelled": "تم الإلغاء",
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <Helmet>
        <title>الملف الشخصي | طلبلي</title>
        <meta name="description" content="إدارة الملف الشخصي والعناوين وعرض الطلبات السابقة" />
      </Helmet>
      
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        <Button variant="outline" onClick={logout}>
          <LogOutIcon className="h-4 w-4 ml-2" />
          تسجيل الخروج
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center">
            <UserIcon className="h-4 w-4 ml-2" />
            البيانات الشخصية
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center">
            <HomeIcon className="h-4 w-4 ml-2" />
            العناوين
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center">
            <PackageIcon className="h-4 w-4 ml-2" />
            الطلبات السابقة
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>البيانات الشخصية</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم</FormLabel>
                        <FormControl>
                          <Input placeholder="الاسم الكامل" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input placeholder="example@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="رقم الهاتف" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit"
                    className="mt-2"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>العناوين</CardTitle>
              <Button onClick={handleAddAddress}>
                <PlusIcon className="h-4 w-4 ml-2" />
                إضافة عنوان
              </Button>
            </CardHeader>
            <CardContent>
              {addressesLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <div className="flex justify-end">
                          <Skeleton className="h-9 w-20 ml-2" />
                          <Skeleton className="h-9 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <Card key={address.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <h3 className="font-bold">{address.title}</h3>
                            {address.isDefault && (
                              <Badge className="mr-2" variant="outline">
                                العنوان الافتراضي
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-neutral-600 mb-4">{address.address}</p>
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="ml-2"
                            onClick={() => handleEditAddress(address)}
                          >
                            <EditIcon className="h-4 w-4 ml-1" />
                            تعديل
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2Icon className="h-4 w-4 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPinIcon className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-600 mb-2">لا توجد عناوين</h3>
                  <p className="text-neutral-500 mb-6">أضف عنوانك الأول لسهولة التوصيل</p>
                  <Button onClick={handleAddAddress}>
                    <PlusIcon className="h-4 w-4 ml-2" />
                    إضافة عنوان
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>الطلبات السابقة</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-4" />
                        <div className="flex justify-between">
                          <Skeleton className="h-9 w-20" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold">طلب #{order.id}</h3>
                            <p className="text-neutral-600 text-sm">
                              {order.createdAt ? new Date(order.createdAt).toLocaleString('ar-SY') : '-'}
                            </p>
                          </div>
                          <Badge className={
                            order.status === "delivered" ? "bg-success" : 
                            order.status === "cancelled" ? "bg-destructive" :
                            "bg-primary"
                          }>
                            {order.status && statusTranslations[order.status as keyof typeof statusTranslations] || order.status}
                          </Badge>
                        </div>
                        <p className="text-neutral-600 mb-4 truncate">
                          {order.deliveryAddress}
                        </p>
                        <div className="flex justify-between items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/track/${order.id}`)}
                          >
                            عرض التفاصيل
                          </Button>
                          <div className="font-bold">
                            {order.total.toFixed(2)} دولار
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PackageIcon className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-600 mb-2">لا توجد طلبات سابقة</h3>
                  <p className="text-neutral-500 mb-6">لم تقم بإجراء أي طلبات بعد</p>
                  <Button onClick={() => navigate("/restaurants")}>
                    استكشف المطاعم
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingAddress ? "تعديل العنوان" : "إضافة عنوان جديد"}
            </DialogTitle>
            <DialogDescription>
              {isEditingAddress 
                ? "قم بتعديل بيانات العنوان الخاص بك"
                : "أضف عنوان توصيل جديد لاستخدامه في طلباتك"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
              <FormField
                control={addressForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان العنوان (مثل: المنزل، العمل)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: منزلي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <FormLabel htmlFor="address-search">البحث عن العنوان</FormLabel>
                <Input
                  id="address-search"
                  placeholder="ابحث عن موقعك..."
                  value={addressSearchText}
                  onChange={(e) => setAddressSearchText(e.target.value)}
                />
              </div>
              
              <GoogleMap
                deliveryLocation={selectedLocation || undefined}
                height="300px"
                className="mb-4"
                showRoute={false}
              />
              
              <p className="text-sm text-neutral-600">
                انقر على الخريطة لتحديد موقعك بدقة
              </p>
              
              <FormField
                control={addressForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان التفصيلي</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="العنوان التفصيلي، مثل: شارع، بناء، طابق..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addressForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-x-reverse">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="ml-2"
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">تعيين كعنوان افتراضي</FormLabel>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">إلغاء</Button>
                </DialogClose>
                <Button 
                  type="submit"
                  disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                >
                  {isEditingAddress 
                    ? (updateAddressMutation.isPending ? "جاري التحديث..." : "تحديث العنوان")
                    : (addAddressMutation.isPending ? "جاري الإضافة..." : "إضافة العنوان")
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
