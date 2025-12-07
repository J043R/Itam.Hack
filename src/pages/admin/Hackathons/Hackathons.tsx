import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input/input';
import { ButtonSimple } from '../../../components/ui/Button/button';
import styles from './Hackathons.module.css';

export const Hackathons = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  // Моковые данные для 12 хакатонов
  const hackathons = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: 'Название хака',
    date: 'Дата',
    description: 'Описание хака'
  }));

  return (
    <div className={styles.hackathons}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Хакатоны</h1>
        <div className={styles.hackathonsList}>
          {hackathons.map((hackathon) => (
            <div key={hackathon.id} className={styles.hackathonCard}>
              {/* Обводка как у стеклянных кнопок */}
              <div className={styles.cardBorderTop}></div>
              <div className={styles.cardBorderRight}></div>
              <div className={styles.cardBorderBottom}></div>
              <div className={styles.cardBorderLeft}></div>
              
              <div className={styles.cardImagePlaceholder}></div>
              <div className={styles.hackathonContent}>
                <h2 className={styles.hackathonName}>{hackathon.name}</h2>
                <p className={styles.hackathonDate}>{hackathon.date}</p>
                <p className={styles.hackathonDescription}>
                  {hackathon.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.sidebar}>
        <div className={styles.sidebarContent}>
          <div className={styles.searchContainer}>
            <Input
              type="text"
              placeholder="Поиск"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              variant="form"
              className={styles.searchInput}
            />
          </div>
          <div className={styles.buttonsContainer}>
            <ButtonSimple
              type="button-primary"
              size="M"
              className={styles.createButton}
              onClick={() => navigate('/admin/hackathons/create')}
            >
              Создать хакатон
            </ButtonSimple>
            <ButtonSimple
              type="entry-primary"
              size="M"
              className={styles.editButton}
              onClick={() => navigate('/admin/hackathons/edit')}
            >
              Редактировать хакатон
            </ButtonSimple>
          </div>
        </div>
      </div>
    </div>
  );
};

