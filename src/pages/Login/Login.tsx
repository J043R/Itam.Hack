import { useState } from 'react';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/input';
import { ButtonSimple } from '../../components/ui/Button/button';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../api/api';
import { IoMdClose } from "react-icons/io";
import styles from './Login.module.css';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Login = ({ isOpen, onClose }: LoginProps) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: authLogin } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    setError(null); // Сбрасываем ошибку при вводе
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.trim() === '') {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await login(code.trim());
      
      if (response.success && response.data) {
        // response.data теперь содержит { user, hasProfile }
        const { user } = response.data;
        
        // Сохраняем пользователя в контекст
        authLogin(user);
        
        // Флаг hasProfile уже сохранен в localStorage в функции login
        // Если анкета не существует (hasProfile === false), UserApp автоматически покажет форму
        
        // Закрываем модальное окно
        onClose();
        setCode('');
        
        // Анкета откроется автоматически в UserApp, если hasProfile === false
        // Обычный пользователь остается на текущей странице
        // Админы должны входить через /admin/login
      } else {
        setError(response.message || 'Неверный код доступа');
      }
    } catch (err) {
      setError('Произошла ошибка при входе. Попробуйте еще раз.');
      console.error('Ошибка входа:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !code || code.trim() === '' || isLoading;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className={styles.loginModal}
    >
      <div className={styles.modalContainer}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрыть"
        >
          <IoMdClose style={{ fontSize: '24px', color: '#A6A6A6' }} />
        </button>

        <div className={styles.content}>
          <h2 className={styles.title}>Вход</h2>
          
          <p className={styles.label}>Код от телеграмм-бота</p>
          
          <div className={styles.inputContainer}>
            <Input
              variant="register"
              type="text"
              placeholder="Введите код"
              value={code}
              onChange={handleInputChange}
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

          <p className={styles.helperText}>
            Напишите <a href="https://t.me/meethack_auth_bot" target="_blank" rel="noopener noreferrer" className={styles.botLink}>@meethack_auth_bot</a>, чтоб получить код
          </p>
        </div>
      </div>
    </Modal>
  );
};

