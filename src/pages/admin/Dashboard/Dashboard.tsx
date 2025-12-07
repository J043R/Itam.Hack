import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonSimple } from '../../../components/ui/Button/button';
import { ExportModal } from '../ExportModal/ExportModal';
import styles from './Dashboard.module.css';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const menuCards = [
    { id: 1, title: 'Хакатоны', path: '/admin/hackathons', image: '/images/Star.png' },
    { id: 2, title: 'Участники', path: '/admin/users', image: '/images/person.png' },
    { id: 3, title: 'Настройки', path: '/admin/settings', image: '/images/Fly.png' },
    { id: 4, title: 'Команды', path: '/admin/teams', image: '/images/sms.png' },
    { id: 5, title: 'Аналитика', path: '/admin/analytics', image: '/images/world.png' },
    { id: 6, title: 'Экспорт CSV', path: '/admin/export', image: '/images/windows.png', isExport: true },
  ];

  const handleCardClick = (card: typeof menuCards[0]) => {
    if (card.isExport) {
      setIsExportModalOpen(true);
    } else {
      navigate(card.path);
    }
  };

  return (
    <>
      <div className={styles.dashboard}>
        <div className={styles.cardsRow}>
          {menuCards.slice(0, 3).map((card) => (
            <ButtonSimple 
              key={card.id}
              type="glass-card-large"
              className={styles.glassButton}
              onClick={() => handleCardClick(card)}
            >
              <span className={styles.cardTitle}>{card.title}</span>
              <img src={card.image} alt={card.title} className={styles.cardImage} />
            </ButtonSimple>
          ))}
        </div>
        <div className={styles.cardsRow}>
          {menuCards.slice(3, 6).map((card) => (
            <ButtonSimple 
              key={card.id}
              type="glass-card-large"
              className={styles.glassButton}
              onClick={() => handleCardClick(card)}
            >
              <span className={styles.cardTitle}>{card.title}</span>
              <img src={card.image} alt={card.title} className={styles.cardImage} />
            </ButtonSimple>
          ))}
        </div>
      </div>
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />
    </>
  );
};

