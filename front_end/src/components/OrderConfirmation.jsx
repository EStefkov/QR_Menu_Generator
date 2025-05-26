import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

function OrderConfirmation() {
  const { orderId } = useParams();
  const { userData } = useAuth();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Try to fetch order without authentication first
        let response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/public`);
        
        // If public endpoint fails, try with authentication
        if (!response.ok && userData?.token) {
          response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${userData.token}`
            }
          });
        }
        
        if (!response.ok) {
          throw new Error(t('errors.failedToLoadOrderDetails'));
        }
        
        const data = await response.json();
        
        // Format order data for display
        const formattedOrder = {
          id: data.id,
          orderDate: data.orderTime,
          totalAmount: parseFloat(data.totalPrice),
          status: data.orderStatus,
          items: (data.products || []).map(product => ({
            id: product.productId,
            name: product.productName || `${t('product')} ${product.productId}`,
            price: product.productPriceAtOrder || 0,
            quantity: product.quantity,
            image: product.productImage || '/uploads/default_product.png'
          })),
          customerInfo: {
            name: data.customerName || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
            email: data.customerEmail || userData?.email || '',
            phone: data.customerPhone || userData?.phone || '',
            specialRequests: data.specialRequests || ''
          }
        };
        
        setOrder(formattedOrder);
        
        // Generate QR code for this order
        generateQRCode(formattedOrder);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(t('confirmation.loadError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId, userData, t]);
  
  const generateQRCode = async (orderData) => {
    try {
      // Create the direct order confirmation URL
      const orderConfirmationUrl = `${window.location.origin}/order-confirmation/${orderData.id}`;
      
      // Create QR code with the direct URL
      const qrCodeData = {
        text: orderConfirmationUrl,
        format: 'url',
        size: 300,
        margin: 1,
        errorCorrectionLevel: 'H',
        type: 'url'
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/qrcode/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData?.token || ''}`
        },
        body: JSON.stringify(qrCodeData)
      });
      
      if (!response.ok) {
        throw new Error(t('errors.general'));
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          setQrCode(data.qrCode);
        } else {
          console.error('QR code generation failed:', data.error);
        }
      } else {
        // If the response is not JSON, try to get it as text for QR code image
        const textData = await response.text();
        if (textData) {
          setQrCode(textData);
        }
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-gray-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center">
          <div className="animate-pulse h-8 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gray-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-md bg-red-900 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-200">{t('common.error')}</h3>
              <div className="mt-2 text-sm text-red-100">
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
      <div className="bg-gray-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="bg-green-900 px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <HiOutlineCheckCircle className="h-8 w-8 text-green-400" aria-hidden="true" />
              <h2 className="ml-3 text-2xl font-bold text-green-200">
                {t('confirmation.title')}
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-green-300">
              {t('confirmation.thankYou')}
            </p>
          </div>
          
          <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-400">{t('confirmation.orderNumber')}</dt>
                <dd className="mt-1 text-sm text-gray-200">#{orderId}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-400">{t('confirmation.datePlaced')}</dt>
                <dd className="mt-1 text-sm text-gray-200">{new Date().toLocaleString()}</dd>
              </div>
            </dl>
            
            <div className="mt-8 flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
              >
                {t('confirmation.returnToMenu')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const formattedDate = new Date(order.orderDate).toLocaleString(t('locale'), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="bg-green-900 px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <HiOutlineCheckCircle className="h-8 w-8 text-green-400" aria-hidden="true" />
                <h2 className="ml-3 text-2xl font-bold text-green-200">
                  {t('confirmation.title')}
                </h2>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-green-300">
                {t('confirmation.thankYou')}
              </p>
            </div>
            
            <div className="border-t border-gray-700 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">{t('confirmation.orderNumber')}</dt>
                  <dd className="mt-1 text-sm text-gray-200">#{order.id}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">{t('confirmation.datePlaced')}</dt>
                  <dd className="mt-1 text-sm text-gray-200">{formattedDate}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">{t('confirmation.totalAmount')}</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-200">${(parseFloat(order.totalAmount)).toFixed(2)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-400">{t('order_status')}</dt>
                  <dd className="mt-1 text-sm text-gray-200">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                      {(order.status || 'PENDING').replace('_', ' ')}
                    </span>
                  </dd>
                </div>
                
                {order.customerInfo && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-400">{t('confirmation.customerInformation')}</dt>
                    <dd className="mt-1 text-sm text-gray-200">
                      <address className="not-italic">
                        {order.customerInfo.name}<br />
                        {order.customerInfo.email}<br />
                        {order.customerInfo.phone && (
                          <>{order.customerInfo.phone}<br /></>
                        )}
                      </address>
                    </dd>
                  </div>
                )}
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {t('special_requests')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-200 bg-gradient-to-r from-gray-700 to-gray-800 p-4 rounded-md border-l-4 border-blue-500 shadow-inner">
                    {order.customerInfo?.specialRequests ? (
                      <p className="whitespace-pre-wrap">{order.customerInfo.specialRequests}</p>
                    ) : (
                      <p className="text-gray-500 italic">{t('confirmation.noSpecialRequests')}</p>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="border-t border-gray-700">
              <div className="bg-gray-700 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-200">{t('confirmation.orderItems')}</h3>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <ul className="divide-y divide-gray-700">
                  {order.items.map((item, index) => (
                    <li key={index} className="py-4 flex justify-between items-center">
                      <div className="flex items-center">
                        {item.image && (
                          <img 
                            src={`${import.meta.env.VITE_API_URL}${item.image}`} 
                            alt={item.name}
                            className="h-16 w-16 object-cover rounded-md mr-4"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${import.meta.env.VITE_API_URL}/uploads/default_product.png`;
                            }}
                          />
                        )}
                        <div>
                          <span className="font-medium text-gray-200 mr-2">{item.quantity} ×</span>
                          <span className="text-sm font-medium text-gray-200">{item.name}</span>
                          <p className="text-sm text-gray-400">${parseFloat(item.price).toFixed(2)} {t('cart.each')}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-200">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-200 text-center mb-4">{t('confirmation.orderQrCode')}</h3>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg border border-gray-600">
                        {qrCode ? (
                          <img 
                            src={qrCode} 
                            alt={t('confirmation.orderQrCode')} 
                            className="w-44 h-44 object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${import.meta.env.VITE_API_URL}/uploads/default_qr.png`;
                            }}
                          />
                        ) : (
                          <div className="w-44 h-44 flex items-center justify-center bg-gray-100">
                            <p className="text-sm text-gray-500">{t('confirmation.loadingQrCode')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-4 text-center text-sm text-gray-400">
                      {t('confirmation.showQrCode')}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
                  >
                    {t('confirmation.returnToMenu')}
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