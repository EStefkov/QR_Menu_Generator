import { Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const { userData } = useContext(AuthContext);
  const [mounted, setMounted] = useState(false);
  
  // Добавяме ефект, който ще се изпълни само веднъж при монтиране
  useEffect(() => {
    console.log(`ProtectedRoute mounted for path: ${location.pathname}`);
    console.log(`Token in localStorage: ${!!localStorage.getItem('token')}`);
    console.log(`Token in AuthContext: ${!!userData?.token}`);
    setMounted(true);
  }, [location.pathname, userData?.token]);
  
  // Специална логика за профил страницата - НИКОГА не редиректваме при рефреш
  const isProfilePage = location.pathname.includes('/profile');
  if (isProfilePage) {
    // На профил страница - проверка за токен в localStorage, без значение от AuthContext
    const token = localStorage.getItem('token');
    if (token) {
      // Имаме токен в localStorage - показваме съдържанието
      console.log("ProtectedRoute: На профил страница - показване на съдържанието");
      return children;
    } else {
      console.log("ProtectedRoute: Липсва токен в localStorage на профил страница!");
    }
    
    // Даваме шанс на AuthContext да се инициализира преди да редиректнем
    if (!mounted) {
      console.log("ProtectedRoute: Изчакване на монтиране преди редирект...");
      // Показваме loading индикатор вместо да редиректваме веднага
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    // Ако няма токен, дори на профил страница трябва да редиректнем
    console.log("ProtectedRoute: Липсва токен в localStorage - редирект към логин");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  // За всички други страници - стандартна логика за проверка
  // Първо проверяваме localStorage
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    // Проверяваме за роля, ако е необходимо
    if (role) {
      const accountType = localStorage.getItem('accountType');
      if (accountType && accountType === role) {
        return children;
      } else {
        // Няма нужната роля - редирект към начална страница
        return <Navigate to="/" replace />;
      }
    }
    
    // Няма изискване за роля, показваме съдържанието
    return children;
  }
  
  // Нека проверим AuthContext като резервен вариант
  if (userData && userData.token) {
    // Проверка за роля ако е необходимо
    if (role && userData.accountType !== role) {
      return <Navigate to="/" replace />;
    }
    
    // AuthContext има валиден токен, показваме съдържанието
    return children;
  }
  
  // Даваме шанс на AuthContext да се инициализира преди да редиректнем
  if (!mounted) {
    console.log("ProtectedRoute: Изчакване на монтиране преди редирект...");
    // Показваме loading индикатор вместо да редиректваме веднага
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Нито localStorage, нито AuthContext имат токен - редирект
  return <Navigate to="/login" replace state={{ from: location }} />;
}

export default ProtectedRoute; 