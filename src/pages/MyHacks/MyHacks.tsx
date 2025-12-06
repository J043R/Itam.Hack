import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoTrash } from 'react-icons/go';
import { getMyHackathons, deleteMyHackathon } from '../../api/api';
import type { MyHackathon } from '../../api/types';
import styles from './MyHacks.module.css';

export const MyHacks = () => {
  const navigate = useNavigate();
  const [myHackathons, setMyHackathons] = useState<MyHackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Обработчик удаления хакатона
  const handleDeleteHackathon = async (hackathonId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот хакатон из списка?')) {
      return;
    }

    try {
      const response = await deleteMyHackathon(hackathonId);
      
      if (response.success) {
        // Удаляем хакатон из списка
        setMyHackathons(prev => prev.filter(h => h.id !== hackathonId));
      } else {
        alert('Не удалось удалить хакатон');
      }
    } catch (error) {
      console.error('Ошибка при удалении хакатона:', error);
      alert('Произошла ошибка при удалении хакатона');
    }
  };

  useEffect(() => {
    // Загружаем данные о моих хакатонах при монтировании компонента
    const loadMyHackathons = async () => {
      try {
        setLoading(true);
        const response = await getMyHackathons();
        
        if (response.success) {
          setMyHackathons(response.data);
        } else {
          setError(response.message || 'Не удалось загрузить мои хакатоны');
        }
      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        console.error('Ошибка загрузки моих хакатонов:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMyHackathons();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Мои хакатоны</h1>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Мои хакатоны</h1>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Заголовок */}
        <h1 className={styles.title}>Мои хакатоны</h1>
        
        {/* Список хакатонов */}
        <div className={styles.hackathonsList}>
        {myHackathons.map((hackathon) => (
          <div
            key={hackathon.id}
            className={styles.hackathonCard}
            onClick={() => {
              // В режиме редактирования не переходим на страницу команды
              if (!isEditing) {
                navigate(`/hackathon/${hackathon.id}/team?role=${hackathon.role}`);
              }
            }}
          >
            {/* Обводка как у стеклянных кнопок */}
            <div className={styles.hackathonCardBorderTop}></div>
            <div className={styles.hackathonCardBorderRight}></div>
            <div className={styles.hackathonCardBorderBottom}></div>
            <div className={styles.hackathonCardBorderLeft}></div>
            
            <div className={styles.imageContainer}>
              <div className={styles.imagePlaceholder}></div>
              {hackathon.imageUrl && (
                <img 
                  src={hackathon.imageUrl} 
                  alt={hackathon.name}
                  className={styles.hackathonImage}
                  onError={(e) => {
                    // Если изображение не загрузилось, скрываем его
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className={styles.content}>
              <h1 className={styles.name}>{hackathon.name}</h1>
              <p className={styles.date}>{hackathon.date}</p>
            </div>

            {/* Иконка корзины в правом нижнем углу (только в режиме редактирования) */}
            {isEditing && (
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation(); // Предотвращаем переход на страницу команды
                  handleDeleteHackathon(hackathon.id);
                }}
                title="Удалить"
              >
                <GoTrash />
              </button>
            )}
          </div>
        ))}
        </div>
      </div>
      
      {/* Кнопка редактировать */}
      <div className={styles.editButtonContainer}>
        <button 
          className={styles.editButton}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Готово' : 'Редактировать'}
        </button>
      </div>
    </div>
  );
};

