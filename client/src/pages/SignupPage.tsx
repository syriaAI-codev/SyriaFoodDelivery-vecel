import { useState } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate passwords match
    if (password !== passwordConfirm) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    setIsLoading(true);

    try {
      await signup({
        name,
        email,
        password,
        phone,
        role: 'customer', // Default role for new users
      });
      
      // Redirect to home page after successful signup & auto-login
      setLocation('/');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'فشل إنشاء الحساب، يرجى المحاولة مرة أخرى');
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
              <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
              <p className="mt-2 text-sm text-gray-600">
                أدخل بياناتك للتسجيل في الموقع
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  الاسم الكامل
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="محمد أحمد"
                />
              </div>

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
                <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                  رقم الهاتف
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="+963 xxx xxx xxx"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="8 أحرف على الأقل"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="passwordConfirm" className="mb-2 block text-sm font-medium">
                  تأكيد كلمة المرور
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              لديك حساب بالفعل؟{' '}
              <Link href="/login">
                <a className="text-primary hover:underline">تسجيل الدخول</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}