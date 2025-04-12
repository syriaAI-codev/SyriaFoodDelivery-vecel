import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPinIcon, SearchIcon, ClockIcon, UtensilsIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const [address, setAddress] = useState("دمشق، سوريا");
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <section className="bg-gradient-to-l from-primary/90 to-primary relative overflow-hidden">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div 
            className="md:w-1/2 text-white z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">اكتشف ألذ الأطباق السورية</h2>
            <p className="text-lg mb-6">اطلب من أفضل المطاعم المحلية وتمتع بتوصيل سريع إلى باب منزلك</p>
            
            {/* Search Form with location */}
            <div className="bg-white p-2 rounded-lg shadow-lg mb-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row">
                <div className="flex items-center bg-neutral-100 px-3 py-2 rounded-lg mb-2 sm:mb-0 sm:ml-2">
                  <MapPinIcon className="text-primary h-5 w-5 ml-2" />
                  <input 
                    type="text" 
                    placeholder="العنوان" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-transparent w-full focus:outline-none text-neutral-800"
                  />
                </div>
                <div className="relative flex-grow">
                  <input 
                    type="text" 
                    placeholder="ابحث عن مطعم أو طعام..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-lg focus:outline-none"
                  />
                  <Button type="submit" className="absolute left-1 top-1 rounded-lg">
                    <SearchIcon className="h-4 w-4 ml-1" /> بحث
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="flex items-center text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full ml-2 flex items-center">
                <ClockIcon className="h-4 w-4 ml-1" /> توصيل سريع
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full flex items-center">
                <UtensilsIcon className="h-4 w-4 ml-1" /> +500 مطعم
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 mt-8 md:mt-0 relative z-10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="طبق عربي شهي" 
              className="rounded-lg w-full object-cover h-64 md:h-80 shadow-xl" 
            />
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/30 rounded-full blur-xl"></div>
      <div className="absolute top-10 right-10 w-20 h-20 bg-secondary/20 rounded-full blur-lg"></div>
    </section>
  );
}
