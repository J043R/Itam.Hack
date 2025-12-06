import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar } from '../components/ui/Avatar/avatar';
import { Input } from '../components/ui/Input/input';
import { ButtonSimple } from '../components/ui/Button/button';
import styles from './UserProfile.module.css';

export const UserProfile = () => {
  const { userId, id } = useParams<{ userId: string; id: string }>();
  const navigate = useNavigate();

  // Временные данные участника (позже будут загружаться с бэкенда по userId)
  // Пока используем тестовые данные
  const [participantData, setParticipantData] = useState({
    firstName: 'Иван',
    lastName: 'Иванов',
    role: 'Frontend',
    university: 'МГУ',
    about: 'Опытный разработчик с фокусом на современные веб-технологии'
  });

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setParticipantData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleInvite = () => {
    // Отправка уведомления участнику о приглашении
    console.log('Отправка уведомления участнику:', userId);
    // Здесь будет логика отправки уведомления на бэкенд
    // После отправки закрываем страницу
    navigate(`/hackathon/${id}/users`);
  };

  const handleHide = () => {
    // Закрываем страницу участника
    navigate(`/hackathon/${id}/users`);
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
      {/* Профиль с аватаром (без кнопки редактирования) */}
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <Avatar 
            size="100" 
            name={`${participantData.firstName} ${participantData.lastName}`}
            className={styles.avatar}
          />
          <div className={styles.nameContainer}>
            <div className={styles.firstName}>{participantData.firstName}</div>
            <div className={styles.lastName}>{participantData.lastName}</div>
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
            value={participantData.university}
            onChange={handleInputChange('university')}
            className={styles.input}
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>О себе</label>
          <textarea
            className={styles.textarea}
            value={participantData.about}
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

