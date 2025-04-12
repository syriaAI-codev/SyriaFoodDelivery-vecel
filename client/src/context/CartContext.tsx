import { createContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: number;
  menuItemId: number;
  quantity: number;
  price: number;
  totalPrice: number;
  notes: string | null;
  name: string;
  image?: string;
  restaurantId: number;
  restaurantName: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  cartOpen: boolean;
  toggleCart: () => void;
  promoCode: string | null;
  promoDiscount: number;
  applyPromoCode: (code: string, total: number) => Promise<boolean>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const { toast } = useToast();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  // Check if we're adding from the same restaurant - don't mix items from different restaurants
  const validateRestaurant = (item: CartItem): boolean => {
    if (cartItems.length === 0) return true;
    
    const existingRestaurantId = cartItems[0].restaurantId;
    if (item.restaurantId !== existingRestaurantId) {
      toast({
        title: "لا يمكن إضافة منتجات من مطاعم مختلفة",
        description: "يجب إتمام الطلب الحالي أو إفراغ السلة أولاً",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const addToCart = (item: CartItem) => {
    // Validate the restaurant
    if (!validateRestaurant(item)) return;
    
    // Check if the item already exists in the cart
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.menuItemId === item.menuItemId
    );

    if (existingItemIndex !== -1) {
      // Update the existing item
      const updatedCartItems = [...cartItems];
      const existingItem = updatedCartItems[existingItemIndex];
      
      updatedCartItems[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity,
        totalPrice: existingItem.totalPrice + item.totalPrice,
      };
      
      setCartItems(updatedCartItems);
      
      toast({
        title: "تمت إضافة المزيد إلى السلة",
        description: `${item.name} (${item.quantity}x)`,
      });
    } else {
      // Add the new item
      setCartItems([...cartItems, item]);
      
      toast({
        title: "تمت الإضافة إلى السلة",
        description: `${item.name} (${item.quantity}x)`,
      });
    }

    // Open the cart when adding an item
    setCartOpen(true);
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedCartItems = cartItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          quantity,
          totalPrice: (item.price * quantity),
        };
      }
      return item;
    });
    
    setCartItems(updatedCartItems);
  };

  const removeFromCart = (id: number) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCartItems);
    
    if (updatedCartItems.length === 0) {
      // Clear promo code if cart is empty
      setPromoCode(null);
      setPromoDiscount(0);
    }
    
    toast({
      title: "تمت إزالة العنصر من السلة",
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoCode(null);
    setPromoDiscount(0);
    
    toast({
      title: "تم إفراغ السلة",
    });
  };

  const applyPromoCode = async (code: string, total: number): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/promotions/validate', { code, total });
      const data = await response.json();
      
      if (data.success && data.data) {
        const promotion = data.data;
        setPromoCode(code);
        setPromoDiscount(promotion.discountAmount);
        
        toast({
          title: "تم تطبيق الكود بنجاح",
          description: `خصم ${promotion.discountAmount} ل.س`,
        });
        
        return true;
      } else {
        setPromoCode(null);
        setPromoDiscount(0);
        
        toast({
          title: "كود خصم غير صالح",
          description: data.error || "الكود غير صالح أو منتهي الصلاحية",
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      
      toast({
        title: "خطأ في تطبيق الكود",
        description: "حدث خطأ أثناء التحقق من كود الخصم",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartOpen,
        toggleCart,
        promoCode,
        promoDiscount,
        applyPromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};