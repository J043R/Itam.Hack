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

export const Analytics = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
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
          setSelectedHackathon(response.data[0]);
        }
      } catch (err) {
        console.error('Ошибка загрузки хакатонов:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHackathons();
  }, []);


  // Загружаем аналитику при выборе хакатона
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!selectedHackathon) return;
      
      try {
        setLoadingAnalytics(true);
        const response = await getHackathonAnalytics(selectedHackathon.id);
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
  }, [selectedHackathon]);

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

  const handleHackathonSelect = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
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
        
        {/* Селектор хакатона */}
        <div className={styles.dateSelectorContainer} ref={dropdownRef}>
          <button
            type="button"
            className={styles.dateSelector}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <IoChevronDown className={`${styles.chevronIcon} ${isDropdownOpen ? styles.chevronIconOpen : ''}`} />
            <span className={styles.dateText}>{selectedHackathon?.name || 'Выберите хакатон'}</span>
          </button>
          
          {isDropdownOpen && (
            <div className={styles.dateDropdown}>
              {hackathons.map((hackathon) => (
                <button
                  key={hackathon.id}
                  type="button"
                  className={`${styles.dateOption} ${selectedHackathon?.id === hackathon.id ? styles.dateOptionActive : ''}`}
                  onClick={() => handleHackathonSelect(hackathon)}
                >
                  {hackathon.name}
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
