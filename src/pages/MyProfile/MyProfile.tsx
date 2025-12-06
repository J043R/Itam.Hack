import { useState, useEffect } from 'react';
import { Avatar } from '../../components/ui/Avatar/avatar';
import { Input } from '../../components/ui/Input/input';
import { ButtonSimple } from '../../components/ui/Button/button';
import styles from './MyProfile.module.css';

export const MyProfile = () => {
  // Загружаем данные из localStorage или используем значения по умолчанию
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    university: '',
    about: ''
  });

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProfileData({
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          role: parsed.role || '',
          university: '',
          about: ''
        });
      } catch (e) {
        console.error('Ошибка загрузки данных профиля:', e);
      }
    }
  }, []);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleEdit = () => {
    // Здесь будет логика редактирования профиля
    console.log('Редактирование профиля');
  };

  const handleLogout = () => {
    // Здесь будет логика выхода
    console.log('Выход из аккаунта');
    // Можно очистить localStorage и перенаправить на страницу входа
    // localStorage.clear();
    // window.location.reload();
  };

  // Тестовые данные для достижений
  const achievements = [
    {
      id: '1',
      name: 'Название хака',
      date: 'Дата',
      description: 'Описание хака'
    },
    {
      id: '2',
      name: 'Название хака',
      date: 'Дата',
      description: 'Описание хака'
    },
    {
      id: '3',
      name: 'Название хака',
      date: 'Дата',
      description: 'Описание хака'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Профиль с аватаром и кнопкой редактирования */}
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <Avatar 
            size="100" 
            name={`${profileData.firstName} ${profileData.lastName}`}
            className={styles.avatar}
          />
          <div className={styles.nameContainer}>
            <div className={styles.firstName}>{profileData.firstName || 'Имя'}</div>
            <div className={styles.lastName}>{profileData.lastName || 'Фамилия'}</div>
          </div>
        </div>
        <ButtonSimple
          type="entry-primary"
          size="S"
          onClick={handleEdit}
          className={styles.editButton}
        >
          Изменить
        </ButtonSimple>
      </div>

      {/* Поля формы */}
      <div className={styles.formSection}>
        <div className={styles.formField}>
          <Input
            label="Роль"
            variant="form"
            type="text"
            value={profileData.role}
            onChange={handleInputChange('role')}
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <Input
            label="Вуз"
            variant="form"
            type="text"
            value={profileData.university}
            onChange={handleInputChange('university')}
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>О себе</label>
          <textarea
            className={styles.textarea}
            value={profileData.about}
            onChange={handleInputChange('about')}
          />
        </div>
      </div>

      {/* Секция достижений */}
      <div className={styles.achievementsSection}>
        <h2 className={styles.achievementsTitle}>Достижения</h2>
        <div className={styles.achievementsList}>
          {achievements.map((achievement) => (
            <ButtonSimple
              key={achievement.id}
              type="glass-card-small"
              className={styles.achievementCard}
            >
              <div className={styles.achievementContent}>
                <div 
                  className={styles.achievementName}
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    display: 'block'
                  }}
                >
                  {achievement.name}
                </div>
                <div 
                  className={styles.achievementDate}
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    display: 'block'
                  }}
                >
                  {achievement.date}
                </div>
              </div>
            </ButtonSimple>
          ))}
        </div>
      </div>

      {/* Кнопка выхода */}
      <div className={styles.logoutContainer}>
        <ButtonSimple
          type="button-secondary"
          size="S"
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          Выйти
        </ButtonSimple>
      </div>
    </div>
  );
};

