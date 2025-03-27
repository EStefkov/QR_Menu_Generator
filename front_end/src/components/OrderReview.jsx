import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { HiOutlineChevronLeft } from 'react-icons/hi';

function OrderReview() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    tableNumber: '',
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const order = {
        items: cart,
        totalAmount: totalPrice,
        customerInfo,
        orderDate: new Date().toISOString()
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      const data = await response.json();
      clearCart();
      navigate(`/order-confirmation/${data.id}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('There was an error submitting your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-0">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Your cart is empty</h1>
          <p className="mt-4 text-gray-500">Please add items before proceeding to checkout.</p>
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
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto lg:max-w-none">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6"
          >
            <HiOutlineChevronLeft className="mr-1 h-5 w-5" aria-hidden="true" />
            Back to cart
          </button>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Order Review</h1>
        
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmitOrder}>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-10">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Please enter your details below.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={customerInfo.name}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={customerInfo.email}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={customerInfo.phone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700">
                          Table number
                        </label>
                        <input
                          type="text"
                          name="tableNumber"
                          id="tableNumber"
                          value={customerInfo.tableNumber}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
                          Special requests
                        </label>
                        <textarea
                          name="specialRequests"
                          id="specialRequests"
                          rows="3"
                          value={customerInfo.specialRequests}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 lg:hidden">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500"
                  >
                    {isSubmitting ? 'Processing...' : 'Place order'}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-10 lg:mt-0 lg:col-span-5">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <dl className="divide-y divide-gray-200">
                    {cart.map((item) => (
                      <div key={item.id} className="py-4 flex items-center justify-between">
                        <dt className="text-sm text-gray-600 flex items-center">
                          <span className="font-medium text-gray-900 mr-2">{item.quantity} ×</span>
                          {item.name}
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</dd>
                      </div>
                    ))}
                    
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-base font-medium text-gray-900">Subtotal</dt>
                      <dd className="text-base font-medium text-gray-900">${totalPrice.toFixed(2)}</dd>
                    </div>
                  </dl>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      form="orderForm"
                      disabled={isSubmitting}
                      onClick={handleSubmitOrder}
                      className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-blue-500"
                    >
                      {isSubmitting ? 'Processing...' : 'Place order'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderReview; 