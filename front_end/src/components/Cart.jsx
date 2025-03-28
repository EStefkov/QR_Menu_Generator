import React, { useContext } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus } from 'react-icons/hi';
import { CartContext } from '../contexts/CartContext';

function Cart() {
  const { cartItems, removeFromCart, updateCartItemQuantity, clearCart, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();
  
  if (!cartItems) {
    return <div className="p-4">Зареждане на количката...</div>;
  }
  
  const itemCount = cartItems?.length || 0;
  
  const handleCheckout = () => {
    navigate('/order-review');
  };
  
  if (itemCount === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-0">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Your cart is empty</h1>
          <p className="mt-4 text-gray-500">Add some items to your cart to continue.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Shopping Cart</h1>
        
        <div className="mt-8">
          <div className="flow-root">
            <ul className="-my-6 divide-y divide-gray-200">
              {cartItems.map(item => (
                <li key={item.id} className="py-6 flex">
                  {item.image && (
                    <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    
                    <div className="flex-1 flex items-end justify-between text-sm">
                      <div className="flex items-center border rounded-md">
                        <button
                          type="button"
                          className="p-2 text-gray-500 hover:text-gray-700"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        >
                          <HiOutlineMinus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="px-3 py-1 text-gray-700">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-2 text-gray-500 hover:text-gray-700"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >
                          <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="font-medium text-red-600 hover:text-red-500 flex items-center"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <HiOutlineTrash className="h-4 w-4 mr-1" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>Subtotal</p>
            <p>${cartTotal.toFixed(2)}</p>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
          
          <div className="mt-6 space-y-3">
            <button
              onClick={handleCheckout}
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Checkout
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue Shopping
            </button>
            
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-medium text-red-600 hover:text-red-500 w-full text-center mt-4"
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