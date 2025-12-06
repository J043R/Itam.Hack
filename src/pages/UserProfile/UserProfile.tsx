import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar } from '../../components/ui/Avatar/avatar';
import { Input } from '../../components/ui/Input/input';
import { ButtonSimple } from '../../components/ui/Button/button';
import { getUserById, getUserAchievements, inviteUserToTeam } from '../../api/api';
import type { User, Achievement } from '../../api/types';
import styles from './UserProfile.module.css';

export const UserProfile = () => {
  const { userId, id } = useParams<{ userId: string; id: string }>();
  const navigate = useNavigate();

  const [participantData, setParticipantData] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Загружаем данные о пользователе и его достижениях при монтировании компонента
    const loadData = async () => {
      if (!userId) {
        setError('ID пользователя не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Загружаем данные о пользователе и достижениях параллельно
        const [userResponse, achievementsResponse] = await Promise.all([
          getUserById(userId),
          getUserAchievements(userId)
        ]);
        
        if (userResponse.success) {
          // Проверяем, есть ли сохраненные данные в localStorage
          const savedProfiles = localStorage.getItem('userProfiles');
          const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
          const savedProfile = profiles[userId];
          
          setParticipantData({
            ...userResponse.data,
            role: savedProfile?.role || userResponse.data.role,
            university: savedProfile?.university || userResponse.data.university,
            about: savedProfile?.about || userResponse.data.about
          });
        } else {
          setError(userResponse.message || 'Не удалось загрузить данные пользователя');
        }

        if (achievementsResponse.success) {
          setAchievements(achievementsResponse.data);
        }
      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Автосохранение данных профиля участника
  useEffect(() => {
    if (participantData && userId) {
      const timeoutId = setTimeout(() => {
        const savedProfiles = localStorage.getItem('userProfiles');
        const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
        profiles[userId] = {
          role: participantData.role,
          university: participantData.university,
          about: participantData.about
        };
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
      }, 500); // Сохраняем через 500ms после последнего изменения

      return () => clearTimeout(timeoutId);
    }
  }, [participantData?.role, participantData?.university, participantData?.about, userId]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!participantData) return;
    setParticipantData((prev: User | null) => ({
      ...prev!,
      [field]: e.target.value
    }));
  };

  const handleInvite = async () => {
    if (!userId || !id) return;
    
    try {
      // Отправка уведомления участнику о приглашении
      const response = await inviteUserToTeam(userId, 'team-id', id);
      
      if (response.success) {
        // После успешной отправки закрываем страницу
        navigate(`/hackathon/${id}/users`);
      } else {
        alert('Не удалось отправить приглашение');
      }
    } catch (err) {
      console.error('Ошибка отправки приглашения:', err);
      alert('Произошла ошибка при отправке приглашения');
    }
  };

  const handleHide = () => {
    // Закрываем страницу участника
    navigate(`/hackathon/${id}/users`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error || !participantData) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'red' }}>{error || 'Пользователь не найден'}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Профиль с аватаром (без кнопки редактирования) */}
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <Avatar 
            size="100" 
            name={`${participantData.name} ${participantData.surname}`}
            className={styles.avatar}
          />
          <div className={styles.nameContainer}>
            <div className={styles.firstName}>{participantData.name}</div>
            <div className={styles.lastName}>{participantData.surname}</div>
          </div>
        </div>
      </div>

      {/* Поля формы (только для отображения, не редактируемые) */}
      <div className={styles.formSection}>
        <div className={styles.formField}>
          <Input
            label="Роль"
            variant="form"
            type="text"
            value={participantData.role}
            onChange={handleInputChange('role')}
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <Input
            label="Вуз"
            variant="form"
            type="text"
            value={participantData.university || ''}
            onChange={handleInputChange('university')}
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>О себе</label>
          <textarea
            className={styles.textarea}
            value={participantData.about || ''}
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

      {/* Кнопки действий */}
      <div className={styles.actionButtons}>
        <ButtonSimple
          type="entry-primary"
          size="S"
          onClick={handleInvite}
          className={styles.inviteButton}
        >
          Пригласить
        </ButtonSimple>
        <ButtonSimple
          type="button-secondary"
          size="S"
          onClick={handleHide}
          className={styles.hideButton}
        >
          Скрыть
        </ButtonSimple>
      </div>
    </div>
  );
};

