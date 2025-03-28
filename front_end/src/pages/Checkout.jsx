import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { HiShoppingCart, HiCheck, HiOutlineRefresh, HiChevronLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cartItems, cartTotal, loading, error, checkoutCart } = useCart();
  const { userData, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    note: ''
  });
  
  useEffect(() => {
    // If cart is empty, redirect to home
    if (cartItems.length === 0 && !loading) {
      toast.info('Your cart is empty');
      navigate('/');
    }
    
    // If user is logged in, prefill customer info
    if (isAuthenticated && userData) {
      setCustomerInfo(prev => ({
        ...prev,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.username || '',
        phone: userData.phoneNumber || '',
        address: userData.address || ''
      }));
    }
  }, [cartItems, loading, isAuthenticated, userData, navigate]);
  
  useEffect(() => {
    // Show error if any
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    let isValid = true;
    let errorMessage = '';
    
    requiredFields.forEach(field => {
      if (!customerInfo[field]) {
        isValid = false;
        errorMessage = `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    });
    
    // Basic email validation
    if (customerInfo.email && !customerInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
    
    // Basic phone validation
    if (customerInfo.phone && !customerInfo.phone.match(/^[0-9+\s()-]{8,15}$/)) {
      isValid = false;
      errorMessage = 'Please enter a valid phone number';
    }
    
    if (!isValid) {
      toast.error(errorMessage);
    }
    
    return isValid;
  };
  
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setOrderProcessing(true);
    
    try {
      const result = await checkoutCart();
      
      if (result.success) {
        toast.success('Order placed successfully!');
        
        // Navigate to order confirmation page with the new order ID
        navigate(`/order-confirmation/${result.orderId}`, { 
          state: { 
            orderData: result.data,
            customerInfo
          } 
        });
      } else {
        toast.error(result.error || 'Failed to place order');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while processing your order');
    } finally {
      setOrderProcessing(false);
    }
  };
  
  const navigateBack = () => {
    navigate(-1);
  };
  
  // Show loading state if cart is still loading
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
          <HiOutlineRefresh className="text-3xl animate-spin" />
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={navigateBack} 
          className="flex items-center gap-2 mr-4 text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <HiChevronLeft className="text-xl" /> Back
        </button>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <HiShoppingCart className="text-2xl" /> Checkout
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Customer Information</h2>
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-600 mb-1">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={customerInfo.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={orderProcessing}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-600 mb-1">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={customerInfo.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={orderProcessing}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm font-medium text-gray-600 mb-1">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                    disabled={orderProcessing}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-600 mb-1">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    required
                    disabled={orderProcessing}
                    className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label htmlFor="address" className="text-sm font-medium text-gray-600 mb-1">Delivery Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  disabled={orderProcessing}
                  className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              
              <div className="flex flex-col">
                <label htmlFor="note" className="text-sm font-medium text-gray-600 mb-1">Order Notes</label>
                <textarea
                  id="note"
                  name="note"
                  value={customerInfo.note}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Special instructions for your order"
                  disabled={orderProcessing}
                  className="p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={navigateBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={orderProcessing}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={orderProcessing || cartItems.length === 0}
                >
                  {orderProcessing ? (
                    <>
                      <HiOutlineRefresh className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <HiCheck /> Place Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex gap-2">
                    <div className="font-medium text-gray-600">{item.quantity}x</div>
                    <div>{item.name}</div>
                  </div>
                  <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-lg font-semibold pt-4 border-t border-gray-200">
              <span>Total:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 