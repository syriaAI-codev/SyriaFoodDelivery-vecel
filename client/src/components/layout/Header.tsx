import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, logout, isCustomer, isRestaurantOwner, isDeliveryPerson, isAdmin } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  return (
    <header className="bg-background shadow-sm">
      <div className="container flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center text-2xl font-bold text-primary">
          {/* You can add a logo image here */}
          <span>توصيل</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8 space-x-reverse">
            <li>
              <Link href="/" className="text-gray-700 hover:text-primary">
                الرئيسية
              </Link>
            </li>
            <li>
              <Link href="/restaurants" className="text-gray-700 hover:text-primary">
                المطاعم
              </Link>
            </li>
            {isAuthenticated && isCustomer && (
              <li>
                <Link href="/profile" className="text-gray-700 hover:text-primary">
                  ملفي الشخصي
                </Link>
              </li>
            )}
            {isAuthenticated && isRestaurantOwner && (
              <li>
                <Link href="/restaurant/dashboard" className="text-gray-700 hover:text-primary">
                  لوحة التحكم
                </Link>
              </li>
            )}
            {isAuthenticated && isDeliveryPerson && (
              <li>
                <Link href="/delivery/dashboard" className="text-gray-700 hover:text-primary">
                  لوحة التحكم
                </Link>
              </li>
            )}
            {isAuthenticated && isAdmin && (
              <li>
                <Link href="/admin/dashboard" className="text-gray-700 hover:text-primary">
                  لوحة تحكم المدير
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Authentication buttons on desktop */}
        <div className="hidden md:block">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2 space-x-reverse rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                <User className="h-5 w-5" />
                <span>{user?.name}</span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 overflow-hidden rounded-md bg-white shadow-lg">
                  <div className="p-2">
                    <Link href="/profile" className="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      الملف الشخصي
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center rounded-md px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="ml-2 h-4 w-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4 space-x-reverse">
              <Link href="/login" className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                تسجيل الدخول
              </Link>
              <Link href="/signup" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="rounded-md p-2 text-gray-700 md:hidden"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="container py-4">
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-700 hover:text-primary"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link 
                  href="/restaurants"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-700 hover:text-primary"
                >
                  المطاعم
                </Link>
              </li>
              {isAuthenticated && isCustomer && (
                <li>
                  <Link 
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-700 hover:text-primary"
                  >
                    ملفي الشخصي
                  </Link>
                </li>
              )}
              {isAuthenticated && isRestaurantOwner && (
                <li>
                  <Link 
                    href="/restaurant/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-700 hover:text-primary"
                  >
                    لوحة التحكم
                  </Link>
                </li>
              )}
              {isAuthenticated && isDeliveryPerson && (
                <li>
                  <Link 
                    href="/delivery/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-700 hover:text-primary"
                  >
                    لوحة التحكم
                  </Link>
                </li>
              )}
              {isAuthenticated && isAdmin && (
                <li>
                  <Link 
                    href="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-700 hover:text-primary"
                  >
                    لوحة تحكم المدير
                  </Link>
                </li>
              )}
              {!isAuthenticated ? (
                <>
                  <li>
                    <Link 
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-gray-700 hover:text-primary"
                    >
                      تسجيل الدخول
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-primary hover:text-primary/90"
                    >
                      إنشاء حساب
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center text-red-600 hover:text-red-700"
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;