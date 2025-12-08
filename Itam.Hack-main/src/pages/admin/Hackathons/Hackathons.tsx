import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/Input/input';
import { ButtonSimple } from '../../../components/ui/Button/button';
import { getHackathons } from '../../../api/api';
import type { Hackathon } from '../../../api/types';
import styles from './Hackathons.module.css';

export const Hackathons = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      setLoading(true);
      const response = await getHackathons();
      if (response.success) {
        setHackathons(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки хакатонов:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация по поиску
  const filteredHackathons = hackathons.filter(h => 
    h.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    h.description?.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className={styles.hackathons}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Хакатоны</h1>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : (
          <div className={styles.hackathonsList}>
            {filteredHackathons.length === 0 ? (
              <div className={styles.empty}>
                {searchValue ? 'Хакатоны не найдены' : 'Нет хакатонов'}
              </div>
            ) : (
              filteredHackathons.map((hackathon) => (
                <div 
                  key={hackathon.id} 
                  className={styles.hackathonCard}
                  onClick={() => navigate(`/admin/hackathons/${hackathon.id}/edit`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardBorderTop}></div>
                  <div className={styles.cardBorderRight}></div>
                  <div className={styles.cardBorderBottom}></div>
                  <div className={styles.cardBorderLeft}></div>
                  
                  <div 
                    className={styles.cardImagePlaceholder}
                    style={hackathon.imageUrl ? { 
                      backgroundImage: `url(${hackathon.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    } : undefined}
                  ></div>
                  <div className={styles.hackathonContent}>
                    <h2 className={styles.hackathonName}>{hackathon.name}</h2>
                    <p className={styles.hackathonDate}>{hackathon.date}</p>
                    <p className={styles.hackathonDescription}>
                      {hackathon.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
          </div>
        </div>
      </div>
    </div>
  );
};
