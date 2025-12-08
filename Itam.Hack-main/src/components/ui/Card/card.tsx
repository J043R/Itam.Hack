import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
}: CardProps) => {
  
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hover && styles.hover,
    onClick && styles.clickable,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};