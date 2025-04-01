import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineX,
  HiOutlinePrinter
} from 'react-icons/hi';

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        setOrder(data);
        
        // Generate QR code for this order
        if (data) {
          generateQRCode(data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Could not load order details. Please try again later.');
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
  
  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      const updatedOrder = await response.json();
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-12 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-12 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <HiOutlineX className="h-5 w-5 text-red-400 dark:text-red-300" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/orders')}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900"
                  >
                    <HiOutlineArrowLeft className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                    Back to Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-12 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Order not found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">The order you're looking for doesn't exist or has been removed.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/admin/orders')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
              >
                <HiOutlineArrowLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 pt-12 pb-20 print:bg-white print:pt-4 print:pb-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
          >
            <HiOutlineArrowLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Back to Orders
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
          >
            <HiOutlinePrinter className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Print
          </button>
        </div>
        
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg print:shadow-none">
          <div className="border-b border-gray-700 px-4 py-5 sm:px-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-white">
                Order #{order.id}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-400">
                Placed on {formatDate(order.orderDate)}
              </p>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center
              ${order.status?.toLowerCase() === 'completed' 
                ? 'bg-green-800 text-green-100' 
                : order.status?.toLowerCase() === 'cancelled' 
                ? 'bg-red-800 text-red-100'
                : 'bg-yellow-800 text-yellow-100'
              }`}
            >
              {order.status?.toLowerCase() === 'completed' ? (
                <HiOutlineCheckCircle className="mr-1 h-4 w-4" />
              ) : order.status?.toLowerCase() === 'cancelled' ? (
                <HiOutlineX className="mr-1 h-4 w-4" />
              ) : (
                <HiOutlineClock className="mr-1 h-4 w-4" />
              )}
              {(order.status || 'PENDING').replace('_', ' ')}
            </div>
          </div>
          
          <div className="border-b border-gray-700 px-4 py-5 sm:p-6">
            <h4 className="text-base font-medium text-white mb-4">Customer Information</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-400">Name</dt>
                <dd className="mt-1 text-sm text-white">{order.customerInfo?.name || '—'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-400">Email</dt>
                <dd className="mt-1 text-sm text-white">{order.customerInfo?.email || '—'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-400">Phone</dt>
                <dd className="mt-1 text-sm text-white">{order.customerInfo?.phone || '—'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-400">Table Number</dt>
                <dd className="mt-1 text-sm text-white">{order.customerInfo?.tableNumber || '—'}</dd>
              </div>
              
              {order.customerInfo?.specialRequests && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-400">Special Requests</dt>
                  <dd className="mt-1 text-sm text-white py-2 px-3 bg-gray-700 rounded">
                    {order.customerInfo.specialRequests}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          
          <div className="border-b border-gray-700 px-4 py-5 sm:p-6">
            <h4 className="text-base font-medium text-white mb-4">Order Items</h4>
            <div className="flow-root">
              <ul className="-my-6 divide-y divide-gray-700">
                {order.items.map((item, index) => (
                  <li key={index} className="py-4 flex">
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between text-sm font-medium">
                        <h5 className="text-white">
                          {item.quantity} × {item.name}
                        </h5>
                        <p className="ml-4 text-white">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">${item.price.toFixed(2)} each</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-6 border-t border-gray-700 pt-4">
              <div className="flex justify-between text-base font-medium text-white">
                <p>Total</p>
                <p>${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6 print:hidden">
            <h4 className="text-base font-medium text-white mb-4">Update Order Status</h4>
            <div className="mt-2 flex space-x-3">
              <button
                type="button"
                onClick={() => updateOrderStatus('PENDING')}
                disabled={updatingStatus || order.status === 'PENDING'}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                  ${order.status === 'PENDING' ? 
                    'bg-yellow-900 text-yellow-100 border-yellow-700 cursor-not-allowed' : 
                    'border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-900`}
              >
                <HiOutlineClock className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Pending
              </button>
              
              <button
                type="button"
                onClick={() => updateOrderStatus('COMPLETED')}
                disabled={updatingStatus || order.status === 'COMPLETED'}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                  ${order.status === 'COMPLETED' ? 
                    'bg-green-900 text-green-100 border-green-700 cursor-not-allowed' : 
                    'border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900`}
              >
                <HiOutlineCheckCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Completed
              </button>
              
              <button
                type="button"
                onClick={() => updateOrderStatus('CANCELLED')}
                disabled={updatingStatus || order.status === 'CANCELLED'}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                  ${order.status === 'CANCELLED' ? 
                    'bg-red-900 text-red-100 border-red-700 cursor-not-allowed' : 
                    'border-gray-600 text-gray-200 bg-gray-800 hover:bg-gray-700'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900`}
              >
                <HiOutlineX className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Cancelled
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-700 px-4 py-5 sm:p-6">
            <h4 className="text-base font-medium text-white mb-4">Order QR Code</h4>
            <div className="flex justify-center">
              <div className="p-4 bg-white border border-gray-700 rounded-lg">
                {qrCode ? (
                  <img src={qrCode} alt="Order QR code" className="h-48 w-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-800">
                    <p className="text-sm text-gray-400">Loading QR code...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail; 