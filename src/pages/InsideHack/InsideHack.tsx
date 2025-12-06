import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ButtonSimple } from '../../components/ui/Button/button';
import { getHackathonById } from '../../api/api';
import type { Hackathon } from '../../api/types';
import styles from './InsideHack.module.css';

export const InsideHack = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hackathonData, setHackathonData] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Загружаем данные о хакатоне при монтировании компонента
    const loadHackathon = async () => {
      if (!id) {
        setError('ID хакатона не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getHackathonById(id);
        
        if (response.success) {
          setHackathonData(response.data);
        } else {
          setError(response.message || 'Не удалось загрузить данные хакатона');
        }
      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        console.error('Ошибка загрузки хакатона:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHackathon();
  }, [id]);

  const handleButtonClick = (text: string) => {
    if (text === 'Создать команду' || text === 'Участники') {
      navigate(`/hackathon/${id}/users`);
    } else if (text === 'Моя команда') {
      // Здесь будет переход на страницу "Моя команда"
      navigate(`/hackathon/${id}/team`);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error || !hackathonData) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'red' }}>{error || 'Хакатон не найден'}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.hackathonCard}>
        {/* Обводка как у стеклянных кнопок */}
        <div className={styles.hackathonCardBorderTop}></div>
        <div className={styles.hackathonCardBorderRight}></div>
        <div className={styles.hackathonCardBorderBottom}></div>
        <div className={styles.hackathonCardBorderLeft}></div>
        
        <div className={styles.imageContainer}>
          <div className={styles.imagePlaceholder}></div>
        </div>
        <div className={styles.content}>
          <h1 className={styles.name}>{hackathonData.name}</h1>
          <p className={styles.date}>{hackathonData.date}</p>
        </div>
      </div>
      
      {/* Три кнопки */}
      <div className={styles.emptyCardsContainer}>
        {[
          { index: 1, text: 'Создать команду', image: '/images/3D.png' },
          { index: 2, text: 'Моя команда', image: '/images/3D2.png' },
          { index: 3, text: 'Участники', image: '/images/3D3.png' }
        ].map(({ index, text, image }) => (
          <div key={index} className={styles.buttonWithImage}>
            <ButtonSimple
              type="glass-card-wide"
              className={styles.actionButton}
              onClick={() => handleButtonClick(text)}
            >
              <div className={styles.emptyCardText}>{text}</div>
            </ButtonSimple>
            <img src={image} alt={text} className={styles.buttonImage} />
          </div>
        ))}
      </div>
    </div>
  );
};

