import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CreditCardIcon, 
  BanknoteIcon, 
  PlusIcon,
  ArrowLeftIcon,
  MapPinIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Address } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import GoogleMap from "@/components/GoogleMap";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

// Form schema for address
const addressSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  address: z.string().min(5, "يرجى إدخال عنوان صالح"),
  lat: z.number(),
  lng: z.number(),
  isDefault: z.boolean().default(false),
});

// Form schema for checkout
const checkoutSchema = z.object({
  addressId: z.number({
    required_error: "يرجى اختيار عنوان التوصيل",
  }),
  paymentMethod: z.enum(["cash", "card"], {
    required_error: "يرجى اختيار طريقة الدفع",
  }),
  notes: z.string().optional(),
  promoCode: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart, promoCode, promoDiscount } = useCart();
  const { toast } = useToast();
  
  // States for address form
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addressSearchText, setAddressSearchText] = useState("");
  
  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "غير مسجل الدخول",
        description: "يرجى تسجيل الدخول للمتابعة إلى الدفع",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    if (cartItems.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "يرجى إضافة بعض العناصر إلى سلتك قبل متابعة الدفع",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAuthenticated, cartItems, navigate]);
  
  // Fetch user addresses
  const { data: addresses, isLoading: addressesLoading, refetch: refetchAddresses } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
    enabled: isAuthenticated,
  });
  
  // Form for checkout
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cash",
      notes: "",
      promoCode: promoCode || "",
    },
  });
  
  // Set default address if available
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        form.setValue("addressId", defaultAddress.id);
      } else {
        form.setValue("addressId", addresses[0].id);
      }
    }
  }, [addresses, form]);
  
  // Form for adding new address
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
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const selectedAddress = addresses?.find(addr => addr.id === data.addressId);
      
      if (!selectedAddress) {
        throw new Error("عنوان التوصيل غير موجود");
      }
      
      // Prepare order data
      const orderData = {
        order: {
          userId: user?.id,
          restaurantId: cartItems[0].restaurantId, // Assuming all items are from the same restaurant
          status: "pending",
          total: cartTotal + 2 - promoDiscount, // Adding delivery fee and subtracting discount
          subtotal: cartTotal,
          deliveryFee: 2,
          discount: promoDiscount,
          paymentMethod: data.paymentMethod,
          addressId: data.addressId,
          deliveryAddress: selectedAddress.address,
          deliveryLat: selectedAddress.lat,
          deliveryLng: selectedAddress.lng,
          notes: data.notes,
        },
        items: cartItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity,
          notes: item.notes,
        })),
      };
      
      const response = await apiRequest("POST", "/api/orders", orderData);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم إنشاء الطلب بنجاح",
        description: "يمكنك تتبع طلبك الآن",
      });
      clearCart();
      navigate(`/track/${data.data.id}`);
    },
    onError: (error) => {
      toast({
        title: "فشل إنشاء الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء طلبك",
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
  
  // Handle form submission
  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };
  
  // Handle address form submission
  const onAddressSubmit = (data: AddressFormData) => {
    addAddressMutation.mutate(data);
  };
  
  // Handle selecting location on map
  useEffect(() => {
    if (selectedLocation) {
      addressForm.setValue("lat", selectedLocation.lat);
      addressForm.setValue("lng", selectedLocation.lng);
      
      // Try to reverse geocode
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: selectedLocation }, 
          (results: any, status: any) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              addressForm.setValue("address", address || "");
              setAddressSearchText(address || "");
            }
          }
        );
      }
    }
  }, [selectedLocation, addressForm]);
  
  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (showAddressDialog && window.google && window.google.maps) {
      const input = document.getElementById("address-search") as HTMLInputElement;
      if (input) {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          componentRestrictions: { country: "sy" },
        });
        
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            setSelectedLocation(location);
            addressForm.setValue("lat", location.lat);
            addressForm.setValue("lng", location.lng);
            addressForm.setValue("address", place.formatted_address || "");
          }
        });
      }
    }
  }, [showAddressDialog, addressForm]);
  
  // Calculate totals
  const subtotal = cartTotal;
  const deliveryFee = 2;
  const discount = promoDiscount;
  const total = subtotal + deliveryFee - discount;
  
  if (!isAuthenticated || cartItems.length === 0) {
    return null; // Already handled with redirects
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <Helmet>
        <title>إتمام الطلب | طلبلي</title>
        <meta name="description" content="إتمام طلبك وتحديد عنوان التوصيل وطريقة الدفع" />
      </Helmet>
      
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeftIcon className="h-4 w-4 ml-2" />
          العودة
        </Button>
        
        <h1 className="text-2xl font-bold">إتمام الطلب</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPinIcon className="h-5 w-5 ml-2" />
                    عنوان التوصيل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {addressesLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : addresses && addresses.length > 0 ? (
                    <FormField
                      control={form.control}
                      name="addressId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={String(field.value)}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              className="space-y-3"
                            >
                              {addresses.map((address) => (
                                <div
                                  key={address.id}
                                  className={`flex items-center space-x-2 space-x-reverse border rounded-lg p-4 ${
                                    field.value === address.id ? "border-primary bg-primary/5" : "border-neutral-200"
                                  }`}
                                >
                                  <RadioGroupItem value={String(address.id)} id={`address-${address.id}`} />
                                  <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer">
                                    <div className="font-medium">{address.title}</div>
                                    <div className="text-neutral-600 text-sm">{address.address}</div>
                                    {address.isDefault && (
                                      <span className="text-xs bg-neutral-100 px-2 py-1 rounded mt-1 inline-block">
                                        العنوان الافتراضي
                                      </span>
                                    )}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-neutral-600 mb-4">لم تقم بإضافة أي عناوين بعد</p>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => setShowAddressDialog(true)}
                  >
                    <PlusIcon className="h-4 w-4 ml-2" />
                    إضافة عنوان جديد
                  </Button>
                </CardContent>
              </Card>
              
              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>طريقة الدفع</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="space-y-3"
                          >
                            <div className={`flex items-center space-x-2 space-x-reverse border rounded-lg p-4 ${
                              field.value === "cash" ? "border-primary bg-primary/5" : "border-neutral-200"
                            }`}>
                              <RadioGroupItem value="cash" id="payment-cash" />
                              <Label htmlFor="payment-cash" className="flex items-center cursor-pointer">
                                <BanknoteIcon className="h-5 w-5 ml-2 text-success" />
                                <div>
                                  <div className="font-medium">الدفع عند الاستلام</div>
                                  <div className="text-neutral-600 text-sm">ادفع نقداً عند استلام طلبك</div>
                                </div>
                              </Label>
                            </div>
                            
                            <div className={`flex items-center space-x-2 space-x-reverse border rounded-lg p-4 ${
                              field.value === "card" ? "border-primary bg-primary/5" : "border-neutral-200"
                            }`}>
                              <RadioGroupItem value="card" id="payment-card" />
                              <Label htmlFor="payment-card" className="flex items-center cursor-pointer">
                                <CreditCardIcon className="h-5 w-5 ml-2 text-primary" />
                                <div>
                                  <div className="font-medium">بطاقة ائتمان</div>
                                  <div className="text-neutral-600 text-sm">الدفع باستخدام بطاقة ائتمان</div>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>ملاحظات إضافية</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="أي تعليمات خاصة للتوصيل..."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Submit Button (Mobile Only) */}
              <div className="lg:hidden">
                <Button
                  type="submit"
                  className="w-full py-6 text-lg"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-primary font-medium ml-2">
                          {item.quantity}x
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">
                        {(item.price * item.quantity).toFixed(2)} دولار
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-neutral-600">
                    <span>المجموع الفرعي</span>
                    <span>{subtotal.toFixed(2)} دولار</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>رسوم التوصيل</span>
                    <span>{deliveryFee.toFixed(2)} دولار</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>خصم (كود: {promoCode})</span>
                      <span>-{discount.toFixed(2)} دولار</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span>{total.toFixed(2)} دولار</span>
                  </div>
                </div>
                
                {/* Submit Button (Desktop Only) */}
                <div className="hidden lg:block">
                  <Button
                    type="submit"
                    className="w-full py-6 text-lg"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>إضافة عنوان جديد</DialogTitle>
            <DialogDescription>
              أضف عنوان توصيل جديد لاستخدامه في طلباتك
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
                <Label htmlFor="address-search">البحث عن العنوان</Label>
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
                      <Textarea
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
                  disabled={addAddressMutation.isPending}
                >
                  {addAddressMutation.isPending ? "جاري الإضافة..." : "إضافة العنوان"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
