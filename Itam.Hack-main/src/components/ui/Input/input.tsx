import type { InputHTMLAttributes } from 'react';
import styles from './input.module.css';

type InputSize = 'XS' | 'S' | 'M';
type InputOpacity = 20 | 30;
type InputVariant = 'default' | 'register' | 'form';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  opacity?: InputOpacity;
  variant?: InputVariant;
}

export const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  className = '',
  label,
  error,
  helperText,
  id,
  size,
  opacity,
  variant,
  ...props
}: InputProps) => {
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Определяем класс стиля на основе размера, прозрачности и варианта
  let sizeClass = '';
  const hasSpecialStyle = variant === 'register' || variant === 'form' || (size && opacity);
  
  if (variant === 'register') {
    sizeClass = styles.inputRegister;
  } else if (variant === 'form') {
    sizeClass = styles.inputForm;
  } else if (size && opacity) {
    sizeClass = styles[`input${size}${opacity}` as keyof typeof styles] as string;
  }
  
  // Собираем классы для input
  // Базовый стиль применяем только если нет специального стиля
  const inputClasses = [
    !hasSpecialStyle ? styles.input : '', // Базовый стиль только для обычных полей
    sizeClass,
    error && styles.inputError,
    className
  ]
    .filter(Boolean)
    .join(' ');
  
  return (
    <div className={styles.inputContainer}>
      {label && (
        <label htmlFor={inputId} className={styles.inputLabel}>
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      
      {(error || helperText) && (
        <div className={styles.inputMessage}>
          {error ? (
            <span className={styles.inputErrorText}>{error}</span>
          ) : (
            <span className={styles.inputHelperText}>{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
};