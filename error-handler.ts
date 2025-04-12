import { AxiosError } from 'axios';
import { toast } from '@/components/ui/use-toast';

/**
 * معالج الأخطاء العام للطلبات API
 * @param error الخطأ المستلم من الطلب
 * @param defaultMessage رسالة الخطأ الافتراضية
 */
export const handleApiError = (error: unknown, defaultMessage = 'حدث خطأ أثناء معالجة طلبك') => {
  console.error('API Error:', error);
  
  // التحقق من نوع الخطأ
  if (error instanceof AxiosError) {
    // استخراج رسالة الخطأ من استجابة الخادم إذا كانت متوفرة
    const serverError = error.response?.data?.error || error.response?.data?.message;
    const statusCode = error.response?.status;
    
    // معالجة أنواع مختلفة من أخطاء HTTP
    if (statusCode === 401) {
      toast({
        title: 'غير مصرح به',
        description: 'انتهت جلستك أو أنت غير مسجل الدخول. يرجى تسجيل الدخول مرة أخرى.',
        variant: 'destructive',
      });
      
      // يمكن إضافة إعادة توجيه إلى صفحة تسجيل الدخول هنا
      return;
    }
    
    if (statusCode === 403) {
      toast({
        title: 'غير مسموح',
        description: 'ليس لديك صلاحية للوصول إلى هذا المورد.',
        variant: 'destructive',
      });
      return;
    }
    
    if (statusCode === 404) {
      toast({
        title: 'غير موجود',
        description: 'المورد المطلوب غير موجود.',
        variant: 'destructive',
      });
      return;
    }
    
    if (statusCode === 422 || statusCode === 400) {
      // أخطاء التحقق من صحة البيانات
      const validationErrors = error.response?.data?.details;
      
      if (validationErrors && Array.isArray(validationErrors)) {
        // عرض أول خطأ تحقق
        toast({
          title: 'خطأ في البيانات المدخلة',
          description: validationErrors[0].message || serverError || defaultMessage,
          variant: 'destructive',
        });
        return;
      }
      
      // عرض رسالة الخطأ العامة من الخادم
      toast({
        title: 'خطأ في البيانات المدخلة',
        description: serverError || defaultMessage,
        variant: 'destructive',
      });
      return;
    }
    
    // أخطاء الخادم
    if (statusCode >= 500) {
      toast({
        title: 'خطأ في الخادم',
        description: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.',
        variant: 'destructive',
      });
      return;
    }
    
    // رسالة خطأ عامة من الخادم
    if (serverError) {
      toast({
        title: 'خطأ',
        description: typeof serverError === 'string' ? serverError : defaultMessage,
        variant: 'destructive',
      });
      return;
    }
  }
  
  // رسالة خطأ افتراضية لأي نوع آخر من الأخطاء
  toast({
    title: 'خطأ',
    description: defaultMessage,
    variant: 'destructive',
  });
};

/**
 * معالج الأخطاء للطلبات التي تتطلب اتصالاً بالإنترنت
 * @param callback الدالة التي ستنفذ الطلب
 * @param errorMessage رسالة الخطأ الافتراضية
 */
export const withErrorHandling = async <T>(
  callback: () => Promise<T>,
  errorMessage = 'حدث خطأ أثناء معالجة طلبك'
): Promise<T | null> => {
  try {
    // التحقق من حالة الاتصال بالإنترنت
    if (!navigator.onLine) {
      toast({
        title: 'لا يوجد اتصال بالإنترنت',
        description: 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
        variant: 'destructive',
      });
      return null;
    }
    
    // تنفيذ الطلب
    return await callback();
  } catch (error) {
    handleApiError(error, errorMessage);
    return null;
  }
};

export default {
  handleApiError,
  withErrorHandling,
};
