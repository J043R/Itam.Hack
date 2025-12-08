import { useState, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import styles from './FilterPanel.module.css';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  options: FilterOption[];
  selectedFilters: string[];
  onFilterChange: (selectedFilters: string[]) => void;
  title?: string;
}

export const FilterPanel = ({
  isOpen,
  onClose,
  options,
  selectedFilters,
  onFilterChange,
  title = 'Фильтры'
}: FilterPanelProps) => {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedFilters);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSelected(selectedFilters);
  }, [selectedFilters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      });
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleToggle = (value: string) => {
    setLocalSelected(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleApply = () => {
    onFilterChange(localSelected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.filterPanel} ref={panelRef}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
            <IoClose />
          </button>
        </div>
        
        <div className={styles.optionsList}>
          {options.map((option) => (
            <div
              key={option.id}
              className={styles.optionItem}
              onClick={() => handleToggle(option.value)}
            >
              <div
                className={`${styles.checkbox} ${localSelected.includes(option.value) ? styles.checkboxChecked : ''}`}
              >
                {localSelected.includes(option.value) && (
                  <div className={styles.checkmark}></div>
                )}
              </div>
              <span className={styles.optionLabel}>{option.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.applyButton} onClick={handleApply}>
            Применить
          </button>
        </div>
      </div>
    </>
  );
};

