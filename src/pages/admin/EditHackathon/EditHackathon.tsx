import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input/input';
import { ButtonSimple } from '../../../components/ui/Button/button';
import styles from './EditHackathon.module.css';

export const EditHackathon = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    organizer: '',
    image: null as File | null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    // Здесь будет логика сохранения изменений хакатона
    console.log('Редактирование хакатона:', formData);
    // После сохранения можно вернуться на страницу хакатонов
    navigate('/admin/hackathons');
  };

  return (
    <div className={styles.editHackathon}>
      <h1 className={styles.title}>Редактирование хакатона</h1>
      
      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.imagePlaceholder}>
            {formData.image ? (
              <img 
                src={URL.createObjectURL(formData.image)} 
                alt="Preview" 
                className={styles.previewImage}
              />
            ) : (
              <div className={styles.placeholderBox}></div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
          <ButtonSimple
            type="button-primary"
            size="M"
            className={styles.addImageButton}
            onClick={handleImageButtonClick}
          >
            Изменить изображение
          </ButtonSimple>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.formField}>
            <label className={styles.label}>Название</label>
            <Input
              type="text"
              placeholder="Название"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              variant="form"
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Дата проведения</label>
            <Input
              type="text"
              placeholder="Дата проведения"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              variant="form"
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Описание</label>
            <Input
              type="text"
              placeholder="Описание"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              variant="form"
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Организатор</label>
            <Input
              type="text"
              placeholder="Организатор"
              value={formData.organizer}
              onChange={(e) => handleInputChange('organizer', e.target.value)}
              variant="form"
              className={styles.input}
            />
          </div>

          <div className={styles.submitButtonContainer}>
            <ButtonSimple
              type="button-primary"
              size="M"
              className={styles.submitButton}
              onClick={handleSubmit}
            >
              Сохранить изменения
            </ButtonSimple>
          </div>
        </div>
      </div>
    </div>
  );
};

