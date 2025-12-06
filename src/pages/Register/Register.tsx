import { useState } from 'react';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/input';
import { ButtonSimple } from '../../components/ui/Button/button';
import styles from './Register.module.css';

interface RegisterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Register = ({ isOpen, onClose }: RegisterProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика регистрации
    console.log('Регистрация:', formData);
    // После успешной регистрации можно закрыть модальное окно
    // onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Регистрация"
      className={styles.registerModal}
    >
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <div className={styles.formField}>
          <Input
            variant="register"
            type="text"
            placeholder="Имя"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
          />
        </div>

        <div className={styles.formField}>
          <Input
            variant="register"
            type="text"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
          />
        </div>

        <div className={styles.formField}>
          <Input
            variant="register"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange('email')}
          />
        </div>

        <div className={styles.formField}>
          <Input
            variant="register"
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleInputChange('password')}
          />
        </div>

        <div className={styles.formField}>
          <Input
            variant="register"
            type="password"
            placeholder="Подтвердите пароль"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
          />
        </div>

        <div className={styles.buttonContainer}>
          <ButtonSimple
            type="entry-primary"
            onClick={() => {
              const e = { preventDefault: () => {} } as React.FormEvent;
              handleSubmit(e);
            }}
            className={styles.submitButton}
          >
            Зарегистрироваться
          </ButtonSimple>
        </div>

        <p className={styles.helperText}>
          Уже есть аккаунт? <span className={styles.link}>Войти</span>
        </p>
      </form>
    </Modal>
  );
};

