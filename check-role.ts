import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// وسيط للتحقق من الصلاحيات
const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // التحقق من وجود المستخدم في الجلسة (passport)
      if (req.isAuthenticated() && req.user) {
        const userRole = (req.user as any).role;
        
        // التحقق من أن دور المستخدم موجود في قائمة الأدوار المسموح بها
        if (roles.includes(userRole)) {
          return next();
        }
      }
      
      // التحقق من وجود توكن JWT في الكوكيز أو رأس الطلب
      const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'غير مصرح به' });
      }
      
      // التحقق من صحة التوكن
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'talabli_jwt_secret') as { id: number; role: string };
      
      // التحقق من أن دور المستخدم موجود في قائمة الأدوار المسموح بها
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'ليس لديك صلاحية للوصول إلى هذا المورد' });
      }
      
      // إضافة معلومات المستخدم إلى الطلب
      req.user = decoded;
      next();
    } catch (error) {
      console.error('خطأ في التحقق من الصلاحيات:', error);
      return res.status(401).json({ error: 'غير مصرح به' });
    }
  };
};

export default checkRole;
