import { useParams, useNavigate } from 'react-router-dom';
import { ButtonSimple } from '../../components/ui/Button/button';
import styles from './InsideHack.module.css';

export const InsideHack = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Временные данные для хакатона (позже будут загружаться с бэкенда)
  const hackathonData = {
    id: id || '1',
    name: 'AI Hackathon 2024',
    date: '15-17 марта 2024',
    description: 'Создайте инновационные решения с использованием искусственного интеллекта'
  };

  const handleButtonClick = (text: string) => {
    if (text === 'Создать команду' || text === 'Участники') {
      navigate(`/hackathon/${id}/users`);
    } else if (text === 'Моя команда') {
      // Здесь будет переход на страницу "Моя команда"
      console.log('Переход на страницу "Моя команда"');
    }
  };

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

