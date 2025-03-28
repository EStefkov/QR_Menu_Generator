import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../AuthContext';
import { cartApi } from '../api/cartApi';

// Create the context
export const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, userData } = useAuth();
  
  // Fetch the cart from the server when the user logs in
  useEffect(() => {
    async function fetchCart() {
      if (isAuthenticated) {
        try {
          setIsLoading(true);
          const cartData = await cartApi.getCart();
          setCartItems(cartData.items || []);
        } catch (error) {
          console.error("Failed to fetch cart", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear cart when user logs out
        setCartItems([]);
      }
    }
    
    fetchCart();
  }, [isAuthenticated, userData?.id]);
  
  const addToCart = async (product, quantity = 1) => {
    try {
      setIsLoading(true);
      // Ensure quantity is a number and at least 1
      const safeQuantity = Math.max(1, parseInt(quantity) || 1);
      
      if (isAuthenticated) {
        // If user is authenticated, use the API
        const result = await cartApi.addToCart(product.id, safeQuantity);
        setCartItems(result.items || []);
      } else {
        // Otherwise, update local state only
        setCartItems(prevItems => {
          // Check if product is already in cart
          const existingItemIndex = prevItems.findIndex(item => item.productId === product.id);
          
          if (existingItemIndex !== -1) {
            // Update quantity if product exists
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex].quantity += safeQuantity;
            return updatedItems;
          } else {
            // Add new item
            return [...prevItems, {
              productId: product.id,
              name: product.productName || product.name,
              productPrice: product.productPrice || product.price,
              quantity: safeQuantity,
              image: product.productImage || product.image,
              categoryId: product.categoryId,
              categoryName: product.categoryName || ''
            }];
          }
        });
      }
      
      // Show the cart after adding
      setIsCartOpen(true);
      return { success: true };
    } catch (error) {
      console.error("Failed to add to cart", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        // Use API if authenticated
        const result = await cartApi.updateCartItem(productId, quantity);
        setCartItems(result.items || []);
      } else {
        // Update local state only
        setCartItems(prevItems => {
          if (quantity <= 0) {
            return prevItems.filter(item => item.productId !== productId);
          }
          return prevItems.map(item => 
            item.productId === productId ? { ...item, quantity } : item
          );
        });
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to update cart item", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeFromCart = async (productId) => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        // Use API if authenticated
        const result = await cartApi.removeFromCart(productId);
        setCartItems(result.items || []);
      } else {
        // Update local state only
        setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to remove from cart", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearCart = async () => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        // Use API if authenticated
        await cartApi.clearCart();
      }
      // Clear local state either way
      setCartItems([]);
      return { success: true };
    } catch (error) {
      console.error("Failed to clear cart", error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  
  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.quantity * (item.productPrice || 0)), 
    0
  );
  
  // Calculate total items in cart
  const itemCount = cartItems.reduce(
    (count, item) => count + (item.quantity || 0), 
    0
  );
  
  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      isCartOpen,
      toggleCart,
      cartTotal,
      itemCount,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}; 