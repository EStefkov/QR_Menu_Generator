import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

function CartIcon() {
  const { cart } = useCart();
  
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <Link to="/cart" className="group -m-2 p-2 flex items-center">
      <ShoppingCartIcon
        className="flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
      {itemCount > 0 && (
        <span className="ml-2 text-sm font-medium text-white bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
      <span className="sr-only">items in cart, view cart</span>
    </Link>
  );
}

export default CartIcon; 