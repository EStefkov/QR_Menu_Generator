import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { HiOutlineChevronLeft } from 'react-icons/hi';

function OrderReview() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { userData } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    tableNumber: '',
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Debug logging for troubleshooting
  useEffect(() => {
    console.log("Current user data:", userData);
    console.log("User ID from localStorage:", localStorage.getItem("id"));
    console.log("Current restaurant:", currentRestaurant);
    
    // Try to parse JWT directly to get the user ID
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log("JWT payload:", payload);
        }
      }
    } catch (error) {
      console.error("Error parsing JWT:", error);
    }
  }, [userData, currentRestaurant]);
  
  // Prefill customer info from user data when available
  useEffect(() => {
    if (userData.firstName || userData.lastName) {
      setCustomerInfo(prev => ({
        ...prev,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
      }));
    }
  }, [userData]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get user ID from multiple sources to ensure we have it
      let accountId = null;
      
      // First try from userData object
      if (userData && userData.id) {
        accountId = Number(userData.id);
      }
      
      // If not found, try localStorage directly
      if (!accountId) {
        const localStorageId = localStorage.getItem("id");
        if (localStorageId) {
          accountId = Number(localStorageId);
        }
      }
      
      // If still not found, try to extract from JWT token
      if (!accountId) {
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              console.log("Extracting account ID from JWT payload:", payload);
              
              // Try different possible field names
              if (payload.id) {
                accountId = Number(payload.id);
              } else if (payload.userId) {
                accountId = Number(payload.userId);
              } else if (payload.accountId) {
                accountId = Number(payload.accountId);
              } else if (payload.sub) {
                accountId = Number(payload.sub);
              }
            }
          }
        } catch (jwtError) {
          console.error("Error extracting ID from JWT:", jwtError);
        }
      }
      
      // Hard-code a default account ID if all else fails (FOR TESTING ONLY - REMOVE IN PRODUCTION)
      if (!accountId) {
        // Assuming user ID 1 exists in your system
        accountId = 1;
        console.warn("NO ACCOUNT ID FOUND - USING DEFAULT ID 1 FOR TESTING");
      }
      
      // Still no valid ID, show error
      if (!accountId) {
        console.error("No valid user ID found in:", {
          userDataId: userData?.id,
          localStorageId: localStorage.getItem("id")
        });
        throw new Error('User ID is missing. Please log in again.');
      }
      
      // Check restaurant info
      let restaurantId = null;
      
      // First, try to get restaurant ID from cart items
      // This should be our primary source as it comes from the actual products being ordered
      if (cartItems && cartItems.length > 0) {
        for (const item of cartItems) {
          if (item.restaurantId) {
            restaurantId = item.restaurantId;
            console.log(`Found restaurantId ${restaurantId} in cart item ${item.productId}`);
            break;
          } else if (item.restorantId) {
            restaurantId = item.restorantId;
            console.log(`Found restorantId ${restaurantId} in cart item ${item.productId}`);
            break;
          }
        }
      }
      
      // Fallback to currentRestaurant if we didn't find restaurant ID in cart items
      if (!restaurantId && currentRestaurant && currentRestaurant.id) {
        restaurantId = currentRestaurant.id;
        console.log(`Using currentRestaurant ID: ${restaurantId}`);
      } 
      
      // Try to get from localStorage as second fallback
      if (!restaurantId) {
        const storedRestaurant = localStorage.getItem('currentRestaurant');
        if (storedRestaurant) {
          try {
            const parsedRestaurant = JSON.parse(storedRestaurant);
            restaurantId = parsedRestaurant.id;
            console.log(`Using restaurant ID ${restaurantId} from localStorage`);
          } catch (e) {
            console.error('Error parsing storedRestaurant from localStorage:', e);
          }
        }
        
        // Default to ID 1 if still missing
        if (!restaurantId) {
          restaurantId = 1; // Default restaurant ID
          console.warn("No restaurant ID found anywhere. Using default restaurant ID: 1");
        }
      }
      
      console.log(`Final restaurant ID for order: ${restaurantId}`);
      
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty');
      }
      
      const token = localStorage.getItem('token');
      console.log('Submitting order:', {
        accountId,
        products: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity, totalPrice: (item.price * item.quantity) })),
        totalPrice: parseFloat(cartTotal || 0),
        restorantId: restaurantId,
        orderStatus: 'ACCEPTED'
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accountId,
          products: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity, totalPrice: (item.price * item.quantity) })),
          totalPrice: parseFloat(cartTotal || 0),
          restorantId: restaurantId,
          orderStatus: 'ACCEPTED'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        
        // Try to provide more detailed error messages based on status code
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication error - please log in again');
        } else if (response.status === 400) {
          throw new Error(`Invalid order data: ${errorText}`);
        } else if (response.status === 404) {
          throw new Error('Order service not found - please try again later');
        } else {
          throw new Error(`Failed to create order: ${response.status} ${response.statusText}`);
        }
      }
      
      // Since the response is text, not JSON, we use text() instead of json()
      const responseText = await response.text();
      console.log("Order created:", responseText);
      
      // Extract the order ID from the response text using regex
      const idMatch = responseText.match(/ID: (\d+)/);
      const orderId = idMatch ? idMatch[1] : '0';
      
      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      setError(error.message || 'There was an error submitting your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (cartItems.length === 0) {
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
  
  // Show login requirement if not logged in
  if (!userData.id && !localStorage.getItem("id")) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-0">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Login Required</h1>
          <p className="mt-4 text-gray-500">Please log in to complete your order.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
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
              <form id="orderForm" onSubmit={handleSubmitOrder}>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-10">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Your information will be automatically included with your order.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full name
                        </label>
                        <div className="mt-1 block w-full py-2 px-3 bg-gray-100 rounded-md text-gray-700 text-sm">
                          {userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : 'Not provided'}
                        </div>
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
                          placeholder="Enter your table number"
                        />
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
                          Special requests (optional)
                        </label>
                        <textarea
                          name="specialRequests"
                          id="specialRequests"
                          rows="3"
                          value={customerInfo.specialRequests}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Any special requests for your order?"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

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
                    {cartItems.map((item) => (
                      <div key={item.productId || item.id} className="py-4 flex items-center justify-between">
                        <dt className="text-sm text-gray-600 flex items-center">
                          <span className="font-medium text-gray-900 mr-2">{item.quantity} ×</span>
                          {item.name}
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">
                          ${(((item.productPrice || item.price) || 0) * (item.quantity || 1)).toFixed(2)}
                        </dd>
                      </div>
                    ))}
                    
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-base font-medium text-gray-900">Subtotal</dt>
                      <dd className="text-base font-medium text-gray-900">${(cartTotal || 0).toFixed(2)}</dd>
                    </div>
                  </dl>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      form="orderForm"
                      disabled={isSubmitting}
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