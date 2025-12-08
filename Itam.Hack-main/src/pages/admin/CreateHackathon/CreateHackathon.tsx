import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input/input';
import { ButtonSimple } from '../../../components/ui/Button/button';
import { createHackathon } from '../../../api/api';
import styles from './CreateHackathon.module.css';

export const CreateHackathon = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    describe: '',
    date_starts: '',
    date_end: '',
    register_start: '',
    register_end: '',
    organizer: '',
    image: null as File | null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    // Валидация
    if (!formData.name) {
      setError('Введите название хакатона');
      return;
    }
    if (!formData.date_starts || !formData.date_end) {
      setError('Укажите даты проведения');
      return;
    }
    if (!formData.register_start || !formData.register_end) {
      setError('Укажите даты регистрации');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Преобразуем даты в ISO формат
      const toISODateTime = (dateStr: string) => {
        // Если уже в формате datetime-local (YYYY-MM-DDTHH:mm), добавляем секунды
        if (dateStr.includes('T')) {
          return dateStr + ':00';
        }
        // Если просто дата (YYYY-MM-DD), добавляем время
        return dateStr + 'T00:00:00';
      };

      const response = await createHackathon({
        name: formData.name,
        describe: formData.describe || undefined,
        date_starts: toISODateTime(formData.date_starts),
        date_end: toISODateTime(formData.date_end),
        register_start: toISODateTime(formData.register_start),
        register_end: toISODateTime(formData.register_end),
      });

      if (response.success) {
        navigate('/admin/hackathons');
      } else {
        setError(response.message || 'Ошибка при создании хакатона');
      }
    } catch (err) {
      console.error('Ошибка создания хакатона:', err);
      setError('Произошла ошибка при создании хакатона');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.createHackathon}>
      <h1 className={styles.title}>Создание хакатона</h1>
      
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
            Добавить изображение
          </ButtonSimple>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.formField}>
            <label className={styles.label}>Название *</label>
            <Input
              type="text"
              placeholder="Название хакатона"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              variant="form"
              className={styles.input}
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Описание</label>
            <Input
              type="text"
              placeholder="Описание хакатона"
              value={formData.describe}
              onChange={(e) => handleInputChange('describe', e.target.value)}
              variant="form"
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.label}>Начало регистрации *</label>
              <Input
                type="datetime-local"
                value={formData.register_start}
                onChange={(e) => handleInputChange('register_start', e.target.value)}
                variant="form"
                className={styles.input}
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Конец регистрации *</label>
              <Input
                type="datetime-local"
                value={formData.register_end}
                onChange={(e) => handleInputChange('register_end', e.target.value)}
                variant="form"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.label}>Дата начала *</label>
              <Input
                type="datetime-local"
                value={formData.date_starts}
                onChange={(e) => handleInputChange('date_starts', e.target.value)}
                variant="form"
                className={styles.input}
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Дата окончания *</label>
              <Input
                type="datetime-local"
                value={formData.date_end}
                onChange={(e) => handleInputChange('date_end', e.target.value)}
                variant="form"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Организатор</label>
            <Input
              type="text"
              placeholder="Название организатора"
              value={formData.organizer}
              onChange={(e) => handleInputChange('organizer', e.target.value)}
              variant="form"
              className={styles.input}
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <div className={styles.submitButtonContainer}>
            <ButtonSimple
              type="button-primary"
              size="M"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Создание...' : 'Создать хакатон'}
            </ButtonSimple>
          </div>
        </div>
      </div>
    </div>
  );
};
