import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Restaurant } from '@shared/schema';
import { Search, ChevronLeft, Star, MapPin, Clock, SortDesc } from 'lucide-react';
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

type SortOption = 'rating' | 'deliveryTime' | 'reviewCount';

export default function PopularRestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Fetch popular restaurants
  const { data: restaurantsData, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['/api/restaurants/popular'],
    onError: (error) => {
      console.error('Error fetching popular restaurants:', error);
    },
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter and sort restaurants based on search term and sort option
  const filteredRestaurants = restaurantsData?.data 
    ? restaurantsData.data
        .filter((restaurant: Restaurant) => 
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (restaurant.description && restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a: Restaurant, b: Restaurant) => {
          switch (sortBy) {
            case 'rating':
              return (b.rating || 0) - (a.rating || 0);
            case 'deliveryTime':
              return (a.deliveryTime || 45) - (b.deliveryTime || 45);
            case 'reviewCount':
              return (b.reviewCount || 0) - (a.reviewCount || 0);
            default:
              return 0;
          }
        })
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/" className="text-gray-500 hover:text-primary">
            الرئيسية
          </Link>
          <ChevronLeft className="h-4 w-4 text-gray-500" />
          <span className="font-medium">المطاعم الشائعة</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">المطاعم الشائعة</h1>
        <p className="text-gray-600 max-w-3xl">
          اكتشف أفضل وأشهر المطاعم في منطقتك. تصفح قائمة المطاعم الأعلى تقييماً والأكثر طلباً من قبل المستخدمين.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="ابحث عن مطعم..."
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
                <SelectItem value="rating">التقييم</SelectItem>
                <SelectItem value="deliveryTime">وقت التوصيل</SelectItem>
                <SelectItem value="reviewCount">عدد التقييمات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Popular Restaurants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loadingRestaurants ? (
          // Skeleton loaders for restaurants
          Array(8)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="flex justify-between mt-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
        ) : !filteredRestaurants.length ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-500 bg-gray-50 rounded-lg">
            <p className="text-lg font-medium mb-2">لم يتم العثور على مطاعم</p>
            <p className="text-sm text-center max-w-md">
              {searchTerm 
                ? 'لا توجد مطاعم تطابق بحثك. يرجى تجربة كلمات بحث أخرى.'
                : 'لا توجد مطاعم شائعة متاحة حالياً. يرجى المحاولة لاحقاً.'}
            </p>
          </div>
        ) : (
          filteredRestaurants.map((restaurant: Restaurant) => (
            <Link 
              key={restaurant.id} 
              href={`/restaurants/${restaurant.id}`}
              className="block"
            >
              <Card className="overflow-hidden h-full transition hover:shadow-md">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={restaurant.image || 'https://via.placeholder.com/400x250?text=Restaurant'}
                    alt={restaurant.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {restaurant.isOpen !== undefined && (
                    <span 
                      className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full text-white ${
                        restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {restaurant.isOpen ? 'مفتوح' : 'مغلق'}
                    </span>
                  )}
                  {sortBy === 'rating' && restaurant.rating && restaurant.rating >= 4.5 && (
                    <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-yellow-500 text-white">
                      الأعلى تقييماً
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-1 line-clamp-1">{restaurant.name}</h3>
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{restaurant.locationAddress || 'غير محدد'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{restaurant.rating || '0.0'}</span>
                      <span className="text-gray-500 text-sm">({restaurant.reviewCount || 0})</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {restaurant.deliveryTime 
                          ? `${restaurant.deliveryTime} دقيقة`
                          : '30-45 دقيقة'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}