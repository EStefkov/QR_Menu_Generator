import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from '../AuthContext';

// Create the context
export const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Зареждаме от localStorage ако има запазена количка
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { userData } = useAuth();
  
  // Запазваме количката в localStorage при всяка промяна
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Изчистваме количката при смяна на потребителя
  useEffect(() => {
    if (!userData.id) {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  }, [userData.id]);
  
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Проверяваме дали продуктът вече е в количката
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Ако продуктът вече е в количката, обновяваме количеството
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Ако продуктът не е в количката, добавяме го
        return [...prevItems, {
          id: product.id,
          name: product.name || product.productName,
          price: product.price || product.productPrice,
          quantity: quantity,
          image: product.image || product.productImage,
          categoryId: product.categoryId,
          categoryName: product.categoryName || ''
        }];
      }
    });
    
    // Показваме количката след добавяне
    setIsCartOpen(true);
    
    // Връщаме успех
    return Promise.resolve({ success: true });
  };
  
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    return Promise.resolve({ success: true });
  };
  
  const updateCartItemQuantity = (productId, quantity) => {
    setCartItems(prevItems => {
      return prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      );
    });
    return Promise.resolve({ success: true });
  };
  
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    return Promise.resolve({ success: true });
  };
  
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.quantity * item.price, 
    0
  );
  
  // Изчисляваме общия брой артикули в количката
  const itemCount = cartItems.reduce(
    (count, item) => count + item.quantity, 
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
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}; 