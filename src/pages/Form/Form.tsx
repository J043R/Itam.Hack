import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/input';
import { ButtonSimple } from '../../components/ui/Button/button';
import styles from './Form.module.css';

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Form = ({ isOpen, onClose }: FormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    contacts: ''
  });

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

  const handleSubmit = () => {
    // Здесь будет логика сохранения
    console.log('Сохранение анкеты:', formData);
    // Сохраняем в localStorage, что анкета заполнена (единожды)
    localStorage.setItem('formFilled', 'true');
    localStorage.setItem('formData', JSON.stringify(formData));
    // Закрываем модальное окно после сохранения
    onClose();
  };

  console.log('Form render, isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('Form не открыт, возвращаем null');
    return null;
  }
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className={styles.formModal}
    >
      <div className={styles.modalContainer}>
        <h1 className={styles.title}>Анкета</h1>
        
        <form className={styles.form}>
          <div className={styles.formField}>
            <Input
              label="Имя"
              variant="form"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <Input
              label="Фамилия"
              variant="form"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
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

          <div className={styles.buttonContainer}>
            <ButtonSimple
              type="entry-primary"
              onClick={handleSubmit}
              className={styles.submitButton}
            >
              Сохранить
            </ButtonSimple>
          </div>
        </form>
      </div>
    </Modal>
  );
};

