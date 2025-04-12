import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * وسيط للتحقق من صحة البيانات المدخلة باستخدام مخططات Zod
 * @param schema مخطط Zod للتحقق من صحة البيانات
 * @param source مصدر البيانات (body, query, params)
 */
const validateRequest = (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // التحقق من صحة البيانات باستخدام المخطط المحدد
      const data = await schema.parseAsync(req[source]);
      
      // تخزين البيانات التي تم التحقق منها في الطلب
      req[source] = data;
      
      next();
    } catch (error) {
      // معالجة أخطاء التحقق من صحة البيانات
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          error: 'خطأ في التحقق من صحة البيانات',
          details: formattedErrors
        });
      }
      
      // إذا كان الخطأ ليس من نوع ZodError، قم بتمريره إلى معالج الأخطاء التالي
      next(error);
    }
  };
};

export default validateRequest;
