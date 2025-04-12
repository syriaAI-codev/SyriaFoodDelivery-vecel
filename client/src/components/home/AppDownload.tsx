import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AppDownload() {
  return (
    <section className="bg-primary/5 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div 
            className="md:w-1/2 mb-6 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-3">حمّل تطبيق طلبلي الآن!</h2>
            <p className="text-neutral-600 mb-6">
              احصل على تجربة أفضل وأسرع باستخدام تطبيقنا المخصص للهواتف الذكية. خصومات حصرية ومزايا إضافية بانتظارك
            </p>
            
            <div className="flex space-x-4 space-x-reverse">
              <Button variant="outline" className="bg-black text-white border-0 px-4 py-2 rounded-lg flex items-center hover:bg-black/90">
                <svg className="h-6 w-6 ml-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div className="text-xs">تحميل على</div>
                  <div className="text-sm font-bold">App Store</div>
                </div>
              </Button>
              
              <Button variant="outline" className="bg-black text-white border-0 px-4 py-2 rounded-lg flex items-center hover:bg-black/90">
                <svg className="h-6 w-6 ml-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div>
                  <div className="text-xs">تحميل على</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="تطبيق طلبلي" 
              className="w-64 h-auto rounded-2xl shadow-lg" 
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
