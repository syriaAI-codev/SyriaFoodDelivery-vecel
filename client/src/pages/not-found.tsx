import { Link } from 'wouter';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600">
        <AlertTriangle className="h-10 w-10" />
      </div>
      
      <h1 className="mb-2 text-3xl font-bold">صفحة غير موجودة</h1>
      
      <p className="mb-6 max-w-md text-gray-600">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها أو إزالتها.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button className="bg-primary text-white hover:bg-primary/90">
            العودة للصفحة الرئيسية
          </Button>
        </Link>
        
        <Link href="/restaurants">
          <Button variant="outline">
            تصفح المطاعم
          </Button>
        </Link>
      </div>
    </div>
  );
}