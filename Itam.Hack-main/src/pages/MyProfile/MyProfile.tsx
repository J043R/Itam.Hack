import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/ui/Avatar/avatar';
import { Input } from '../../components/ui/Input/input';
import { ButtonSimple } from '../../components/ui/Button/button';
import { useAuth } from '../../contexts/AuthContext';
import { getMyAnketa, updateMyAnketa } from '../../api/api';
import styles from './MyProfile.module.css';

interface MyProfileProps {
  onLogout?: () => void;
}

export const MyProfile = ({ onLogout }: MyProfileProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  // Загружаем данные из localStorage или используем значения по умолчанию
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    university: '',
    about: ''
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    const loadProfile = async () => {
      
      // Сначала пробуем загрузить с сервера
      try {
        const response = await getMyAnketa();
        if (response.success && response.data) {
          const anketa = response.data as any;
          // Бэкенд возвращает firstName/lastName (alias) или name/last_name
          const firstName = anketa.firstName || anketa.name || '';
          const lastName = anketa.lastName || anketa.last_name || '';
          setProfileData({
            firstName,
            lastName,
            role: anketa.role || '',
            university: anketa.university || '',
            about: anketa.contacts || anketa.bio || ''
          });
          // Сохраняем в localStorage для кэширования
          localStorage.setItem('formData', JSON.stringify({
            name: firstName,
            last_name: lastName,
            role: anketa.role,
            contacts: anketa.contacts
          }));
          return;
        }
      } catch (e) {
        console.log('Не удалось загрузить анкету с сервера, используем localStorage');
      }
      
      // Fallback на localStorage
      const savedData = localStorage.getItem('formData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setProfileData({
            firstName: parsed.name || parsed.firstName || '',
            lastName: parsed.last_name || parsed.lastName || '',
            role: parsed.role || '',
            university: parsed.university || '',
            about: parsed.contacts || parsed.about || ''
          });
        } catch (e) {
          console.error('Ошибка загрузки данных профиля:', e);
        }
      }

      // Загружаем сохраненные данные профиля (дополнительные поля)
      const savedProfile = localStorage.getItem('profileData');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfileData(prev => ({
            ...prev,
            university: parsed.university || prev.university,
            about: parsed.about || prev.about
          }));
        } catch (e) {
          console.error('Ошибка загрузки данных профиля:', e);
        }
      }
    };
    
    loadProfile();

    // Загружаем сохраненный аватар
    const savedAvatar = localStorage.getItem('profileAvatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  // Автосохранение данных профиля
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('profileData', JSON.stringify({
        role: profileData.role,
        university: profileData.university,
        about: profileData.about
      }));
    }, 500); // Сохраняем через 500ms после последнего изменения

    return () => clearTimeout(timeoutId);
  }, [profileData.role, profileData.university, profileData.about]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarClick = () => {
    // Открываем диалог выбора файла для изменения аватара
    fileInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await updateMyAnketa({
        name: profileData.firstName,
        last_name: profileData.lastName,
        role: profileData.role,
        contacts: profileData.about,
        university: profileData.university
      });
      
      if (response.success) {
        alert('Профиль сохранён!');
        // Обновляем localStorage
        localStorage.setItem('formData', JSON.stringify({
          name: profileData.firstName,
          last_name: profileData.lastName,
          role: profileData.role,
          contacts: profileData.about
        }));
      } else {
        alert('Не удалось сохранить профиль');
      }
    } catch (e) {
      console.error('Ошибка сохранения профиля:', e);
      alert('Ошибка сохранения профиля');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      // Создаем preview изображения
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        // Сохраняем в localStorage
        localStorage.setItem('profileAvatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    // Очищаем токен авторизации
    localStorage.removeItem('authToken');
    
    // Очищаем данные пользователя из localStorage
    localStorage.removeItem('formFilled');
    localStorage.removeItem('userProfiles');
    localStorage.removeItem('teamNames');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('teams');
    localStorage.removeItem('currentUser');
    
    // Вызываем logout из AuthContext (устанавливает isAuthenticated = false)
    logout();
    
    // Переходим на главную страницу, где автоматически покажется Login
    navigate('/');
    
    // Вызываем функцию выхода, переданную из App (если есть)
    if (onLogout) {
      onLogout();
    }
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
      {/* Профиль с аватаром и кнопкой сохранения */}
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <div onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
            <Avatar 
              size="100" 
              name={`${profileData.firstName} ${profileData.lastName}`}
              src={avatarUrl || undefined}
              className={styles.avatar}
            />
          </div>
          <div className={styles.nameContainer}>
            <div className={styles.firstName}>{profileData.firstName || 'Имя'}</div>
            <div className={styles.lastName}>{profileData.lastName || 'Фамилия'}</div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />
        <ButtonSimple
          type="entry-primary"
          size="S"
          onClick={handleSaveProfile}
          disabled={isSaving}
          className={styles.editButton}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
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

