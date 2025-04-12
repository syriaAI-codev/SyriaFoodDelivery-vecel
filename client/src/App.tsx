import { useEffect } from "react";
import { Switch, Route } from "wouter";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import MobileNavigation from "./components/layout/MobileNavigation";
import HomePage from "./pages/HomePage";
import RestaurantsPage from "./pages/RestaurantsPage";
import RestaurantDetailsPage from "./pages/RestaurantDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CategoriesPage from "./pages/CategoriesPage";
import PopularRestaurantsPage from "./pages/PopularRestaurantsPage";
import PopularDishesPage from "./pages/PopularDishesPage";
import RestaurantDashboardPage from "./pages/restaurant/DashboardPage";
import DeliveryDashboardPage from "./pages/delivery/DashboardPage";
import AdminDashboardPage from "./pages/admin/DashboardPage";
import NotFound from "./pages/not-found";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { AnimatePresence } from "framer-motion";
import CartSidebar from "./components/cart/CartSidebar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import OfflineDetector from "./components/common/OfflineDetector";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";

function App() {
  const { checkAuthStatus } = useAuth();
  
  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/restaurants" component={RestaurantsPage} />
              <Route path="/restaurants/:id">
                {params => <RestaurantDetailsPage id={parseInt(params.id)} />}
              </Route>
              <Route path="/checkout">
                <ProtectedRoute allowedRoles={['customer']}>
                  <CheckoutPage />
                </ProtectedRoute>
              </Route>
              <Route path="/track-order/:id">
                {params => (
                  <ProtectedRoute>
                    <TrackOrderPage />
                  </ProtectedRoute>
                )}
              </Route>
              <Route path="/profile">
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </Route>
              <Route path="/login" component={LoginPage} />
              <Route path="/signup" component={SignupPage} />
              
              {/* Browse pages */}
              <Route path="/categories" component={CategoriesPage} />
              <Route path="/popular-restaurants" component={PopularRestaurantsPage} />
              <Route path="/popular-dishes" component={PopularDishesPage} />
              
              {/* Restaurant routes */}
              <Route path="/restaurant/dashboard">
                <ProtectedRoute allowedRoles={['restaurant']}>
                  <RestaurantDashboardPage />
                </ProtectedRoute>
              </Route>
              
              {/* Delivery routes */}
              <Route path="/delivery/dashboard">
                <ProtectedRoute allowedRoles={['delivery']}>
                  <DeliveryDashboardPage />
                </ProtectedRoute>
              </Route>
              
              {/* Admin routes */}
              <Route path="/admin/dashboard">
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              </Route>
              <Route path="/admin/users">
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              </Route>
              <Route path="/admin/restaurants">
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              </Route>
              <Route path="/admin/orders">
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              </Route>
              <Route path="/admin/delivery">
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              </Route>
              <Route path="/admin/reports">
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              </Route>
              <Route path="/admin/settings">
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              </Route>
              
              {/* Error pages */}
              <Route path="/unauthorized" component={UnauthorizedPage} />
              <Route component={NotFound} />
            </Switch>
          </AnimatePresence>
        </main>
        
        <CartSidebar />
        <MobileNavigation />
        <Footer />
        <Toaster />
        <OfflineDetector />
      </div>
    </ErrorBoundary>
  );
}

export default App;
