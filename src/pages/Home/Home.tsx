import { useState, useEffect, useMemo } from 'react';
import { ButtonSimple } from '../../components/ui/Button/button';
import { Input } from '../../components/ui/Input/input';
import { IconButton } from '../../components/ui/IconButton/iconButton';
import { IoFilterSharp } from "react-icons/io5";
import { getHackathons } from '../../api/api';
import type { Hackathon } from '../../api/types';
import { FilterPanel, type FilterOption } from '../../components/FilterPanel/FilterPanel';
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
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    // Загружаем данные о хакатонах при монтировании компонента
    const loadHackathons = async () => {
      try {
        setLoading(true);
        const response = await getHackathons();
        
        if (response.success) {
          setHackathons(response.data);
        } else {
          setError(response.message || 'Не удалось загрузить хакатоны');
        }
      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        console.error('Ошибка загрузки хакатонов:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHackathons();
  }, []);

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
            onClick={() => onHackathonClick ? onHackathonClick(hackathon.id) : alert(`Открыть ${hackathon.name}`)}
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
              <p className={styles.hackathonDate}>{hackathon.date}</p>
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

