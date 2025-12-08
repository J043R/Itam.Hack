import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/input';
import { ButtonSimple } from '../../components/ui/Button/button';
import { createOrUpdateProfile } from '../../api/api';
import styles from './Form.module.css';

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  canClose?: boolean; // Можно ли закрыть анкету без заполнения
}

export const Form = ({ isOpen, onClose, canClose = true }: FormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    role: '',
    contacts: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Автосохранение данных формы
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('formData', JSON.stringify(formData));
    }, 500); // Сохраняем через 500ms после последнего изменения

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Загружаем сохраненные данные при открытии формы
  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem('formData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({
            ...prev,
            ...parsed
          }));
        } catch (e) {
          console.error('Ошибка загрузки данных формы:', e);
        }
      }
    }
  }, [isOpen]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!formData.name || !formData.last_name || !formData.role) {
      setError('Заполните все обязательные поля');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await createOrUpdateProfile(formData);
      
      if (response.success) {
        // Сохраняем в localStorage, что анкета заполнена
        localStorage.setItem('formFilled', 'true');
        localStorage.setItem('hasProfile', 'true'); // Обновляем флаг из бэкенда
        localStorage.setItem('formData', JSON.stringify(formData));
        // Закрываем модальное окно после сохранения
        onClose();
      } else {
        setError(response.message || 'Ошибка при сохранении анкеты');
      }
    } catch (err) {
      setError('Произошла ошибка при сохранении анкеты. Попробуйте еще раз.');
      console.error('Ошибка сохранения анкеты:', err);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('=== FORM COMPONENT RENDER ===');
  console.log('Form isOpen:', isOpen);
  console.log('Form canClose:', canClose);
  
  if (!isOpen) {
    console.log('❌ Form не открыт, возвращаем null');
    return null;
  }
  
  console.log('✅ Form is open, rendering Modal');
  
  // Функция для закрытия с проверкой
  const handleClose = () => {
    if (canClose) {
      onClose();
    } else {
      console.log('Form cannot be closed (canClose=false)');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      className={styles.formModal}
      canClose={canClose}
    >
      <div className={styles.modalContainer}>
        <h1 className={styles.title}>Анкета</h1>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formField}>
            <Input
              label="Имя"
              variant="form"
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <Input
              label="Фамилия"
              variant="form"
              type="text"
              value={formData.last_name}
              onChange={handleInputChange('last_name')}
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <Input
              label="Роль"
              variant="form"
              type="text"
              value={formData.role}
              onChange={handleInputChange('role')}
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <Input
              label="Контакты"
              variant="form"
              type="text"
              value={formData.contacts}
              onChange={handleInputChange('contacts')}
              className={styles.input}
            />
          </div>

          {error && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px 12px', 
              backgroundColor: 'rgba(255, 0, 0, 0.1)', 
              border: '1px solid rgba(255, 0, 0, 0.3)', 
              borderRadius: '6px', 
              color: '#ff6b6b', 
              fontSize: '12px' 
            }}>
              {error}
            </div>
          )}

          <div className={styles.buttonContainer}>
            <ButtonSimple
              type="entry-primary"
              onClick={handleSubmit}
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </ButtonSimple>
          </div>
        </form>
      </div>
    </Modal>
  );
};

