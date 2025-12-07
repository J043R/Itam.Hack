import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input/input';
import { ButtonSimple } from '../../../components/ui/Button/button';
import { useAuth } from '../../../contexts/AuthContext';
import { adminRegister } from '../../../api/api';
import styles from './AdminRegister.module.css';

export const AdminRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

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

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Введите корректный email');
      return;
    }

    // Валидация пароля
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await adminRegister(email.trim(), password);
      
      if (response.success && response.data) {
        // После успешной регистрации перенаправляем на страницу входа
        navigate('/admin/login', { 
          state: { message: 'Регистрация успешна! Теперь вы можете войти.' } 
        });
      } else {
        setError(response.message || 'Ошибка при регистрации');
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации. Попробуйте еще раз.');
      console.error('Ошибка регистрации:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !email || !password || isLoading;

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Регистрация администратора</h1>
          <p className={styles.subtitle}>CourseHack Administration</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <Input
              variant="register"
              type="email"
              placeholder="Введите email"
              value={email}
              onChange={handleEmailChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Пароль</label>
            <Input
              variant="register"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={handlePasswordChange}
              className={styles.input}
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
                const e = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
                handleSubmit(e);
              }}
              disabled={isButtonDisabled}
              className={styles.submitButton}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </ButtonSimple>
          </div>
        </form>

        <p className={styles.helperText}>
          Уже есть аккаунт? <span className={styles.link} onClick={() => navigate('/admin/login')}>Войти</span>
        </p>
      </div>
    </div>
  );
};

