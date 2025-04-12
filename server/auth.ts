import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

// تكوين المتغيرات البيئية
const JWT_SECRET = process.env.JWT_SECRET || "syria-food-app-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_SALT_ROUNDS = 10;

// مخطط التحقق من صحة بيانات تسجيل الدخول
const loginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
});

// دالة إنشاء رمز JWT
export const generateToken = (userId: number, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// دالة التحقق من رمز JWT
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// دالة تشفير كلمة المرور
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

// دالة التحقق من كلمة المرور
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// وسيط التحقق من المصادقة
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // استخراج رمز المصادقة من رأس الطلب
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "غير مصرح، يرجى تسجيل الدخول",
      });
    }

    // التحقق من صحة الرمز
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "الرمز غير صالح أو منتهي الصلاحية",
      });
    }

    // إضافة معلومات المستخدم إلى الطلب
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "خطأ في المصادقة",
    });
  }
};

// وسيط التحقق من الدور
export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          success: false,
          message: "غير مصرح، يرجى تسجيل الدخول",
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "غير مسموح، ليس لديك صلاحية كافية",
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: "خطأ في التحقق من الصلاحيات",
      });
    }
  };
};

// وسيط الحماية من هجمات CSRF
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // التحقق من وجود رأس CSRF
  const csrfToken = req.headers["x-csrf-token"];
  const storedToken = req.cookies["csrf_token"];

  if (!csrfToken || !storedToken || csrfToken !== storedToken) {
    return res.status(403).json({
      success: false,
      message: "فشل التحقق من CSRF",
    });
  }

  next();
};

// وسيط الحماية من هجمات XSS
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // إضافة رؤوس الحماية من XSS
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
};

// وسيط تحديد معدل الطلبات
export const rateLimiter = (windowMs: number, maxRequests: number) => {
  const requests = new Map();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || "";
    const now = Date.now();
    
    // تنظيف الطلبات القديمة
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter((time: number) => now - time < windowMs);
      
      if (userRequests.length >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: "تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً",
        });
      }
      
      userRequests.push(now);
      requests.set(ip, userRequests);
    } else {
      requests.set(ip, [now]);
    }
    
    next();
  };
};

// دالة تسجيل الدخول
export const login = async (req: Request, res: Response) => {
  try {
    // التحقق من صحة البيانات
    const validatedData = loginSchema.parse(req.body);
    
    // البحث عن المستخدم
    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }
    
    // التحقق من كلمة المرور
    const isPasswordValid = await comparePassword(validatedData.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }
    
    // إنشاء رمز JWT
    const token = generateToken(user.id, user.role);
    
    // إنشاء رمز CSRF
    const csrfToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
    
    // تعيين ملف تعريف الارتباط
    res.cookie("csrf_token", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // ساعة واحدة
    });
    
    return res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "بيانات غير صالحة",
        errors: error.errors,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
    });
  }
};

// دالة تسجيل الخروج
export const logout = (req: Request, res: Response) => {
  // مسح ملف تعريف الارتباط
  res.clearCookie("csrf_token");
  
  return res.status(200).json({
    success: true,
    message: "تم تسجيل الخروج بنجاح",
  });
};

// تصدير الدوال والوسائط
export default {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authMiddleware,
  roleMiddleware,
  csrfProtection,
  xssProtection,
  rateLimiter,
  login,
  logout,
};
