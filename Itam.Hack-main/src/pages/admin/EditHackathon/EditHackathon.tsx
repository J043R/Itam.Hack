import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '../../../components/ui/Input/input';
import { ButtonSimple } from '../../../components/ui/Button/button';
import { getAdminHackathonById, updateHackathon, deleteHackathon } from '../../../api/api';
import styles from './EditHackathon.module.css';

export const EditHackathon = () => {
  const navigate = useNavigate();
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    describe: '',
    date_starts: '',
    date_end: '',
    register_start: '',
    register_end: '',
    organizer: '',
    image: null as File | null,
    imageUrl: ''
  });

  useEffect(() => {
    if (hackathonId) {
      loadHackathon();
    }
  }, [hackathonId]);

  const loadHackathon = async () => {
    try {
      setIsLoading(true);
      const response = await getAdminHackathonById(hackathonId!);
      if (response.success && response.data) {
        const h = response.data as any;
        // Форматируем даты для datetime-local input
        const formatDateTime = (dateStr: string) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toISOString().slice(0, 16);
        };
        
        setFormData({
          name: h.name || '',
          describe: h.describe || h.description || '',
          date_starts: formatDateTime(h.date_starts),
          date_end: formatDateTime(h.date_end),
          register_start: formatDateTime(h.register_start),
          register_end: formatDateTime(h.register_end),
          organizer: '',
          image: null,
          imageUrl: h.image_url || h.imageUrl || ''
        });
      } else {
        setError('Хакатон не найден');
      }
    } catch (err) {
      console.error('Ошибка загрузки хакатона:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Конвертируем в base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, image: file, imageUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!hackathonId) return;
    
    if (!formData.name) {
      setError('Введите название хакатона');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const toISODateTime = (dateStr: string) => {
        if (dateStr.includes('T')) {
          return dateStr + ':00';
        }
        return dateStr + 'T00:00:00';
      };

      const response = await updateHackathon(hackathonId, {
        name: formData.name,
        describe: formData.describe || undefined,
        image_url: formData.imageUrl || undefined,
        date_starts: formData.date_starts ? toISODateTime(formData.date_starts) : undefined,
        date_end: formData.date_end ? toISODateTime(formData.date_end) : undefined,
        register_start: formData.register_start ? toISODateTime(formData.register_start) : undefined,
        register_end: formData.register_end ? toISODateTime(formData.register_end) : undefined,
      });

      if (response.success) {
        navigate('/admin/hackathons');
      } else {
        setError(response.message || 'Ошибка при сохранении');
      }
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError('Произошла ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!hackathonId) return;
    
    if (!confirm('Вы уверены, что хотите удалить этот хакатон?')) {
      return;
    }

    try {
      const response = await deleteHackathon(hackathonId);
      if (response.success) {
        navigate('/admin/hackathons');
      } else {
        setError(response.message || 'Ошибка при удалении');
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
      setError('Произошла ошибка при удалении');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.editHackathon}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

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
            ) : formData.imageUrl ? (
              <img 
                src={formData.imageUrl} 
                alt="Hackathon" 
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
              <label className={styles.label}>Начало регистрации</label>
              <Input
                type="datetime-local"
                value={formData.register_start}
                onChange={(e) => handleInputChange('register_start', e.target.value)}
                variant="form"
                className={styles.input}
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Конец регистрации</label>
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
              <label className={styles.label}>Дата начала</label>
              <Input
                type="datetime-local"
                value={formData.date_starts}
                onChange={(e) => handleInputChange('date_starts', e.target.value)}
                variant="form"
                className={styles.input}
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>Дата окончания</label>
              <Input
                type="datetime-local"
                value={formData.date_end}
                onChange={(e) => handleInputChange('date_end', e.target.value)}
                variant="form"
                className={styles.input}
              />
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <div className={styles.buttonsContainer}>
            <ButtonSimple
              type="button-primary"
              size="M"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </ButtonSimple>
            <ButtonSimple
              type="button-secondary"
              size="M"
              className={styles.deleteButton}
              onClick={handleDelete}
            >
              Удалить хакатон
            </ButtonSimple>
          </div>
        </div>
      </div>
    </div>
  );
};
