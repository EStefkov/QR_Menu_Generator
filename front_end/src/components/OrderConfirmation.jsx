import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineCheckCircle } from 'react-icons/hi';

function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        
        const data = await response.json();
        setOrder(data);
        
        // Generate QR code for this order
        generateQRCode(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Could not load order information. Please check your order ID.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
  const generateQRCode = async (orderData) => {
    try {
      const qrCodeData = {
        orderId: orderData.id,
        amount: orderData.totalAmount,
        items: orderData.items.length,
        date: orderData.orderDate
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/qrcode/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(qrCodeData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
      } else {
        console.error('QR code generation failed:', data.error);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center">
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
          <p className="mt-2 text-gray-500">We couldn't find the order you're looking for.</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to menu
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const formattedDate = new Date(order.orderDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="bg-green-50 px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <HiOutlineCheckCircle className="h-8 w-8 text-green-400" aria-hidden="true" />
                <h2 className="ml-3 text-2xl font-bold text-green-800">
                  Order Confirmed!
                </h2>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-green-700">
                Thank you for your order. Your order has been received and is being processed.
              </p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Order number</dt>
                  <dd className="mt-1 text-sm text-gray-900">#{order.id}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Date placed</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formattedDate}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Total amount</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {order.status || 'Pending'}
                    </span>
                  </dd>
                </div>
                
                {order.customerInfo && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Customer information</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <address className="not-italic">
                        {order.customerInfo.name}<br />
                        {order.customerInfo.email}<br />
                        {order.customerInfo.phone && (
                          <>{order.customerInfo.phone}<br /></>
                        )}
                        {order.customerInfo.tableNumber && (
                          <>Table: {order.customerInfo.tableNumber}<br /></>
                        )}
                      </address>
                    </dd>
                  </div>
                )}
                
                {order.customerInfo?.specialRequests && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Special requests</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.customerInfo.specialRequests}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <ul className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <li key={index} className="py-4 flex justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 mr-2">{item.quantity} ×</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 text-center mb-4">Order QR Code</h3>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        {qrCode ? (
                          <img src={qrCode} alt="Order QR code" className="w-44 h-44" />
                        ) : (
                          <div className="w-44 h-44 flex items-center justify-center bg-gray-100">
                            <p className="text-sm text-gray-500">Loading QR code...</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-500">
                      Show this QR code to the restaurant staff when collecting your order.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Return to Menu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation; 