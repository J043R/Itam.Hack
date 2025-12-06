import type { ReactNode } from 'react';
import { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title: _title, 
  children,
  className = '' 
}: ModalProps) => {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Блокируем скролл body при открытом модальном окне
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  console.log('Modal render, isOpen:', isOpen, 'className:', className);
  
  if (!isOpen) {
    console.log('Modal не открыт, возвращаем null');
    return null;
  }

  console.log('Modal рендерится, должен быть виден');
  
  // Определяем z-index в зависимости от className
  const overlayZIndex = className.includes('formModal') ? 10001 : 10000;
  
  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      style={{ zIndex: overlayZIndex }}
    >
      <div 
        className={`${styles.modal} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

