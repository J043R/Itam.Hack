import { useState } from 'react';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/input';
import { ButtonSimple } from '../../components/ui/Button/button';
import { IoMdClose } from "react-icons/io";
import styles from './Login.module.css';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Login = ({ isOpen, onClose }: LoginProps) => {
  const [code, setCode] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика входа
    console.log('Вход с кодом:', code);
  };

  const isButtonDisabled = !code || code.trim() === '';

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

          <div className={styles.buttonContainer}>
            <ButtonSimple
              type="entry-primary"
              onClick={handleSubmit}
              disabled={isButtonDisabled}
              className={styles.submitButton}
            >
              Войти
            </ButtonSimple>
          </div>

          <p className={styles.helperText}>
            Напишите <span className={styles.botLink}>@itam_bot</span>, чтоб получить код
          </p>
        </div>
      </div>
    </Modal>
  );
};

