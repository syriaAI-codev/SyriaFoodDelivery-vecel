import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Restaurant, MenuItem, Category } from '@shared/schema';
import { ArrowLeft, ArrowRight, Star, MapPin, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  // Fetch popular restaurants
  const { data: popularRestaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['/api/restaurants/popular'],
    onError: (error) => {
      console.error('Error fetching popular restaurants:', error);
    },
  });
  
  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['/api/categories'],
    onError: (error) => {
      console.error('Error fetching categories:', error);
    },
  });
  
  // Fetch popular menu items
  const { data: popularItems, isLoading: loadingItems } = useQuery({
    queryKey: ['/api/menu-items/popular'],
    onError: (error) => {
      console.error('Error fetching popular menu items:', error);
    },
  });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      <section className="mb-12 rounded-2xl bg-gradient-to-l from-primary/20 to-primary/5 px-6 py-12 text-center md:py-16">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          طعامك المفضل، 
          <span className="text-primary">موصل لباب بيتك</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          اطلب من أفضل المطاعم في مدينتك بضغطة زر واحدة. توصيل سريع وآمن في جميع أنحاء سوريا.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/restaurants" className="rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90">
            تصفح المطاعم
          </Link>
          {!user && (
            <Link href="/signup" className="rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50">
              إنشاء حساب
            </Link>
          )}
        </div>
      </section>
      
      {/* Featured Categories Section */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">تصفح حسب التصنيف</h2>
          <div className="flex gap-4">
            <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
              عرض الكل
            </Link>
            <div className="flex gap-2">
              <button className="rounded-full p-2 hover:bg-gray-100">
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="rounded-full p-2 hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {loadingCategories ? (
            // Category skeleton loaders
            Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="flex animate-pulse flex-col items-center">
                  <div className="mb-2 h-20 w-20 rounded-full bg-gray-200" />
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </div>
              ))
          ) : categories?.data?.length > 0 ? (
            // Actual categories
            categories.data.map((category: Category) => (
              <div
                key={category.id}
                onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                className={`group flex cursor-pointer flex-col items-center rounded-lg p-4 transition hover:bg-gray-50 ${
                  activeCategory === category.id ? 'bg-primary/5 ring-1 ring-primary' : ''
                }`}
              >
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {/* Replace with actual category icon or first letter */}
                  <span className="text-xl font-bold">{category.name.charAt(0)}</span>
                </div>
                <span className="text-center font-medium">{category.name}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-gray-500">
              لم يتم العثور على تصنيفات
            </div>
          )}
        </div>
      </section>
      
      {/* Popular Restaurants Section */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">المطاعم الشائعة</h2>
          <Link href="/popular-restaurants" className="text-sm font-medium text-primary hover:underline">
            عرض الكل
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loadingRestaurants ? (
            // Restaurant skeleton loaders
            Array(4)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="animate-pulse rounded-lg bg-white p-4 shadow">
                  <div className="mb-4 h-40 rounded bg-gray-200" />
                  <div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
                </div>
              ))
          ) : popularRestaurants?.data?.length > 0 ? (
            // Actual restaurants
            popularRestaurants.data.map((restaurant: Restaurant) => (
              <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`} className="block overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={restaurant.image || 'https://via.placeholder.com/400x250?text=Restaurant'}
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
                      <span className="font-medium">{restaurant.rating || '0.0'}</span>
                      <span className="text-gray-500">({restaurant.reviewCount || 0} تقييم)</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {restaurant.deliveryTime ? `${restaurant.deliveryTime} دقيقة` : '30-45 دقيقة'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-gray-500">
              لم يتم العثور على مطاعم
            </div>
          )}
        </div>
      </section>
      
      {/* Popular Dishes Section */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">الأطباق الأكثر طلباً</h2>
          <Link href="/popular-dishes" className="text-sm font-medium text-primary hover:underline">
            عرض الكل
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loadingItems ? (
            // Menu item skeleton loaders
            Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="animate-pulse rounded-lg bg-white p-3 shadow">
                  <div className="mb-3 h-32 rounded bg-gray-200" />
                  <div className="mb-2 h-5 w-2/3 rounded bg-gray-200" />
                  <div className="mb-2 h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              ))
          ) : popularItems?.data?.length > 0 ? (
            // Actual menu items
            popularItems.data.map((item: MenuItem & { restaurantName?: string }) => (
              <Link key={item.id} href={`/restaurants/${item.restaurantId}`} className="group block overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md">
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={item.image || 'https://via.placeholder.com/300x200?text=Food'}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="rounded bg-red-500 px-2 py-1 text-sm font-medium text-white">
                        غير متوفر
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="mb-1 font-medium line-clamp-1">{item.name}</h3>
                  <p className="mb-2 text-sm text-gray-500 line-clamp-1">
                    {item.restaurantName || 'مطعم'}
                  </p>
                  <div className="font-semibold text-primary">
                    {item.price} ل.س
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-gray-500">
              لم يتم العثور على أطباق
            </div>
          )}
        </div>
      </section>
      
      {/* App Features Section */}
      <section className="mb-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 p-8">
        <h2 className="mb-8 text-center text-2xl font-semibold">لماذا تختار خدمتنا؟</h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg p-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Clock className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-medium">توصيل سريع</h3>
            <p className="text-gray-600">
              نضمن وصول طلبك في أسرع وقت ممكن وبحالة ممتازة.
            </p>
          </div>
          
          <div className="flex flex-col items-center rounded-lg p-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-medium">تتبع مباشر</h3>
            <p className="text-gray-600">
              تابع حالة طلبك وموقع المندوب في الوقت الحقيقي.
            </p>
          </div>
          
          <div className="flex flex-col items-center rounded-lg p-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Star className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-medium">أفضل المطاعم</h3>
            <p className="text-gray-600">
              نتعاون فقط مع المطاعم ذات الجودة العالية لضمان تجربة مميزة.
            </p>
          </div>
        </div>
      </section>
      
      {/* Download App CTA (future feature hint) */}
      <section className="rounded-xl bg-primary/90 p-8 text-white">
        <div className="flex flex-col items-center md:flex-row md:justify-between">
          <div className="mb-6 md:mb-0 md:max-w-md">
            <h2 className="mb-2 text-2xl font-bold">حمّل تطبيقنا قريباً</h2>
            <p className="mb-4">
              احصل على تجربة أفضل وأسرع لطلب الطعام، وميزات حصرية على تطبيقنا القادم قريباً.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                disabled
                className="flex items-center rounded-lg bg-black px-4 py-2 opacity-70"
              >
                <span className="mr-2 text-xs font-medium">قريباً على</span>
                <span className="font-semibold">App Store</span>
              </button>
              <button
                disabled
                className="flex items-center rounded-lg bg-black px-4 py-2 opacity-70"
              >
                <span className="mr-2 text-xs font-medium">قريباً على</span>
                <span className="font-semibold">Google Play</span>
              </button>
            </div>
          </div>
          <div className="hidden h-40 w-40 items-center justify-center rounded-full bg-white/20 text-white md:flex">
            <p className="text-center font-semibold">صورة التطبيق</p>
          </div>
        </div>
      </section>
    </div>
  );
}