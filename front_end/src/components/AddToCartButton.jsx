import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';

function AddToCartButton({ product, className = '' }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  
  const handleAddToCart = (e) => {
    // Prevent event propagation to avoid double triggers
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Disable the button while adding to prevent multiple clicks
    if (added) return;
    
    // Add the product to cart with explicitly set quantity of 1
    addToCart(product, 1);
    setAdded(true);
    
    // Reset the "Added" state after a few seconds
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };
  
  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
        added 
          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white' 
          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      disabled={added}
    >
      {added ? (
        <>
          <CheckIcon className="h-5 w-5 mr-2 -ml-1" aria-hidden="true" />
          Added
        </>
      ) : (
        <>
          <ShoppingCartIcon className="h-5 w-5 mr-2 -ml-1" aria-hidden="true" />
          Add to Cart
        </>
      )}
    </button>
  );
}

export default AddToCartButton; 