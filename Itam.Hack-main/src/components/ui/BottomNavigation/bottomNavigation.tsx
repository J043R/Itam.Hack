import type { ReactNode } from 'react';
import styles from './bottomNavigation.module.css';

interface BottomNavigationItem {
  icon: ReactNode;
  onClick?: () => void;
  label?: string;
  active?: boolean;
}

interface BottomNavigationProps {
  items: BottomNavigationItem[];
  className?: string;
}

export const BottomNavigation = ({ items, className = '' }: BottomNavigationProps) => {
  return (
    <nav className={`${styles.bottomNavigation} ${className}`}>
      <div className={styles.container}>
        {items.map((item, index) => (
          <button
            key={index}
            className={`${styles.navButton} ${item.active ? styles.active : ''}`}
            onClick={item.onClick}
            aria-label={item.label || `Navigation item ${index + 1}`}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </nav>
  );
};

