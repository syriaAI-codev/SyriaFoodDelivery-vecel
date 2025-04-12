import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Restaurant, Category } from '@shared/schema';
import { MapPin, Star, Filter, Search } from 'lucide-react';

export default function RestaurantsPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Extract search params if they exist
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    if (search) setSearchQuery(search);
    if (category) setSelectedCategory(parseInt(category));
  }, [location]);
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    onError: (error) => {
      console.error('Error fetching categories:', error);
    },
  });
  
  // Fetch restaurants with filters
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['/api/restaurants', searchQuery, selectedCategory],
    queryFn: async () => {
      let url = '/api/restaurants';
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory.toString());
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      return response.json();
    },
    onError: (error) => {
      console.error('Error fetching restaurants:', error);
    },
  });
  
  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search params
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory.toString());
    
    window.history.pushState(
      {}, 
      '', 
      `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    );
  };
  
  // Handle category selection
  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">المطاعم</h1>
        <p className="text-gray-600">اكتشف أفضل المطاعم في مدينتك</p>
      </div>
      
      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="flex flex-1 overflow-hidden rounded-lg border border-gray-300 bg-white">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مطعم..."
              className="flex-grow border-none px-4 py-2 outline-none"
            />
            <button
              type="submit"
              className="bg-primary px-4 py-2 text-white"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
          
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2"
          >
            <Filter className="h-5 w-5" />
            <span>تصفية</span>
          </button>
        </div>
        
        {/* Categories Filter */}
        {isFilterOpen && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-medium">التصنيفات</h3>
            <div className="flex flex-wrap gap-2">
              {categoriesLoading ? (
                <div className="text-sm text-gray-500">جار تحميل التصنيفات...</div>
              ) : (
                categories?.data?.map((category: Category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`rounded-full px-3 py-1 text-sm ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {restaurantsLoading ? (
          // Loading skeletons
          Array(8)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="animate-pulse rounded-lg bg-white p-4 shadow">
                <div className="mb-4 h-48 rounded bg-gray-200" />
                <div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
                <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-4 w-1/4 rounded bg-gray-200" />
              </div>
            ))
        ) : restaurants?.data?.length > 0 ? (
          // Restaurant cards
          restaurants.data.map((restaurant: Restaurant) => (
            <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}>
              <a className="restaurant-card">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={restaurant.image || 'https://via.placeholder.com/300x200?text=Restaurant'}
                    alt={restaurant.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  {restaurant.isOpen ? (
                    <span className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-1 text-xs text-white">
                      مفتوح
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                      مغلق
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="mb-1 text-lg font-semibold">{restaurant.name}</h3>
                  <div className="mb-2 flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{restaurant.address}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{restaurant.rating}</span>
                      <span className="text-gray-500">({restaurant.reviewCount} تقييم)</span>
                    </div>
                    
                    <span className="text-sm text-gray-600">
                      {restaurant.deliveryFee === 0 ? 'توصيل مجاني' : `${restaurant.deliveryFee} ل.س`}
                    </span>
                  </div>
                </div>
              </a>
            </Link>
          ))
        ) : (
          // No results
          <div className="col-span-full py-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gray-100 p-6 text-gray-400">
              <Search className="h-full w-full" />
            </div>
            <h3 className="mb-1 text-xl font-medium">لم يتم العثور على نتائج</h3>
            <p className="text-gray-500">
              جرب تعديل معايير البحث أو تصفح جميع المطاعم
            </p>
          </div>
        )}
      </div>
    </div>
  );
}