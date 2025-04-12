import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Promotion } from "@shared/schema";

export default function PromoSection() {
  const { data: promotions, isLoading } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
    enabled: false, // Since we don't have a promotions API endpoint yet, we'll disable this query
  });
  
  // Mock promotions for demonstration
  const mockPromotions = [
    {
      id: 1,
      code: "WELCOME25",
      title: "خصم 25%",
      description: "على طلبك الأول من أي مطعم",
      bgColor: "from-primary/90 to-primary",
      textColor: "text-white",
    },
    {
      id: 2,
      code: "FREEDEL",
      title: "توصيل مجاني",
      description: "للطلبات فوق 30 دولار",
      bgColor: "from-secondary/90 to-secondary",
      textColor: "text-white",
    },
    {
      id: 3,
      code: "BOGO",
      title: "اشترِ 1 واحصل على 1",
      description: "كل يوم ثلاثاء على البيتزا",
      bgColor: "from-accent/90 to-accent",
      textColor: "text-neutral-800",
    }
  ];
  
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
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };
  
  return (
    <section className="py-6 bg-neutral-100">
      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex overflow-x-auto pb-4 space-x-4 space-x-reverse">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="min-w-[280px] rounded-lg p-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="flex overflow-x-auto pb-4 space-x-4 space-x-reverse"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {(promotions || mockPromotions).map((promo) => (
              <motion.div 
                key={promo.id}
                className={`min-w-[280px] bg-gradient-to-l ${promo.bgColor} rounded-lg p-4 flex flex-col ${promo.textColor || 'text-white'}`}
                variants={item}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-sm text-white/80">عرض اليوم</span>
                <h3 className="text-xl font-bold my-1">{promo.title}</h3>
                <p className="text-sm mb-3">{promo.description}</p>
                <div className="mt-auto">
                  <span className="bg-white text-primary text-xs font-bold px-2 py-1 rounded">
                    {promo.code}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
