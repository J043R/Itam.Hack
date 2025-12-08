import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { getUserById, getUserAchievements, getUserTeams } from '../../../api/api';
import type { User, Achievement, Team } from '../../../api/types';
import styles from './AdminUserProfile.module.css';

export const AdminUserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [participantData, setParticipantData] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userTeams, setUserTeams] = useState<Array<Team & { registrationDate: string }>>([]);
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
        
        // Загружаем данные о пользователе, достижениях и командах параллельно
        // Используем Promise.allSettled для более надежной обработки ошибок
        const [userResult, achievementsResult, teamsResult] = await Promise.allSettled([
          getUserById(userId),
          getUserAchievements(userId),
          getUserTeams(userId)
        ]);
        
        // Обрабатываем результат загрузки пользователя
        if (userResult.status === 'fulfilled') {
          const userResponse = userResult.value;
          if (userResponse.success) {
            setParticipantData(userResponse.data);
          } else {
            setError(userResponse.message || 'Не удалось загрузить данные пользователя');
          }
        } else {
          setError('Произошла ошибка при загрузке данных пользователя');
          console.error('Ошибка загрузки пользователя:', userResult.reason);
        }

        // Обрабатываем результат загрузки достижений
        if (achievementsResult.status === 'fulfilled') {
          const achievementsResponse = achievementsResult.value;
          if (achievementsResponse.success) {
            setAchievements(achievementsResponse.data);
          } else {
            console.error('Ошибка загрузки достижений:', achievementsResponse.message);
          }
        } else {
          console.error('Ошибка загрузки достижений:', achievementsResult.reason);
        }

        // Обрабатываем результат загрузки команд
        if (teamsResult.status === 'fulfilled') {
          const teamsResponse = teamsResult.value;
          if (teamsResponse.success) {
            setUserTeams(teamsResponse.data);
          } else {
            console.error('Ошибка загрузки команд:', teamsResponse.message);
          }
        } else {
          console.error('Ошибка загрузки команд:', teamsResult.reason);
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

  const handleClose = () => {
    // Закрываем страницу участника
    navigate('/admin/users');
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
      {/* Кнопка закрытия */}
      <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть">
        <IoClose />
      </button>

      <div className={styles.contentWrapper}>
        {/* Левая боковая панель с информацией о пользователе */}
        <div className={styles.sidebar}>
          {/* Аватар */}
          <div className={styles.avatarPlaceholder}></div>
          
          {/* Поля информации */}
          <div className={styles.infoFields}>
            <div className={styles.infoField}>
              <div className={styles.infoValue}>{participantData.name}</div>
            </div>
            
            <div className={styles.infoField}>
              <div className={styles.infoValue}>{participantData.surname}</div>
            </div>
            
            <div className={styles.infoField}>
              <div className={styles.infoValue}>{participantData.role}</div>
            </div>
          </div>
        </div>

        {/* Основная область контента */}
        <div className={styles.mainContent}>
          {/* Левая колонка - Команды участника */}
          <div className={styles.teamsSection}>
            <h2 className={styles.sectionTitle}>Команды участника</h2>
            <div className={styles.cardsList}>
              {userTeams.length > 0 ? (
                userTeams.map((team) => (
                  <div key={team.id} className={styles.card}>
                    {/* Обводка как у стеклянных кнопок */}
                    <div className={styles.cardBorderTop}></div>
                    <div className={styles.cardBorderRight}></div>
                    <div className={styles.cardBorderBottom}></div>
                    <div className={styles.cardBorderLeft}></div>
                    
                    {/* Иконка команды */}
                    <div className={styles.cardIcon}></div>
                    
                    {/* Информация о команде */}
                    <div className={styles.cardContent}>
                      <div className={styles.cardTitle}>{team.name}</div>
                      <div className={styles.cardDate}>{team.registrationDate}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyMessage}>Нет команд</div>
              )}
            </div>
          </div>

          {/* Правая колонка - Достижения */}
          <div className={styles.achievementsSection}>
            <h2 className={styles.sectionTitle}>Достижения</h2>
            <div className={styles.cardsList}>
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div key={achievement.id} className={styles.card}>
                    {/* Обводка как у стеклянных кнопок */}
                    <div className={styles.cardBorderTop}></div>
                    <div className={styles.cardBorderRight}></div>
                    <div className={styles.cardBorderBottom}></div>
                    <div className={styles.cardBorderLeft}></div>
                    
                    {/* Иконка достижения */}
                    <div className={styles.cardIcon}></div>
                    
                    {/* Информация о достижении */}
                    <div className={styles.cardContent}>
                      <div className={styles.cardTitle}>{achievement.name}</div>
                      <div className={styles.cardDate}>{achievement.date}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyMessage}>Нет достижений</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

