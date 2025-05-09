import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
      
      // Get the restaurant ID from the product
      const productRestaurantId = product.restaurantId || product.restorantId;
      
      // Check if cart is empty or if the product is from the same restaurant
      if (cartItems.length > 0) {
        const firstItemRestaurantId = cartItems[0].restaurantId || cartItems[0].restorantId;
        
        if (productRestaurantId !== firstItemRestaurantId) {
          return { 
            success: false, 
            error: "You can only order from one restaurant at a time. Please clear your cart first." 
          };
        }
      }
      
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
              categoryName: product.categoryName || '',
              restaurantId: productRestaurantId // Preserve restaurant ID
            }];
          }
        });
      }
      
      // Show the cart after adding
      setIsCartOpen(true);
      return { success: true };
    } catch (error) {
      console.error("Failed to add to cart", error);
      return { success: false, error: error.message || "Failed to add to cart" };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      setIsLoading(true);
      
      // Ensure quantity is always at least 1 to prevent negative quantities
      const safeQuantity = Math.max(1, parseInt(quantity) || 1);
      
      if (isAuthenticated) {
        // Use API if authenticated
        const result = await cartApi.updateCartItem(productId, safeQuantity);
        setCartItems(result.items || []);
      } else {
        // Update local state only
        setCartItems(prevItems => {
          // Only filter out if quantity is 0 (for removal)
          if (quantity <= 0) {
            return prevItems.filter(item => item.productId !== productId);
          }
          return prevItems.map(item => 
            item.productId === productId ? { ...item, quantity: safeQuantity } : item
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
  
  const checkoutCart = async () => {
    try {
      setIsLoading(true);
      
      if (cartItems.length === 0) {
        return { success: false, error: "Your cart is empty" };
      }
      
      // Find restaurant ID from the cart items, looking in each item for both field names
      let restaurantId = null;
      
      // Try to find restaurant ID in any cart item
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
      
      // If still not found, use the default (this should rarely happen after our improvements)
      if (!restaurantId) {
        console.warn("No restaurant ID found in any cart item. Using default ID 1");
        restaurantId = 1;
      }
      
      console.log("Using restaurant ID for order:", restaurantId);
      
      // Create order object
      const orderData = {
        accountId: userData.id,
        restorantId: restaurantId,  // Use restorantId as that's what the backend expects
        orderStatus: "ACCEPTED",
        totalPrice: cartTotal,
        products: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          productName: item.name,
          productImage: item.image,
          productPriceAtOrder: item.productPrice
        }))
      };
      
      console.log("Sending order data:", JSON.stringify(orderData, null, 2));
      
      // Create the order using the API
      const response = await cartApi.createOrder(orderData);
      console.log("Order creation response:", response);
      
      // Clear the cart after successful order
      if (response && response.id) {
        await clearCart();
        return { 
          success: true, 
          orderId: response.id,
          data: response
        };
      }
      
      return { success: true, orderId: response };
    } catch (error) {
      console.error("Failed to checkout cart", error);
      return { success: false, error: error.message || "Failed to place order" };
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
      checkoutCart,
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