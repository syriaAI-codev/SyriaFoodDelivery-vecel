import { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { X, ShoppingCart } from 'lucide-react';

const CartSidebar = () => {
  const cartContext = useContext(CartContext);

  if (!cartContext) {
    return null;
  }

  const { cartItems, cartOpen, toggleCart, removeFromCart, updateQuantity } = cartContext;

  const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <>
      {/* Cart toggle button on mobile */}
      <button
        onClick={toggleCart}
        className="fixed bottom-20 left-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg md:hidden"
      >
        <ShoppingCart className="h-6 w-6" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Cart sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full transform overflow-y-auto bg-background p-6 shadow-xl transition-transform duration-300 sm:max-w-md ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">سلة التسوق</h2>
          <button
            onClick={toggleCart}
            className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-8">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300" />
              <p className="mt-4 text-lg text-gray-500">سلة التسوق فارغة</p>
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex border-b pb-4">
                    {item.image && (
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="ml-4 flex flex-1 flex-col">
                      <div className="flex justify-between text-base font-medium">
                        <h3>{item.name}</h3>
                        <p className="text-gray-900">{item.totalPrice} ل.س</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{item.restaurantName}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <div className="flex justify-between border-t pt-4 text-base font-medium">
                  <p>المجموع</p>
                  <p>{total} ل.س</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">الضرائب والشحن تحسب عند الدفع</p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      toggleCart();
                      // Navigate to checkout
                      window.location.href = '/checkout';
                    }}
                    className="w-full rounded-md bg-primary px-6 py-3 text-base font-medium text-white"
                  >
                    متابعة الطلب
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/25"
          onClick={toggleCart}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default CartSidebar;