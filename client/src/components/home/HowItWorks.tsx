import { motion } from "framer-motion";
import { StoreIcon, UtensilsIcon, HandMetal } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <StoreIcon className="text-primary text-2xl" />,
      title: "اختر مطعمك",
      description: "تصفح مئات المطاعم القريبة منك واختر ما يناسب ذوقك",
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: <UtensilsIcon className="text-secondary text-2xl" />,
      title: "اختر طعامك",
      description: "اختر من قائمة متنوعة من الأطباق الشهية واضبط طلبك حسب رغبتك",
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    {
      icon: <HandMetal className="text-accent text-2xl" />,
      title: "استمتع بالتوصيل",
      description: "نوصل طلبك بسرعة إلى باب منزلك. يمكنك تتبع طلبك لحظة بلحظة",
      bgColor: "bg-accent/10",
      iconColor: "text-accent"
    }
  ];
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-2xl font-bold text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          كيف يعمل التطبيق
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`w-20 h-20 ${step.bgColor} rounded-full flex items-center justify-center mb-4`}>
                {step.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
