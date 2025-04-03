import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus, HiOutlineShoppingCart, HiOutlineChevronLeft } from 'react-icons/hi';
import { CartContext } from '../contexts/CartContext';

function Cart() {
  const { cartItems, removeFromCart, updateCartItemQuantity, clearCart, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();
  
  if (!cartItems) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="p-4 sm:p-6 text-blue-300 animate-pulse text-base sm:text-xl">
          Зареждане на количката...
        </div>
      </div>
    );
  }
  
  const itemCount = cartItems?.length || 0;
  
  const handleCheckout = () => {
    navigate('/order-review');
  };
  
  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8">
        <div className="max-w-2xl mx-auto py-8 sm:py-16 px-4 sm:px-6 lg:px-0">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 rounded-full bg-gray-800 flex items-center justify-center">
              <HiOutlineShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Your cart is empty
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400">Add some items to your cart to continue.</p>
            <div className="mt-6 sm:mt-8">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition transform hover:scale-105"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6 sm:mb-8">
          <button 
            onClick={() => navigate('/')}
            className="mr-3 sm:mr-4 flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <HiOutlineChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" /> Back
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Shopping Cart</h1>
        </div>
        
        <div className="mb-6 sm:mb-8 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
          <div className="p-4 sm:p-6">
            <ul className="divide-y divide-gray-700 divide-opacity-50">
              {cartItems.map(item => (
                <li key={item.productId || item.id} className="py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center">
                  {item.image && (
                    <div className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden shadow-md mx-auto sm:mx-0 mb-3 sm:mb-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="sm:ml-6 flex-1 flex flex-col">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between text-base font-medium">
                        <h3 className="text-white text-center sm:text-left">{item.name}</h3>
                        <p className="text-blue-300 font-semibold text-center sm:text-right sm:ml-4 mt-1 sm:mt-0">
                          ${(((item.productPrice || item.price) || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                        ${((item.productPrice || item.price) || 0).toFixed(2)} each
                      </p>
                    </div>
                    
                    <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-end justify-between text-sm mt-4 gap-3 sm:gap-0">
                      <div className="flex items-center bg-gray-900 rounded-full overflow-hidden shadow-inner border border-gray-700">
                        <button
                          type="button"
                          className="p-1.5 sm:p-2 text-gray-300 hover:text-blue-300 hover:bg-gray-800 transition-colors"
                          onClick={() => updateCartItemQuantity(item.productId || item.id, item.quantity - 1)}
                        >
                          <HiOutlineMinus className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                        </button>
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-white text-sm sm:text-base font-medium">{item.quantity || 1}</span>
                        <button
                          type="button"
                          className="p-1.5 sm:p-2 text-gray-300 hover:text-blue-300 hover:bg-gray-800 transition-colors"
                          onClick={() => updateCartItemQuantity(item.productId || item.id, item.quantity + 1)}
                        >
                          <HiOutlinePlus className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="font-medium text-red-400 hover:text-red-300 transition-colors flex items-center px-3 py-1 rounded-lg hover:bg-red-900 hover:bg-opacity-30 text-xs sm:text-sm"
                        onClick={() => removeFromCart(item.productId || item.id)}
                      >
                        <HiOutlineTrash className="h-3 w-3 sm:h-4 sm:w-4 mr-1" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-700">
          <div className="flex justify-between text-base sm:text-lg font-semibold mb-3 sm:mb-4">
            <p className="text-gray-300">Subtotal</p>
            <p className="text-blue-300">${(cartTotal || 0).toFixed(2)}</p>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Shipping and taxes calculated at checkout.</p>
          
          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={handleCheckout}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm sm:text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Proceed to Checkout
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl bg-gray-700 bg-opacity-50 text-gray-200 text-sm sm:text-base font-medium shadow-lg border border-gray-600 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue Shopping
            </button>
            
            <button
              type="button"
              onClick={clearCart}
              className="w-full text-center py-2 text-xs sm:text-sm font-medium text-red-400 hover:text-red-300 transition-colors hover:bg-red-900 hover:bg-opacity-30 rounded-lg"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart; 