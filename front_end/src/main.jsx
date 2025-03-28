import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "tailwindcss"
import { AuthProvider } from './AuthContext.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import { RestaurantProvider } from './contexts/RestaurantContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RestaurantProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </RestaurantProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
