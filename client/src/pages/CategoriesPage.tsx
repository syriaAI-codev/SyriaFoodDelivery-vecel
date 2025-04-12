import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Category, Restaurant } from '@shared/schema';
import { Search, ChevronLeft, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Fetch all categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['/api/categories'],
    onError: (error) => {
      console.error('Error fetching categories:', error);
    },
  });

  // Fetch restaurants filtered by selected category
  const { data: restaurantsData, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['/api/restaurants', searchTerm, selectedCategory],
    queryFn: () => {
      let url = '/api/restaurants';
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (selectedCategory) {
        params.append('categoryId', selectedCategory.toString());
      }
      
      const queryParams = params.toString();
      return fetch(`${url}${queryParams ? `?${queryParams}` : ''}`)
        .then(res => res.json());
    },
    enabled: true, // Always fetch restaurants, but they'll be filtered by category if one is selected
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
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
          <span className="font-medium">تصفح حسب التصنيف</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">تصفح حسب التصنيف</h1>
        <p className="text-gray-600 max-w-3xl">
          اختر من بين مجموعة متنوعة من فئات الطعام واستكشف أفضل المطاعم في كل فئة. يمكنك اختيار تصنيف معين لتصفية النتائج.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="ابحث عن تصنيف أو مطعم..."
              className="pr-3 pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700 whitespace-nowrap">
            <Filter className="h-4 w-4" />
            <span>التصنيف المحدد:</span>
            {selectedCategory ? (
              <span className="font-medium text-primary">
                {categoriesData?.data?.find((cat: Category) => cat.id === selectedCategory)?.name || 'غير معروف'}
              </span>
            ) : (
              <span>الكل</span>
            )}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">التصنيفات</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* "All" category option */}
          <div
            onClick={() => setSelectedCategory(null)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition
              ${!selectedCategory 
                ? 'bg-primary/10 ring-1 ring-primary shadow'
                : 'bg-white hover:bg-gray-50 shadow-sm'
              }
            `}
          >
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-3">
              <span className="text-xl font-bold text-primary">الكل</span>
            </div>
            <span className="font-medium text-center">جميع التصنيفات</span>
          </div>

          {loadingCategories ? (
            // Skeleton loaders for categories
            Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="animate-pulse flex flex-col items-center justify-center p-4 rounded-lg bg-white shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-gray-200 mb-3"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                </div>
              ))
          ) : !categoriesData?.data?.length ? (
            <div className="col-span-full flex items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg">
              <p>لم يتم العثور على تصنيفات</p>
            </div>
          ) : (
            categoriesData.data.map((category: Category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition
                  ${selectedCategory === category.id
                    ? 'bg-primary/10 ring-1 ring-primary shadow'
                    : 'bg-white hover:bg-gray-50 shadow-sm'
                  }
                `}
              >
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-primary">{category.name.charAt(0)}</span>
                </div>
                <span className="font-medium text-center">{category.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Restaurants Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {selectedCategory
            ? `مطاعم ${categoriesData?.data?.find((cat: Category) => cat.id === selectedCategory)?.name || ''}`
            : 'جميع المطاعم'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loadingRestaurants ? (
            // Skeleton loaders for restaurants
            Array(4)
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
          ) : !restaurantsData?.data?.length ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-500 bg-gray-50 rounded-lg">
              <p className="text-lg font-medium mb-2">لم يتم العثور على مطاعم</p>
              <p className="text-sm text-center max-w-md">
                {selectedCategory
                  ? 'لا توجد مطاعم في هذا التصنيف حالياً. يرجى تحديد تصنيف آخر أو إزالة الفلتر.'
                  : 'لا توجد مطاعم متاحة حالياً. يرجى المحاولة لاحقاً.'}
              </p>
            </div>
          ) : (
            restaurantsData.data.map((restaurant: Restaurant) => (
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
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-1 line-clamp-1">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                      {restaurant.description || restaurant.locationAddress || 'مطعم رائع يقدم ألذ الأطباق'}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{restaurant.rating || '0.0'}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {restaurant.deliveryTime 
                          ? `${restaurant.deliveryTime} دقيقة`
                          : '30-45 دقيقة'
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}