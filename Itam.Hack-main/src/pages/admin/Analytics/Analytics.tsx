import { useState, useEffect, useRef } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import { getHackathons, getHackathonAnalytics } from '../../../api/api';
import type { Hackathon } from '../../../api/types';
import styles from './Analytics.module.css';

interface RoleStats {
  role: string;
  count: number;
}

interface HackathonStats {
  hackathon_id: string;
  hackathon_name: string;
  total_registered: number;
  total_participants_in_teams: number;
  total_teams: number;
  participants_without_team: number;
  team_formation_percentage: number;
  roles_stats: RoleStats[];
}

interface TeamComposition {
  team_id: string;
  team_name: string;
  hackathon_name: string;
  captain_name: string;
  members_count: number;
  max_size: number;
  members: string[];
}

interface AnalyticsResponse {
  hackathon_stats: HackathonStats;
  team_compositions: TeamComposition[];
}

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// Генерируем список месяцев с годами (последние 12 месяцев + текущий)
const generateMonthYearOptions = () => {
  const options: { id: string; name: string }[] = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    options.push({
      id: `${date.getMonth() + 1}-${year}`,
      name: `${monthName} ${year}`
    });
  }
  
  return options;
};

const MONTH_YEAR_OPTIONS = generateMonthYearOptions();

export const Analytics = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<{ id: string; name: string }>(
    MONTH_YEAR_OPTIONS[0]
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Загружаем список хакатонов
  useEffect(() => {
    const loadHackathons = async () => {
      try {
        setLoading(true);
        const response = await getHackathons();
        if (response.success && response.data.length > 0) {
          setHackathons(response.data);
        }
      } catch (err) {
        console.error('Ошибка загрузки хакатонов:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHackathons();
  }, []);


  // Загружаем аналитику при выборе месяца
  useEffect(() => {
    const loadAnalytics = async () => {
      if (hackathons.length === 0) return;
      
      // Парсим выбранный месяц и год
      const [monthStr, yearStr] = selectedMonth.id.split('-');
      const selectedMonthNum = parseInt(monthStr, 10);
      const selectedYear = parseInt(yearStr, 10);
      
      // Фильтруем хакатоны по выбранному месяцу
      const filteredHackathons = hackathons.filter(h => {
        if (!h.date_starts) return false;
        const hackathonDate = new Date(h.date_starts);
        return hackathonDate.getMonth() + 1 === selectedMonthNum && 
               hackathonDate.getFullYear() === selectedYear;
      });
      
      if (filteredHackathons.length === 0) {
        setAnalyticsData(null);
        return;
      }
      
      // Берём первый хакатон из отфильтрованных
      const hackathon = filteredHackathons[0];
      
      try {
        setLoadingAnalytics(true);
        const response = await getHackathonAnalytics(hackathon.id);
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
        setLoadingAnalytics(false);
      }
    };

    loadAnalytics();
  }, [hackathons, selectedMonth]);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleMonthSelect = (month: { id: string; name: string }) => {
    setSelectedMonth(month);
    setIsDropdownOpen(false);
  };

  if (loading) {
    return (
      <div className={styles.analytics}>
        <div className={styles.mainContent}>
          <p style={{ color: '#E7E3D8' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (hackathons.length === 0) {
    return (
      <div className={styles.analytics}>
        <div className={styles.mainContent}>
          <h1 className={styles.title}>Аналитика</h1>
          <p style={{ color: '#E7E3D8' }}>Нет доступных хакатонов</p>
        </div>
      </div>
    );
  }

  const stats = analyticsData?.hackathon_stats;

  return (
    <div className={styles.analytics}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Аналитика</h1>
        
        {/* Селектор месяца */}
        <div className={styles.dateSelectorContainer} ref={dropdownRef}>
          <button
            type="button"
            className={styles.dateSelector}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <IoChevronDown className={`${styles.chevronIcon} ${isDropdownOpen ? styles.chevronIconOpen : ''}`} />
            <span className={styles.dateText}>{selectedMonth.name}</span>
          </button>
          
          {isDropdownOpen && (
            <div className={styles.dateDropdown}>
              {MONTH_YEAR_OPTIONS.map((month) => (
                <button
                  key={month.id}
                  type="button"
                  className={`${styles.dateOption} ${selectedMonth.id === month.id ? styles.dateOptionActive : ''}`}
                  onClick={() => handleMonthSelect(month)}
                >
                  {month.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {loadingAnalytics ? (
          <p style={{ color: '#E7E3D8' }}>Загрузка аналитики...</p>
        ) : stats ? (
          <>
            {/* Карточки аналитики */}
            <div className={styles.cardsGrid}>
              <div className={styles.analyticsCard}>
                <div className={styles.cardBorderTop}></div>
                <div className={styles.cardBorderRight}></div>
                <div className={styles.cardBorderBottom}></div>
                <div className={styles.cardBorderLeft}></div>
                <div className={styles.cardLabel}>Зарегистрировано</div>
                <div className={styles.cardValue}>{stats.total_registered}</div>
              </div>
              
              <div className={styles.analyticsCard}>
                <div className={styles.cardBorderTop}></div>
                <div className={styles.cardBorderRight}></div>
                <div className={styles.cardBorderBottom}></div>
                <div className={styles.cardBorderLeft}></div>
                <div className={styles.cardLabel}>В командах</div>
                <div className={styles.cardValue}>{stats.total_participants_in_teams}</div>
              </div>
              
              <div className={styles.analyticsCard}>
                <div className={styles.cardBorderTop}></div>
                <div className={styles.cardBorderRight}></div>
                <div className={styles.cardBorderBottom}></div>
                <div className={styles.cardBorderLeft}></div>
                <div className={styles.cardLabel}>Команд</div>
                <div className={styles.cardValue}>{stats.total_teams}</div>
              </div>
              
              <div className={styles.analyticsCard}>
                <div className={styles.cardBorderTop}></div>
                <div className={styles.cardBorderRight}></div>
                <div className={styles.cardBorderBottom}></div>
                <div className={styles.cardBorderLeft}></div>
                <div className={styles.cardLabel}>Без команды</div>
                <div className={styles.cardValue}>{stats.participants_without_team}</div>
              </div>
            </div>

            {/* Процент формирования команд */}
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                Формирование команд: {stats.team_formation_percentage}%
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${stats.team_formation_percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Распределение по ролям */}
            {stats.roles_stats && stats.roles_stats.length > 0 && (
              <div className={styles.rolesSection}>
                <h2 className={styles.sectionTitle}>Распределение по ролям</h2>
                <div className={styles.rolesList}>
                  {stats.roles_stats.map((role, index) => (
                    <div key={index} className={styles.roleItem}>
                      <span className={styles.roleName}>{role.role}</span>
                      <span className={styles.roleCount}>{role.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p style={{ color: '#E7E3D8' }}>Нет данных для отображения</p>
        )}
      </div>
    </div>
  );
};
