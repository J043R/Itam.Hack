import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../Input/input';
import { updateAdminProfile } from '../../../api/api';
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
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || ''
      });
      setHasChanges(false);
    }
  }, [user, isOpen]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      const response = await updateAdminProfile({
        first_name: formData.name,
        last_name: formData.surname
      });
      
      if (response.success) {
        // Обновляем локальное состояние пользователя
        updateUser({
          name: formData.name,
          surname: formData.surname
        });
        setHasChanges(false);
      } else {
        alert(response.message || 'Не удалось сохранить изменения');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
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
      const isModal = target.closest(`.${styles.modal}`);
      const isProfileButton = target.closest('[aria-label="Профиль"]') || target.closest('button[aria-label="Профиль"]');
      
      if (isOpen && !isModal && !isProfileButton) {
        onClose();
      }
    };

    if (isOpen) {
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
              onChange={() => {}} // Email нельзя редактировать
              placeholder="Email"
              disabled
              style={{ 
                height: '40px', 
                minHeight: '40px', 
                maxHeight: '40px', 
                lineHeight: '40px',
                opacity: 0.7,
                cursor: 'not-allowed'
              }}
            />
          </div>
        </div>
        <div className={styles.buttons}>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Выйти
          </button>
        </div>
      </div>
    </>
  );
};
