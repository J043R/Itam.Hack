import { useParams, useNavigate } from 'react-router-dom';
import { IoFilterSharp } from "react-icons/io5";
import styles from './Users.module.css';

export const Users = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Временные данные для хакатона (позже будут загружаться с бэкенда)
  const hackathonData = {
    id: id || '1',
    name: 'AI Hackathon 2024',
    date: '15-17 марта 2024',
    description: 'Создайте инновационные решения с использованием искусственного интеллекта'
  };

  const handleUserClick = () => {
    // Обработчик клика - пока ничего не делаем
    console.log('Клик по карточке хакатона');
  };

  // Тестовые данные участников (позже будут загружаться с бэкенда)
  const participants = [
    { id: '1', name: 'Иван Иванов', role: 'Frontend' },
    { id: '2', name: 'Мария Петрова', role: 'Backend' },
    { id: '3', name: 'Алексей Сидоров', role: 'Designer' },
    { id: '4', name: 'Елена Козлова', role: 'Fullstack' },
    { id: '5', name: 'Дмитрий Смирнов', role: 'DevOps' },
    { id: '6', name: 'Анна Волкова', role: 'QA' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.usersList}>
        <button
          className={styles.userCard}
          onClick={handleUserClick}
          type="button"
        >
          {/* Обводка как у стеклянных кнопок */}
          <div className={styles.userCardBorderTop}></div>
          <div className={styles.userCardBorderRight}></div>
          <div className={styles.userCardBorderBottom}></div>
          <div className={styles.userCardBorderLeft}></div>
          
          <div className={styles.imageContainer}>
            <div className={styles.imagePlaceholder}></div>
          </div>
          <div className={styles.content}>
            <h2 className={styles.name}>{hackathonData.name}</h2>
            <p className={styles.role}>{hackathonData.date}</p>
          </div>
        </button>
        <div className={styles.titleWithFilter}>
          <h2 className={styles.participantsTitle}>Участники</h2>
          <button 
            className={styles.filterButton}
            onClick={() => console.log('Фильтры')}
            aria-label="Фильтры"
            type="button"
          >
            <IoFilterSharp style={{ fontSize: '20px', color: '#E7E3D8' }} />
          </button>
        </div>
        <div className={styles.participantsList}>
          {participants.map((participant) => (
            <button
              key={participant.id}
              className={styles.participantCard}
              onClick={() => navigate(`/hackathon/${id}/users/${participant.id}`)}
              type="button"
            >
              {/* Обводка как у стеклянных кнопок */}
              <div className={styles.participantCardBorderTop}></div>
              <div className={styles.participantCardBorderRight}></div>
              <div className={styles.participantCardBorderBottom}></div>
              <div className={styles.participantCardBorderLeft}></div>
              
              {/* Аватарка пользователя */}
              <div className={styles.participantAvatar}></div>
              
              {/* Имя, фамилия и роль участника */}
              <div className={styles.participantNameContainer}>
                <div className={styles.participantFirstName}>
                  {participant.name.split(' ')[0]}
                </div>
                <div className={styles.participantLastName}>
                  {participant.name.split(' ')[1] || ''}
                </div>
                <div className={styles.participantRole}>
                  {participant.role}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

