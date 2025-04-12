import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MenuItem } from '@shared/schema';
import { Search, ChevronLeft, Tag, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

type SortOption = 'popularity' | 'price_low' | 'price_high';

export default function PopularDishesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const { addToCart } = useCart();

  // Fetch popular menu items
  const { data: menuItemsData, isLoading: loadingItems } = useQuery({
    queryKey: ['/api/menu-items/popular'],
    onError: (error) => {
      console.error('Error fetching popular menu items:', error);
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter and sort menu items based on search term and sort option
  const filteredItems = menuItemsData?.data 
    ? menuItemsData.data
        .filter((item: MenuItem & { restaurantName?: string }) => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.restaurantName && item.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a: MenuItem, b: MenuItem) => {
          switch (sortBy) {
            case 'popularity':
              return (b.orderCount || 0) - (a.orderCount || 0);
            case 'price_low':
              return (a.price || 0) - (b.price || 0);
            case 'price_high':
              return (b.price || 0) - (a.price || 0);
            default:
              return 0;
          }
        })
    : [];

  // Handle adding item to cart
  const handleAddToCart = (item: MenuItem & { restaurantName?: string }) => {
    addToCart({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      totalPrice: item.price,
      image: item.image,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName || 'مطعم',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/" className="text-gray-500 hover:text-primary">
            الرئيسية
          </Link>
          <ChevronLeft className="h-4 w-4 text-gray-500" />
          <span className="font-medium">الأطباق الأكثر طلباً</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">الأطباق الأكثر طلباً</h1>
        <p className="text-gray-600 max-w-3xl">
          اكتشف الأطباق الأكثر شعبية وطلباً من قبل المستخدمين. مجموعة متنوعة من الأطباق الشهية من مختلف المطاعم.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="ابحث عن طبق..."
              className="pr-3 pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <SortDesc className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">ترتيب حسب:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">الأكثر طلباً</SelectItem>
                <SelectItem value="price_low">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price_high">السعر: من الأعلى للأقل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Popular Dishes Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {loadingItems ? (
          // Menu item skeleton loaders
          Array(10)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="animate-pulse rounded-lg bg-white p-3 shadow">
                <div className="mb-3 h-36 rounded bg-gray-200" />
                <div className="mb-2 h-5 w-2/3 rounded bg-gray-200" />
                <div className="mb-2 h-4 w-1/3 rounded bg-gray-200" />
                <div className="mb-4 h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-8 rounded bg-gray-200" />
              </div>
            ))
        ) : !filteredItems.length ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-500 bg-gray-50 rounded-lg">
            <p className="text-lg font-medium mb-2">لم يتم العثور على أطباق</p>
            <p className="text-sm text-center max-w-md">
              {searchTerm 
                ? 'لا توجد أطباق تطابق بحثك. يرجى تجربة كلمات بحث أخرى.'
                : 'لا توجد أطباق شائعة متاحة حالياً. يرجى المحاولة لاحقاً.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item: MenuItem & { restaurantName?: string }) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative h-36 overflow-hidden">
                <Link href={`/restaurants/${item.restaurantId}`} className="block h-full">
                  <img
                    src={item.image || 'https://via.placeholder.com/300x200?text=Food'}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </Link>
                {!item.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="rounded bg-red-500 px-2 py-1 text-sm font-medium text-white">
                      غير متوفر
                    </span>
                  </div>
                )}
                {sortBy === 'popularity' && item.orderCount && item.orderCount > 50 && (
                  <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-primary text-white">
                    الأكثر طلباً
                  </span>
                )}
              </div>
              
              <CardContent className="p-3">
                <Link href={`/restaurants/${item.restaurantId}`} className="block">
                  <h3 className="font-medium line-clamp-1">{item.name}</h3>
                  <p className="mb-1 text-sm text-gray-500 line-clamp-1">
                    {item.restaurantName || 'مطعم'}
                  </p>
                </Link>
                
                {item.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <div className="font-semibold text-primary">
                    {item.price.toLocaleString('ar-SY')} ل.س
                  </div>
                  {item.isAvailable !== false && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleAddToCart(item)}
                      className="text-xs h-8"
                    >
                      إضافة للسلة
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}