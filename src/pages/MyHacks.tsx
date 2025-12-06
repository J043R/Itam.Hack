import { useNavigate } from 'react-router-dom';
import styles from './MyHacks.module.css';

export const MyHacks = () => {
  const navigate = useNavigate();

  // Тестовые данные для моих хакатонов
  // Чтобы добавить новый хакатон, просто добавьте объект в этот массив
  const myHackathons = [
    {
      id: '1',
      name: 'AI Hackathon 2024',
      date: '15-17 марта 2024',
      imageUrl: '/images/hackathon1.jpg' // URL изображения хакатона
    },
    {
      id: '2',
      name: 'Web Development Challenge',
      date: '22-24 марта 2024',
      imageUrl: '/images/hackathon2.jpg'
    },
    {
      id: '3',
      name: 'Mobile App Contest',
      date: '5-7 апреля 2024',
      imageUrl: '/images/hackathon3.jpg'
    },
    {
      id: '4',
      name: 'Blockchain Innovation',
      date: '12-14 апреля 2024',
      imageUrl: '/images/hackathon4.jpg'
    }
  ];

  const handleHackathonClick = (hackathonId: string) => {
    navigate(`/hackathon/${hackathonId}`);
  };

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
            onClick={() => handleHackathonClick(hackathon.id)}
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
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

