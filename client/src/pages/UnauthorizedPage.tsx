import { Link } from 'wouter';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 rounded-full bg-amber-100 p-4 text-amber-600">
        <ShieldAlert className="h-10 w-10" />
      </div>
      
      <h1 className="mb-2 text-3xl font-bold">غير مصرح بالوصول</h1>
      
      <p className="mb-6 max-w-md text-gray-600">
        عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة. قد تحتاج إلى تسجيل الدخول بحساب مناسب 
        أو التواصل مع المسؤول للحصول على الصلاحيات المناسبة.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button className="bg-primary text-white hover:bg-primary/90">
            العودة للصفحة الرئيسية
          </Button>
        </Link>
        
        {user ? (
          <Button 
            variant="outline" 
            onClick={logout}
          >
            تسجيل الخروج
          </Button>
        ) : (
          <Link href="/login">
            <Button variant="outline">
              تسجيل الدخول
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}