import { Restaurant, MenuItem, Category, Order, OrderItem, Promotion, User } from './schema';

// Extended types with UI-specific properties
export interface CartItem extends OrderItem {
  name: string;
  image?: string;
  restaurantName: string;
}

export interface RestaurantWithMenu extends Restaurant {
  menuItems: MenuItem[];
}

export interface OrderWithDetails extends Order {
  restaurant: Restaurant;
  items: (OrderItem & { menuItem: MenuItem })[];
}

// Form schemas
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AddressFormData {
  title: string;
  address: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface CheckoutFormData {
  addressId: number;
  paymentMethod: string;
  notes?: string;
  promoCode?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
