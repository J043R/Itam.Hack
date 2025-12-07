import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../Input/input';
import { ButtonSimple } from '../Button/button';
import styles from './AdminProfileModal.module.css';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProfileModal = ({ isOpen, onClose }: AdminProfileModalProps) => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: ''
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || ''
      });
    }
  }, [user, isOpen]);

  // Автосохранение при изменении полей
  useEffect(() => {
    if (user && isOpen && (formData.name !== user.name || formData.surname !== user.surname || formData.email !== user.email)) {
      const timeoutId = setTimeout(() => {
        updateUser({
          name: formData.name,
          surname: formData.surname,
          email: formData.email
        });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.name, formData.surname, formData.email, user, isOpen, updateUser]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSave = () => {
    if (user) {
      updateUser({
        name: formData.name,
        surname: formData.surname,
        email: formData.email
      });
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/admin/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Проверяем, что клик не на модальное окно и не на кнопку человечка
      const isModal = target.closest(`.${styles.modal}`);
      const isProfileButton = target.closest('[aria-label="Профиль"]') || target.closest('button[aria-label="Профиль"]');
      
      if (isOpen && !isModal && !isProfileButton) {
        onClose();
      }
    };

    if (isOpen) {
      // Используем небольшую задержку, чтобы избежать конфликта с кликом на кнопку
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay}></div>
      <div className={styles.modal}>
        <div className={styles.formFields}>
          <div className={styles.formField}>
            <Input
              variant="form"
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Имя"
              style={{ height: '40px', minHeight: '40px', maxHeight: '40px', lineHeight: '40px' }}
            />
          </div>
          <div className={styles.formField}>
            <Input
              variant="form"
              type="text"
              value={formData.surname}
              onChange={handleInputChange('surname')}
              placeholder="Фамилия"
              style={{ height: '40px', minHeight: '40px', maxHeight: '40px', lineHeight: '40px' }}
            />
          </div>
          <div className={styles.formField}>
            <Input
              variant="form"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="Email"
              style={{ height: '40px', minHeight: '40px', maxHeight: '40px', lineHeight: '40px' }}
            />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          Выйти
        </button>
      </div>
    </>
  );
};

