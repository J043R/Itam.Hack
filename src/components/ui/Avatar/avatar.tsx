import type { ImgHTMLAttributes } from 'react';
import styles from './Avatar.module.css';

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '100';
  name?: string; // Для отображения инициалов если нет картинки
  online?: boolean; // Индикатор онлайн статуса
}

export const Avatar = ({
  src,
  alt = '',
  size = 'md',
  name,
  online,
  className = '',
  ...props
}: AvatarProps) => {
  
  const avatarClasses = [
    styles.avatar,
    styles[`size-${size}`],
    className
  ]
    .filter(Boolean)
    .join(' ');
  
  // Если есть имя но нет картинки - показываем инициалы
  const getInitials = () => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Если есть src - показываем картинку
  if (src) {
    return (
      <div className={styles.avatarContainer}>
        <img
          src={src}
          alt={alt || name || 'Аватар'}
          className={avatarClasses}
          {...props}
        />
        {online !== undefined && (
          <div className={`${styles.status} ${online ? styles.online : styles.offline}`} />
        )}
      </div>
    );
  }
  
  // Если нет картинки - показываем инициалы или пустой круг
  return (
    <div className={styles.avatarContainer}>
      <div className={`${avatarClasses} ${styles.initials}`}>
        {name ? getInitials() : ''}
      </div>
      {online !== undefined && (
        <div className={`${styles.status} ${online ? styles.online : styles.offline}`} />
      )}
    </div>
  );
};