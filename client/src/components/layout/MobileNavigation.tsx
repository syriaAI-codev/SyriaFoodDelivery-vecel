import { Link, useLocation } from 'wouter';
import { Home, Search, User, ShoppingBag } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

const MobileNavigation = () => {
  const [location] = useLocation();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return null;
  }

  const { isAuthenticated, isCustomer, isRestaurantOwner, isDeliveryPerson } = authContext;

  // Don't show mobile navigation on restaurant or delivery dashboard
  if (
    (isAuthenticated && isRestaurantOwner && location.includes('/restaurant')) || 
    (isAuthenticated && isDeliveryPerson && location.includes('/delivery'))
  ) {
    return null;
  }

  // For customer or not authenticated users
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-background md:hidden">
      <nav className="flex h-16">
        <Link href="/">
          <a className="flex flex-1 flex-col items-center justify-center">
            <Home className={`h-6 w-6 ${location === '/' ? 'text-primary' : 'text-gray-500'}`} />
            <span className={`mt-1 text-xs ${location === '/' ? 'text-primary' : 'text-gray-500'}`}>
              الرئيسية
            </span>
          </a>
        </Link>
        
        <Link href="/restaurants">
          <a className="flex flex-1 flex-col items-center justify-center">
            <Search className={`h-6 w-6 ${location === '/restaurants' ? 'text-primary' : 'text-gray-500'}`} />
            <span className={`mt-1 text-xs ${location === '/restaurants' ? 'text-primary' : 'text-gray-500'}`}>
              المطاعم
            </span>
          </a>
        </Link>
        
        {isAuthenticated && isCustomer && (
          <Link href="/profile">
            <a className="flex flex-1 flex-col items-center justify-center">
              <User className={`h-6 w-6 ${location === '/profile' ? 'text-primary' : 'text-gray-500'}`} />
              <span className={`mt-1 text-xs ${location === '/profile' ? 'text-primary' : 'text-gray-500'}`}>
                حسابي
              </span>
            </a>
          </Link>
        )}
        
        {!isAuthenticated && (
          <Link href="/login">
            <a className="flex flex-1 flex-col items-center justify-center">
              <User className={`h-6 w-6 ${location === '/login' ? 'text-primary' : 'text-gray-500'}`} />
              <span className={`mt-1 text-xs ${location === '/login' ? 'text-primary' : 'text-gray-500'}`}>
                دخول
              </span>
            </a>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default MobileNavigation;