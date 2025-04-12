import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Restaurant } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  StarIcon, 
  ClockIcon, 
  HandMetal, 
  BanknoteIcon 
} from "lucide-react";

export default function PopularRestaurants() {
  const { data, isLoading, error } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants/popular"],
  });
  
  // Safely ensure restaurants is always an array
  const restaurants = Array.isArray(data) ? data : [];
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  if (error) {
    console.error("Error fetching popular restaurants:", error);
  }
  
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">المطاعم الشعبية</h2>
          <Link 
            href="/restaurants"
            className="text-primary text-sm font-medium hover:underline"
          >
            عرض الكل
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="restaurant-card">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {restaurants && restaurants.map((restaurant) => (
              <motion.div 
                key={restaurant.id}
                className="restaurant-card"
                variants={item}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link 
                  href={`/restaurants/${restaurant.id}`}
                  className="block"
                >
                  <div className="relative h-48">
                    <img 
                      src={restaurant.coverImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover" 
                    />
                    {restaurant.hasPromo && restaurant.discount && (
                      <span className="absolute top-3 right-3 bg-accent/90 text-neutral-800 text-xs font-bold px-2 py-1 rounded">
                        خصم {restaurant.discount}%
                      </span>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center text-white">
                        <span className="bg-primary/90 text-xs px-2 py-1 rounded ml-2 flex items-center">
                          <StarIcon className="h-3 w-3 ml-1" />
                          {restaurant.rating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-xs">
                          ({restaurant.reviewCount || 0} تقييم)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{restaurant.name}</h3>
                        <p className="text-neutral-600 text-sm">
                          {restaurant.cuisineType?.join('، ') || 'متنوع'}
                        </p>
                      </div>
                      <div className="bg-neutral-100 px-2 py-1 rounded text-xs flex items-center">
                        <ClockIcon className="h-3 w-3 ml-1 text-primary" />
                        <span>{restaurant.deliveryTime || '30-45 د'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-3 text-sm text-neutral-600">
                      <span className="flex items-center ml-3">
                        <HandMetal className="h-3 w-3 ml-1 text-neutral-500" />
                        <span>
                          {restaurant.deliveryFee ? `${restaurant.deliveryFee} دولار` : 'مجاناً'}
                        </span>
                      </span>
                      <span className="flex items-center">
                        <BanknoteIcon className="h-3 w-3 ml-1 text-neutral-500" />
                        <span>
                          الحد الأدنى: {restaurant.minOrderAmount || 0} دولار
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
