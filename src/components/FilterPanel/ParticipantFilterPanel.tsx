import { useState, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import styles from './ParticipantFilterPanel.module.css';

export interface FilterSection {
  id: string;
  title: string;
  options: Array<{
    id: string;
    label: string;
    value: string;
  }>;
}

interface ParticipantFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sections: FilterSection[];
  selectedFilters: { [sectionId: string]: string[] };
  onFilterChange: (selectedFilters: { [sectionId: string]: string[] }) => void;
}

export const ParticipantFilterPanel = ({
  isOpen,
  onClose,
  sections,
  selectedFilters,
  onFilterChange
}: ParticipantFilterPanelProps) => {
  const [localSelected, setLocalSelected] = useState<{ [sectionId: string]: string[] }>(selectedFilters);
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

  const handleToggle = (sectionId: string, value: string) => {
    setLocalSelected(prev => {
      const sectionFilters = prev[sectionId] || [];
      if (sectionFilters.includes(value)) {
        return {
          ...prev,
          [sectionId]: sectionFilters.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [sectionId]: [...sectionFilters, value]
        };
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
          <h2 className={styles.title}>Фильтры</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
            <IoClose />
          </button>
        </div>

        <div className={styles.sections}>
          {/* Первая секция - Роль (полная ширина) */}
          <div key={sections[0].id} className={`${styles.section} ${styles.sectionFull}`}>
            <h3 className={styles.sectionTitle}>{sections[0].title}</h3>
            <div className={styles.optionsList}>
              {sections[0].options.map((option) => (
                <div
                  key={option.id}
                  className={styles.optionItem}
                  onClick={() => handleToggle(sections[0].id, option.value)}
                >
                  <div
                    className={`${styles.checkbox} ${(localSelected[sections[0].id] || []).includes(option.value) ? styles.checkboxChecked : ''}`}
                  >
                    {(localSelected[sections[0].id] || []).includes(option.value) && (
                      <div className={styles.checkmark}></div>
                    )}
                  </div>
                  <span className={styles.optionLabel}>{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Вторая и третья секции - рядом друг с другом */}
          <div className={styles.bottomSections}>
            {sections.slice(1).map((section) => (
              <div key={section.id} className={`${styles.section} ${styles.sectionHalf}`}>
                <h3 className={styles.sectionTitle}>{section.title}</h3>
                <div className={styles.optionsList}>
                  {section.options.map((option) => (
                    <div
                      key={option.id}
                      className={styles.optionItem}
                      onClick={() => handleToggle(section.id, option.value)}
                    >
                      <div
                        className={`${styles.checkbox} ${(localSelected[section.id] || []).includes(option.value) ? styles.checkboxChecked : ''}`}
                      >
                        {(localSelected[section.id] || []).includes(option.value) && (
                          <div className={styles.checkmark}></div>
                        )}
                      </div>
                      <span className={styles.optionLabel}>{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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

