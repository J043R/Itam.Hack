import { useState, useEffect } from 'react';
import type { FilterOption } from '../../api/types';
import styles from './AdminParticipantFilterPanel.module.css';

export interface AdminFilterState {
  hackathons: string[];
  roles: string[];
  statuses: string[];
  stacks: string[];
}

interface AdminParticipantFilterPanelProps {
  hackathons: string[];
  roles: FilterOption[];
  selectedFilters: AdminFilterState;
  onFilterChange: (filters: AdminFilterState) => void;
}

const statusOptions = [
  { id: 'free', label: 'Свободен', value: 'free' },
  { id: 'in-team', label: 'В команде', value: 'in-team' }
];

export const AdminParticipantFilterPanel = ({
  hackathons,
  roles,
  selectedFilters,
  onFilterChange
}: AdminParticipantFilterPanelProps) => {
  const [localFilters, setLocalFilters] = useState<AdminFilterState>(selectedFilters);

  useEffect(() => {
    setLocalFilters(selectedFilters);
  }, [selectedFilters]);

  const handleHackathonToggle = (hackathonName: string) => {
    const newHackathons = localFilters.hackathons.includes(hackathonName)
      ? localFilters.hackathons.filter(h => h !== hackathonName)
      : [...localFilters.hackathons, hackathonName];
    setLocalFilters({ ...localFilters, hackathons: newHackathons });
    onFilterChange({ ...localFilters, hackathons: newHackathons });
  };

  const handleRoleToggle = (value: string) => {
    const newRoles = localFilters.roles.includes(value)
      ? localFilters.roles.filter(r => r !== value)
      : [...localFilters.roles, value];
    setLocalFilters({ ...localFilters, roles: newRoles });
    onFilterChange({ ...localFilters, roles: newRoles });
  };

  const handleStatusToggle = (value: string) => {
    const newStatuses = localFilters.statuses.includes(value)
      ? localFilters.statuses.filter(s => s !== value)
      : [...localFilters.statuses, value];
    setLocalFilters({ ...localFilters, statuses: newStatuses });
    onFilterChange({ ...localFilters, statuses: newStatuses });
  };

  return (
    <div className={styles.filterPanel}>
      <h2 className={styles.filterTitle}>Фильтр</h2>
      
      {/* Секция Хакатоны */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Хакатоны</h3>
        <div className={styles.hackathonsButtons}>
          {hackathons.map((hackathonName) => (
            <button
              key={hackathonName}
              type="button"
              className={`${styles.hackathonButton} ${localFilters.hackathons.includes(hackathonName) ? styles.hackathonButtonActive : ''}`}
              onClick={() => handleHackathonToggle(hackathonName)}
            >
              {hackathonName}
            </button>
          ))}
        </div>
      </div>

      {/* Секция Роль */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Роль</h3>
        <div className={styles.optionsList}>
          {roles.map((option) => (
            <div
              key={option.id}
              className={styles.optionItem}
              onClick={() => handleRoleToggle(option.value)}
            >
              <div
                className={`${styles.checkbox} ${localFilters.roles.includes(option.value) ? styles.checkboxChecked : ''}`}
              >
                {localFilters.roles.includes(option.value) && (
                  <div className={styles.checkmark}></div>
                )}
              </div>
              <span className={styles.optionLabel}>{option.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Секция Статус */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Статус</h3>
        <div className={styles.optionsList}>
          {statusOptions.map((option) => (
            <div
              key={option.id}
              className={styles.optionItem}
              onClick={() => handleStatusToggle(option.value)}
            >
              <div
                className={`${styles.checkbox} ${localFilters.statuses.includes(option.value) ? styles.checkboxChecked : ''}`}
              >
                {localFilters.statuses.includes(option.value) && (
                  <div className={styles.checkmark}></div>
                )}
              </div>
              <span className={styles.optionLabel}>{option.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

