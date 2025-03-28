import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
export const RestaurantContext = createContext();

// Custom hook to use the restaurant context
export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({ children }) => {
  const [currentRestaurant, setCurrentRestaurant] = useState(() => {
    // Get from localStorage if available
    const storedRestaurant = localStorage.getItem('currentRestaurant');
    return storedRestaurant ? JSON.parse(storedRestaurant) : { id: 1 }; // Default to ID 1
  });

  useEffect(() => {
    // Save to localStorage when it changes
    localStorage.setItem('currentRestaurant', JSON.stringify(currentRestaurant));
  }, [currentRestaurant]);

  // Function to change the current restaurant
  const setRestaurant = (restaurant) => {
    setCurrentRestaurant(restaurant);
  };

  return (
    <RestaurantContext.Provider value={{ currentRestaurant, setRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}; 