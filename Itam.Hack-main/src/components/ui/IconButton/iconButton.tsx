import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { useState } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode; // Иконка (может быть SVG, компонент или изображение)
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'transparent';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string; // Для доступности
}

export const IconButton = ({
  icon,
  size = 'md',
  variant = 'default',
  disabled = false,
  onClick,
  className = '',
  'aria-label': ariaLabel,
  ...props
}: IconButtonProps) => {
  
  const [isHover, setIsHover] = useState(false);
  
  // Размеры для разных вариантов
  const getSizeStyles = () => {
    const sizes = {
      xs: { width: '24px', height: '24px', padding: '4px' },
      sm: { width: '32px', height: '32px', padding: '6px' },
      md: { width: '40px', height: '40px', padding: '8px' },
      lg: { width: '48px', height: '48px', padding: '10px' },
    };
    return sizes[size];
  };
  
  // Стили для разных вариантов
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      userSelect: 'none',
      ...getSizeStyles(),
    };
    
    if (variant === 'glass') {
      baseStyles.backgroundColor = isHover && !disabled 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(255, 255, 255, 0.05)';
      baseStyles.backdropFilter = 'blur(10px)';
      baseStyles.border = '1px solid rgba(255, 255, 255, 0.1)';
    } else if (variant === 'transparent') {
      baseStyles.backgroundColor = 'transparent';
      baseStyles.border = 'none';
      baseStyles.padding = '0';
      baseStyles.boxShadow = 'none';
      baseStyles.background = 'transparent';
      baseStyles.width = 'auto'; // Убираем фиксированную ширину
      baseStyles.height = 'auto'; // Убираем фиксированную высоту
      baseStyles.minWidth = 'auto';
      baseStyles.minHeight = 'auto';
    } else {
      // default
      baseStyles.backgroundColor = isHover && !disabled 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(255, 255, 255, 0.05)';
    }
    
    if (disabled) {
      baseStyles.opacity = '0.5';
    }
    
    return baseStyles;
  };
  
  return (
    <button
      style={getVariantStyles()}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setIsHover(true)}
      onMouseLeave={() => !disabled && setIsHover(false)}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
};

