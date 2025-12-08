import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ButtonSimple } from '../../components/ui/Button/button';
import { Input } from '../../components/ui/Input/input';
import { IconButton } from '../../components/ui/IconButton/iconButton';
import { IoFilterSharp } from "react-icons/io5";
import { getHackathons, getHackathonById } from '../../api/api';
import type { Hackathon } from '../../api/types';
import { FilterPanel, type FilterOption } from '../../components/FilterPanel/FilterPanel';
import { formatDateToRussian } from '../../utils/dateFormat';
import styles from './Home.module.css';

interface HomeProps {
  onHackathonClick?: (hackathonId: string) => void;
}

const filterOptions: FilterOption[] = [
  { id: '1', label: 'Через неделю', value: 'week' },
  { id: '2', label: 'Через 2 недели', value: '2weeks' },
  { id: '3', label: 'Через месяц', value: 'month' }
];

export const Home = ({ onHackathonClick }: HomeProps) => {
  const location = useLocation();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    // Загружаем данные о хакатонах при монтировании и при переходе на главную
    const loadHackathons = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Loading hackathons from /api/v1/hackathons');
        const response = await getHackathons();
        
        if (response.success && response.data) {
          console.log('✅ Hackathons loaded:', response.data.length, 'items');
          // Форматируем даты в российский формат
          const formattedHackathons = response.data.map(hackathon => ({
            ...hackathon,
            date: formatDateToRussian(hackathon.date)
          }));
          setHackathons(formattedHackathons);
        } else {
          const errorMessage = response.message || 'Не удалось загрузить хакатоны';
          console.error('❌ Failed to load hackathons:', errorMessage);
          setError(errorMessage);
        }
      } catch (err) {
        const errorMessage = 'Произошла ошибка при загрузке данных';
        console.error('❌ Error loading hackathons:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Загружаем данные при монтировании и при переходе на главную (pathname === '/')
    if (location.pathname === '/') {
      loadHackathons();
    }
  }, [location.pathname]);

  // Функция для определения, попадает ли дата хакатона в выбранный фильтр
  const matchesFilter = (hackathonDate: string, filterValue: string): boolean => {
    const today = new Date();
    const hackathonDateObj = parseDate(hackathonDate);
    
    if (!hackathonDateObj) return false;

    const daysDiff = Math.ceil((hackathonDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    switch (filterValue) {
      case 'week':
        return daysDiff >= 0 && daysDiff <= 7;
      case '2weeks':
        return daysDiff >= 8 && daysDiff <= 14;
      case 'month':
        return daysDiff >= 15 && daysDiff <= 30;
      default:
        return false;
    }
  };

  // Парсинг даты из строки формата "15-17 марта 2024"
  const parseDate = (dateString: string): Date | null => {
    try {
      // Пытаемся извлечь дату из строки
      const months: { [key: string]: number } = {
        'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
        'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
        'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
      };

      const parts = dateString.split(' ');
      if (parts.length >= 3) {
        const day = parseInt(parts[0].split('-')[0]);
        const monthName = parts[1].toLowerCase();
        const year = parseInt(parts[2]);

        if (months[monthName] !== undefined) {
          return new Date(year, months[monthName], day);
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Фильтрация хакатонов
  const filteredHackathons = useMemo(() => {
    if (selectedFilters.length === 0) {
      return hackathons;
    }

    return hackathons.filter(hackathon => {
      return selectedFilters.some(filter => matchesFilter(hackathon.date, filter));
    });
  }, [hackathons, selectedFilters]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Хакатоны</h1>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Хакатоны</h1>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <h1 className={styles.title}>Хакатоны</h1>
      
      {/* Фильтры и поиск */}
      <div className={styles.searchSection}>
        <IconButton 
          icon={<IoFilterSharp style={{ fontSize: '20px', color: '#E7E3D8' }} />}
          onClick={() => setIsFilterOpen(true)}
          aria-label="Фильтры"
          variant="transparent"
        />
        <Input 
          size="XS" 
          opacity={30} 
          placeholder="Поиск"
        />
      </div>

      {/* Панель фильтров */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        options={filterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={setSelectedFilters}
        title="Фильтры"
      />

      {/* Список хакатонов */}
      <div className={styles.hackathonsList}>
        {filteredHackathons.map((hackathon) => (
          <ButtonSimple
            key={hackathon.id}
            type="glass-card-large"
            onClick={async () => {
              console.log('🎯 Hackathon clicked:', hackathon.name, 'ID:', hackathon.id);
              
              // Отправляем GET запрос на /api/v1/hackathons/{hackathon_id}/info
              try {
                const response = await getHackathonById(hackathon.id);
                
                if (response.success && response.data) {
                  console.log('✅ Hackathon info loaded:', response.data);
                  // Переходим на страницу хакатона после успешной загрузки
                  if (onHackathonClick) {
                    onHackathonClick(hackathon.id);
                  }
                } else {
                  console.error('❌ Failed to load hackathon info:', response.message);
                  alert('Не удалось загрузить информацию о хакатоне');
                }
              } catch (err) {
                console.error('❌ Error loading hackathon info:', err);
                alert('Произошла ошибка при загрузке информации о хакатоне');
              }
            }}
          >
            <div 
              className={styles.hackathonContent}
              style={{
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <h2 
                className={styles.hackathonName}
                style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  wordBreak: 'normal',
                  wordWrap: 'normal',
                  overflowWrap: 'normal',
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  display: 'block'
                }}
              >
                {hackathon.name}
              </h2>
              <p className={styles.hackathonDate}>{formatDateToRussian(hackathon.date)}</p>
              <p className={styles.hackathonDescription}>
                {hackathon.description}
              </p>
            </div>
          </ButtonSimple>
        ))}
      </div>
    </div>
  );
};

