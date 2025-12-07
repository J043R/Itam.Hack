import { useState, useEffect, useRef } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import { getAnalytics } from '../../../api/api';
import type { AnalyticsData } from '../../../api/types';
import styles from './Analytics.module.css';

export const Analytics = () => {
  const [selectedDate, setSelectedDate] = useState('май, 2025 г.');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Генерируем список месяцев для выбора динамически
  const generateDateOptions = () => {
    const months = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];
    
    const options: string[] = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Генерируем даты: начиная с 2 лет назад до 1 года вперед
    const startYear = currentYear - 2;
    const endYear = currentYear + 1;
    
    for (let year = startYear; year <= endYear; year++) {
      months.forEach((month, monthIndex) => {
        // Для текущего года показываем только прошедшие месяцы и текущий
        // Для будущих лет показываем все месяцы
        // Для прошлых лет показываем все месяцы
        if (year === currentYear && monthIndex > currentMonth) {
          return; // Пропускаем будущие месяцы текущего года
        }
        options.push(`${month}, ${year} г.`);
      });
    }
    
    // Сортируем в обратном порядке (новые сначала)
    return options.reverse();
  };

  const dateOptions = generateDateOptions();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await getAnalytics(selectedDate);
        if (response.success) {
          setAnalyticsData(response.data);
        } else {
          console.error('Ошибка загрузки аналитики:', response.message);
          setAnalyticsData(null);
        }
      } catch (err) {
        console.error('Ошибка загрузки аналитики:', err);
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [selectedDate]);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };

    if (isDateDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDateDropdownOpen]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setIsDateDropdownOpen(false);
  };

  const analyticsCards = analyticsData ? [
    { id: 1, label: 'Участники', value: Math.max(0, analyticsData.participants) },
    { id: 2, label: 'Распределение\nролей', value: Math.max(0, analyticsData.roleDistribution) },
    { id: 3, label: 'Команды', value: Math.max(0, analyticsData.teams) },
    { id: 4, label: 'Без команды', value: Math.max(0, analyticsData.withoutTeam) }
  ] : [];

  if (loading) {
    return (
      <div className={styles.analytics}>
        <div className={styles.mainContent}>
          <p style={{ color: '#E7E3D8' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analytics}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Аналитика</h1>
        
        {/* Селектор даты */}
        <div className={styles.dateSelectorContainer} ref={dropdownRef}>
          <button
            type="button"
            className={styles.dateSelector}
            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
          >
            <IoChevronDown className={`${styles.chevronIcon} ${isDateDropdownOpen ? styles.chevronIconOpen : ''}`} />
            <span className={styles.dateText}>{selectedDate}</span>
          </button>
          
          {isDateDropdownOpen && (
            <div className={styles.dateDropdown}>
              {dateOptions.map((date) => (
                <button
                  key={date}
                  type="button"
                  className={`${styles.dateOption} ${selectedDate === date ? styles.dateOptionActive : ''}`}
                  onClick={() => handleDateSelect(date)}
                >
                  {date}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Карточки аналитики */}
        <div className={styles.cardsGrid}>
          {analyticsCards.map((card) => (
            <div key={card.id} className={styles.analyticsCard}>
              {/* Верхний border */}
              <div className={styles.cardBorderTop}></div>
              {/* Правый border */}
              <div className={styles.cardBorderRight}></div>
              {/* Нижний border */}
              <div className={styles.cardBorderBottom}></div>
              {/* Левый border */}
              <div className={styles.cardBorderLeft}></div>
              <div className={styles.cardLabel}>{card.label}</div>
              <div className={styles.cardValue}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

