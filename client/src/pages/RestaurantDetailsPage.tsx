import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Restaurant, 
  MenuItem, 
  Category 
} from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  StarIcon, 
  ClockIcon, 
  HandMetal, 
  BanknoteIcon,
  InfoIcon,
  PhoneIcon,
  MapPinIcon,
  PlusIcon,
  MinusIcon,
  HeartIcon,
  ShoppingCartIcon
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Helmet } from "react-helmet";

type RestaurantDetailsPageProps = {
  id: number;
};

export default function RestaurantDetailsPage({ id }: RestaurantDetailsPageProps) {
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  
  // State for menu item dialog
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  
  // Fetch restaurant details
  const { data: restaurant, isLoading: restaurantLoading, error: restaurantError } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${id}`],
  });
  
  // Fetch menu items
  const { data: menuItems, isLoading: menuLoading, error: menuError } = useQuery<MenuItem[]>({
    queryKey: [`/api/restaurants/${id}/menu`],
    enabled: !!id,
  });
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // State for active category tab
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // Group menu items by category
  const menuItemsByCategory = menuItems?.reduce((acc, item) => {
    const categoryId = item.categoryId ? String(item.categoryId) : "uncategorized";
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
  
  // Reset quantity and notes when a new item is selected
  useEffect(() => {
    if (selectedItem) {
      setQuantity(1);
      setNotes("");
    }
  }, [selectedItem]);
  
  // Handle adding item to cart
  const handleAddToCart = () => {
    if (selectedItem && restaurant) {
      addToCart({
        id: selectedItem.id,
        menuItemId: selectedItem.id,
        name: selectedItem.name,
        price: selectedItem.price,
        image: selectedItem.image || undefined,
        quantity,
        totalPrice: selectedItem.price * quantity,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        notes: notes || null
      });
      setSelectedItem(null);
    }
  };
  
  // Handle errors
  if (restaurantError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">حدث خطأ</h2>
        <p className="text-neutral-600 mb-4">لم نتمكن من تحميل بيانات المطعم</p>
        <Button onClick={() => navigate("/restaurants")}>العودة إلى المطاعم</Button>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Helmet>
        <title>{restaurant?.name ? `${restaurant.name} | طلبلي` : "تحميل..."}</title>
        <meta name="description" content={restaurant?.description || "استعرض قائمة الطعام واطلب من هذا المطعم"} />
      </Helmet>
      
      {/* Restaurant Header */}
      <div className="relative">
        {restaurantLoading ? (
          <Skeleton className="w-full h-64" />
        ) : (
          <div className="relative h-64">
            <img 
              src={restaurant?.coverImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} 
              alt={restaurant?.name} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>
        )}
        
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 bg-white rounded-t-xl shadow-sm p-6">
            {restaurantLoading ? (
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex space-x-4 space-x-reverse mb-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
                      {restaurant?.hasPromo && restaurant?.discount && (
                        <Badge variant="secondary" className="mr-2">
                          خصم {restaurant.discount}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-neutral-600">
                      {restaurant?.cuisineType?.join('، ') || 'متنوع'}
                    </p>
                  </div>
                  
                  <div className="flex items-center bg-neutral-100 px-3 py-1 rounded text-sm">
                    <StarIcon className="h-4 w-4 text-accent ml-1" />
                    <span>{restaurant?.rating ? restaurant.rating.toFixed(1) : "0.0"}</span>
                    <span className="text-neutral-500 mr-1">
                      ({restaurant?.reviewCount || 0} تقييم)
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center mt-4 text-sm text-neutral-600">
                  <div className="flex items-center ml-6 mb-2">
                    <ClockIcon className="h-4 w-4 ml-1 text-primary" />
                    <span>{restaurant?.deliveryTime || '30-45 دقيقة'}</span>
                  </div>
                  <div className="flex items-center ml-6 mb-2">
                    <HandMetal className="h-4 w-4 ml-1 text-primary" />
                    <span>
                      {restaurant?.deliveryFee ? `${restaurant.deliveryFee} دولار` : 'توصيل مجاني'}
                    </span>
                  </div>
                  <div className="flex items-center ml-6 mb-2">
                    <BanknoteIcon className="h-4 w-4 ml-1 text-primary" />
                    <span>
                      الحد الأدنى للطلب: {restaurant?.minOrderAmount} دولار
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <InfoIcon className="h-4 w-4 ml-1 text-primary" />
                    <span>
                      {restaurant?.isOpen ? 'مفتوح الآن' : 'مغلق الآن'}
                    </span>
                  </div>
                </div>
                
                {restaurant?.description && (
                  <p className="mt-4 text-neutral-600">
                    {restaurant.description}
                  </p>
                )}
                
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <div className="flex items-center text-sm">
                    <MapPinIcon className="h-4 w-4 ml-2 text-neutral-500" />
                    <span>{restaurant?.address}</span>
                  </div>
                  <div className="flex items-center text-sm mt-2">
                    <PhoneIcon className="h-4 w-4 ml-2 text-neutral-500" />
                    <span>{restaurant?.phone}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Menu Tabs */}
      <div className="container mx-auto px-4 py-6">
        {menuLoading ? (
          <div>
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index}>
                  <div className="flex">
                    <Skeleton className="h-24 w-24" />
                    <CardContent className="flex-1 p-4">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-5 w-16" />
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-6 w-full overflow-x-auto flex-nowrap justify-start">
              <TabsTrigger value="all">الكل</TabsTrigger>
              {categories?.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={String(category.id)}
                  disabled={!menuItemsByCategory?.[String(category.id)]}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <MenuItems 
                items={menuItems || []}
                onSelectItem={setSelectedItem}
              />
            </TabsContent>
            
            {categories?.map(category => (
              <TabsContent key={category.id} value={String(category.id)}>
                <MenuItems 
                  items={menuItemsByCategory?.[String(category.id)] || []}
                  onSelectItem={setSelectedItem}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
      
      {/* Menu Item Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem?.image && (
            <div className="relative h-48 -mx-6">
              <img 
                src={selectedItem.image} 
                alt={selectedItem.name} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الكمية</label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">ملاحظات خاصة</label>
              <textarea
                className="w-full p-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="أي تعليمات خاصة للمطعم..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <div className="text-lg font-bold mb-4 sm:mb-0">
              السعر: {selectedItem ? (selectedItem.price * quantity).toFixed(2) : 0} دولار
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleAddToCart}>
                <ShoppingCartIcon className="h-4 w-4 ml-2" />
                إضافة إلى السلة
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Menu Items Component
function MenuItems({ items, onSelectItem }: { items: MenuItem[], onSelectItem: (item: MenuItem) => void }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">لا توجد أصناف في هذه الفئة</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card 
              className="h-full cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectItem(item)}
            >
              <div className="flex h-full">
                {item.image && (
                  <div className="w-24 h-24 sm:w-36 sm:h-36 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                <CardContent className="flex-1 p-4 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex items-center">
                      <span className="font-bold text-primary ml-2">
                        {item.price.toFixed(2)} دولار
                      </span>
                      {item.isPopular && (
                        <Badge variant="secondary" className="text-xs">شائع</Badge>
                      )}
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-neutral-600 text-sm line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="mt-auto flex justify-between items-center">
                    <div>
                      {item.hasDiscount && item.discountPercentage && item.discountPercentage > 0 && (
                        <Badge variant="outline" className="text-success">
                          خصم {item.discountPercentage}%
                        </Badge>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to favorites functionality would go here
                      }}
                    >
                      <HeartIcon className="h-4 w-4 text-neutral-500" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
