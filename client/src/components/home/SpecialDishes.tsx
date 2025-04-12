import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MenuItem } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  StarIcon, 
  ClockIcon, 
  HeartIcon 
} from "lucide-react";
import { useContext } from "react";
import { CartContext } from "@/context/CartContext";

export default function SpecialDishes() {
  const { data, isLoading, error } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items/popular"],
  });
  
  // Safely ensure dishes is always an array
  const dishes = Array.isArray(data) ? data : [];
  
  const cartContext = useContext(CartContext);
  const addToCart = cartContext?.addToCart || (() => {});
  
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
    console.error("Error fetching popular dishes:", error);
  }
  
  return (
    <section className="py-8 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">أطباق خاصة</h2>
          <Link 
            href="/restaurants"
            className="text-primary text-sm font-medium hover:underline"
          >
            عرض الكل
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="dish-card">
                <Skeleton className="h-40 w-full" />
                <div className="p-3">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {dishes && dishes.map((dish) => (
              <motion.div 
                key={dish.id}
                className="dish-card"
                variants={item}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative h-40">
                  <img 
                    src={dish.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`} 
                    alt={dish.name} 
                    className="w-full h-full object-cover" 
                  />
                  <button 
                    className="absolute top-2 left-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-primary/5"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to favorites functionality would go here
                    }}
                  >
                    <HeartIcon className="h-4 w-4 text-primary" />
                  </button>
                  
                  {dish.hasDiscount && dish.discountPercentage && dish.discountPercentage > 0 && (
                    <span className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded">
                      خصم {dish.discountPercentage}%
                    </span>
                  )}
                </div>
                
                <div className="p-3">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{dish.name}</h3>
                    <span className="font-bold text-primary">{dish.price} دولار</span>
                  </div>
                  <p className="text-neutral-600 text-xs mt-1">
                    {/* Restaurant name would go here */}
                    مطعم شهير
                  </p>
                  <div className="mt-2 flex items-center text-xs text-neutral-500">
                    <span className="flex items-center ml-2">
                      <StarIcon className="h-3 w-3 text-accent ml-1" />
                      4.8
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="h-3 w-3 ml-1" />
                      30 د
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
