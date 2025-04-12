import { useState } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      setLocation('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول، يرجى التحقق من بياناتك');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
              <p className="mt-2 text-sm text-gray-600">
                أدخل بيانات الدخول الخاصة بك للوصول إلى حسابك
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="your@email.com"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    كلمة المرور
                  </label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    نسيت كلمة المرور؟
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              ليس لديك حساب؟{' '}
              <Link href="/signup">
                <a className="text-primary hover:underline">إنشاء حساب جديد</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}