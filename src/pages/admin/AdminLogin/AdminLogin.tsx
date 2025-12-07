import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal } from '../../../components/ui/Modal/Modal';
import { Input } from '../../../components/ui/Input/input';
import { ButtonSimple } from '../../../components/ui/Button/button';
import { useAuth } from '../../../contexts/AuthContext';
import { adminLogin } from '../../../api/api';
import { IoMdClose } from "react-icons/io";
import styles from './AdminLogin.module.css';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Если админ уже авторизован, редиректим на админ-панель
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await adminLogin(email.trim(), password);
      
      if (response.success && response.data) {
        // Сохраняем пользователя в контекст
        authLogin(response.data);
        
        // Перенаправляем на админ-панель с заменой текущей записи в истории
        navigate('/admin', { replace: true });
      } else {
        setError(response.message || 'Неверный логин или пароль');
      }
    } catch (err) {
      setError('Произошла ошибка при входе. Попробуйте еще раз.');
      console.error('Ошибка входа:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !email || !password || isLoading;

  // Показываем модальное окно только если мы на странице /admin/login
  const shouldShowModal = location.pathname === '/admin/login';

  if (!shouldShowModal) {
    return null;
  }

  return (
    <Modal 
      isOpen={true}
      onClose={() => navigate('/')}
      className={styles.loginModal}
    >
        <div className={styles.modalContainer}>
          <button 
            className={styles.closeButton}
            onClick={() => navigate('/')}
            aria-label="Закрыть"
          >
            <IoMdClose style={{ fontSize: '24px', color: '#A6A6A6' }} />
          </button>

          <form onSubmit={handleSubmit} className={styles.content}>
            <h2 className={styles.title}>Вход</h2>
            
            <div className={styles.inputContainer}>
              <Input
                variant="register"
                type="email"
                placeholder="Введите email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>

            <div className={styles.inputContainer}>
              <Input
                variant="register"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <div className={styles.buttonContainer}>
              <ButtonSimple
                type="entry-primary"
                onClick={() => {
                  const e = { preventDefault: () => {} } as React.FormEvent;
                  handleSubmit(e);
                }}
                disabled={isButtonDisabled}
                className={styles.submitButton}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </ButtonSimple>
            </div>
          </form>
        </div>
      </Modal>
  );
};

