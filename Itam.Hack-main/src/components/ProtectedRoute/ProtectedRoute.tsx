import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Если требуется авторизация, но пользователь не авторизован
  if (!isAuthenticated) {
    // Если это админский роут, редиректим на страницу входа админа
    if (requireAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // Для обычных пользователей редиректим на главную (там будет показано модальное окно входа)
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Если требуется админ, но пользователь не админ
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

