import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Страница регистрации админов отключена
// Админы создаются супер-админом через настройки
export const AdminRegister = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Редирект на страницу входа
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  return null;
};
