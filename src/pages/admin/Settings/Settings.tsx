import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input/input';
import { ButtonSimple } from '../../../components/ui/Button/button';
import { getOrganizers, addOrganizer } from '../../../api/api';
import type { Organizer } from '../../../api/types';
import styles from './Settings.module.css';

export const Settings = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    company: '',
    email: ''
  });

  useEffect(() => {
    loadOrganizers();
  }, []);

  const loadOrganizers = async () => {
    try {
      setLoading(true);
      const response = await getOrganizers();
      if (response.success) {
        setOrganizers(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки организаторов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleAddOrganizer = async () => {
    if (!formData.name || !formData.surname || !formData.company || !formData.email) {
      alert('Заполните все поля');
      return;
    }

    try {
      const response = await addOrganizer(formData);
      if (response.success) {
        // Очищаем форму
        setFormData({ name: '', surname: '', company: '', email: '' });
        // Обновляем список организаторов
        const updatedResponse = await getOrganizers();
        if (updatedResponse.success) {
          setOrganizers(updatedResponse.data);
        }
      } else {
        alert(response.message || 'Не удалось добавить организатора');
      }
    } catch (error) {
      console.error('Ошибка добавления организатора:', error);
      alert('Произошла ошибка при добавлении организатора');
    }
  };

  return (
    <div className={styles.settings}>
      <div className={styles.container}>
        {/* Левая секция - Форма добавления организатора */}
        <div className={styles.leftSection}>
          <h1 className={styles.mainTitle}>Список организаторов</h1>
          <div className={styles.formPanel}>
            <h2 className={styles.formTitle}>Добавить организатора</h2>
            <div className={styles.formFields}>
              <div className={styles.formField}>
                <Input
                  label="Имя"
                  variant="form"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="text"
                  className={styles.input}
                />
              </div>
              <div className={styles.formField}>
                <Input
                  label="Фамилия"
                  variant="form"
                  type="text"
                  value={formData.surname}
                  onChange={handleInputChange('surname')}
                  placeholder="text"
                  className={styles.input}
                />
              </div>
              <div className={styles.formField}>
                <Input
                  label="Компания"
                  variant="form"
                  type="text"
                  value={formData.company}
                  onChange={handleInputChange('company')}
                  placeholder="text"
                  className={styles.input}
                />
              </div>
              <div className={styles.formField}>
                <Input
                  label="Email"
                  variant="form"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="text"
                  className={styles.input}
                />
              </div>
            </div>
            <ButtonSimple
              type="entry-primary"
              size="M"
              onClick={handleAddOrganizer}
              className={styles.addButton}
            >
              Добавить
            </ButtonSimple>
          </div>
        </div>

        {/* Правая секция - Сетка карточек организаторов */}
        <div className={styles.rightSection}>
          {loading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            <div className={styles.organizersGrid}>
              {organizers.map((organizer) => (
                <div key={organizer.id} className={styles.organizerCard}>
                  {/* Обводка как у стеклянных кнопок */}
                  <div className={styles.cardBorderTop}></div>
                  <div className={styles.cardBorderRight}></div>
                  <div className={styles.cardBorderBottom}></div>
                  <div className={styles.cardBorderLeft}></div>
                  
                  {/* Аватар */}
                  <div className={styles.avatar}></div>
                  
                  {/* Информация об организаторе */}
                  <div className={styles.organizerInfo}>
                    <div className={styles.organizerName}>{organizer.name}</div>
                    <div className={styles.organizerSurname}>{organizer.surname}</div>
                    <div className={styles.organizerCompany}>{organizer.company}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

