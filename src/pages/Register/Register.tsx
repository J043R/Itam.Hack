import { useState } from 'react';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/input';
import { ButtonSimple } from '../../components/ui/Button/button';
import { IoMdClose } from "react-icons/io";
import styles from './Register.module.css';

interface RegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export const Register = ({ isOpen, onClose, onSwitchToLogin }: RegisterProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Здесь будет логика регистрации через API
      // const response = await register(email, password);
      // 
      // if (response.success) {
      //   onClose();
      //   setEmail('');
      //   setPassword('');
      // } else {
      //   setError(response.message || 'Ошибка при регистрации');
      // }
      
      // Временная заглушка
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Регистрация:', { email, password });
      
      // После успешной регистрации можно закрыть модальное окно
      onClose();
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Произошла ошибка при регистрации. Попробуйте еще раз.');
      console.error('Ошибка регистрации:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !email || !password || isLoading;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className={styles.registerModal}
    >
      <div className={styles.modalContainer}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрыть"
        >
          <IoMdClose style={{ fontSize: '24px', color: '#A6A6A6' }} />
        </button>

        <form onSubmit={handleSubmit} className={styles.content}>
          <h2 className={styles.title}>Регистрация</h2>
          
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
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </ButtonSimple>
          </div>

          {onSwitchToLogin && (
            <p className={styles.helperText}>
              Уже есть аккаунт? <span className={styles.link} onClick={onSwitchToLogin}>Войти</span>
            </p>
          )}
        </form>
      </div>
    </Modal>
  );
};

