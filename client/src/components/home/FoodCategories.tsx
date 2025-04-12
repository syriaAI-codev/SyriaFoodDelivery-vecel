import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons: Record<string, JSX.Element> = {
  "مشاوي": <i className="fas fa-drumstick-bite text-primary text-xl"></i>,
  "بيتزا": <i className="fas fa-pizza-slice text-secondary text-xl"></i>,
  "برغر": <i className="fas fa-hamburger text-accent text-xl"></i>,
  "مشروبات": <i className="fas fa-coffee text-primary text-xl"></i>,
  "معجنات": <i className="fas fa-bread-slice text-secondary text-xl"></i>,
  "حلويات": <i className="fas fa-ice-cream text-accent text-xl"></i>,
};

export default function FoodCategories() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
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
    console.error("Error fetching categories:", error);
  }
  
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">تصفح حسب التصنيف</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <motion.div
                  key={category.id}
                  className="category-item"
                  variants={item}
                >
                  <Link 
                    href={`/restaurants?category=${category.id}`}
                    className="flex flex-col items-center w-full"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      {category.icon && categoryIcons[category.name] ? (
                        categoryIcons[category.name]
                      ) : (
                        <i className="fas fa-utensils text-primary text-xl"></i>
                      )}
                    </div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </Link>
                </motion.div>
              ))
            ) : (
              // Placeholder categories when none are available from API
              <motion.div
                className="category-item"
                variants={item}
              >
                <div className="flex flex-col items-center w-full">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <i className="fas fa-utensils text-primary text-xl"></i>
                  </div>
                  <span className="text-sm font-medium">كل الأطعمة</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
