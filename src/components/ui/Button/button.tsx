// components/ui/button/ButtonSimple.tsx
import type { ReactNode } from 'react';
import { useState } from 'react';

interface ButtonProps {
    type?: 'transparent' | 'secondary' | 'button-primary' | 'entry-primary' | 'button-secondary' | 
          'glass-card-large' | 'glass-card-small' | 'glass-card-wide' | 'glass-card-square' | 'glass-card-hackathon';
    size?: 'S' | 'M' | 'L';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void; 
    children: ReactNode;
    className?: string;
    imageUrl?: string; // URL картинки для кнопок с изображениями
    imagePosition?: 'left' | 'right' | 'center'; // Позиция картинки
    icon?: ReactNode; // Иконка для отображения в кнопке (SVG, компонент иконки и т.д.)
    iconOnly?: boolean; // Если true, показывать только иконку без текста
}

export const ButtonSimple = ({ 
  type = 'button-primary',
  size = 'M',
  disabled = false, 
  loading = false,
  onClick,
  children,
  className = '',
  imageUrl,
  imagePosition = 'center',
  icon,
  iconOnly = false,
}: ButtonProps) => {
  
  const [isHover, setIsHover] = useState(false);
  
  // Функция для получения стилей
  const getButtonStyles = () => {
    // Проверяем, является ли это glass-кнопкой
    const isGlassButton = type === 'glass-card-large' || 
                          type === 'glass-card-small' || 
                          type === 'glass-card-wide' || 
                          type === 'glass-card-square' || 
                          type === 'glass-card-hackathon';
    
    let styles: React.CSSProperties & { [key: string]: any } = {
      fontFamily: "'Inter', sans-serif",
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      outline: 'none',
      userSelect: 'none',
      color: '#E7E3D8',
      fontSize: '14px',
      margin: '10px'
    };
    
    // Для не-glass кнопок устанавливаем border: none
    if (!isGlassButton) {
      styles.border = 'none';
    }
    
    // Настраиваем толщину шрифта
    if (type === 'entry-primary') {
      styles.fontWeight = '600';
    } else {
      styles.fontWeight = '500';
    }
    
    // 1. ENTRY PRIMARY - особые правила!
    if (type === 'entry-primary') {
      styles.borderRadius = '5px';
      
      if (size === 'S') {
        styles.height = '30px';
        styles.padding = '0 15px';
      } else if (size === 'M') {
        styles.height = '40px';
        styles.padding = '0 100px';
      }
      
      // Entry Primary логика:
      // - Disabled: rgba(56, 14, 174, 0.35) - прозрачный
      // - Enabled: #4101F6 - яркий
      // - Hover: #380EAE - темнее
      
      if (disabled || loading) {
        // ЗАМОРОЖЕННОЕ состояние
        styles.backgroundColor = 'rgba(56, 14, 174, 0.35)';
        styles.color = 'rgba(231, 227, 216, 0.7)'; // Немного тусклее текст
        styles.cursor = 'not-allowed';
      } 
      // Активное состояние + hover
      else if (isHover) {
        // HOVER состояние (активная кнопка)
        styles.backgroundColor = '#380EAE'; // Темнее при наведении
      }
      else {
        // АКТИВНОЕ состояние (но не hover)
        styles.backgroundColor = '#4101F6'; // Яркий фиолетовый
      }
    }
    
    // 2. BUTTON PRIMARY (остальные кнопки - обычная логика)
    else if (type === 'button-primary') {
      styles.borderRadius = '10px';
      
      if (size === 'S') {
        styles.height = '30px';
        styles.width = '98px';
        styles.padding = '0 18px';
      } else if (size === 'M') {
        styles.height = '47px';
        styles.width = '163px';
        styles.padding = '0 10px';
      }
      
      // Обычная логика для Button Primary
      if (disabled || loading) {
        styles.backgroundColor = 'rgba(65, 1, 246, 0.5)';
        styles.color = 'rgba(231, 227, 216, 0.5)';
      } else if (isHover) {
        styles.backgroundColor = '#380EAE'; // hover
      } else {
        styles.backgroundColor = '#4101F6'; // default
      }
    }
    
    // 3. BUTTON SECONDARY
    else if (type === 'button-secondary') {
      styles.borderRadius = '10px';
      
      if (size === 'S') {
        styles.height = '30px';
        styles.width = '98px';
        styles.padding = '0 18px';
      } else if (size === 'M') {
        styles.height = '47px';
        styles.width = '163px';
        styles.padding = '0 10px';
      }
      
      if (disabled || loading) {
        styles.backgroundColor = 'rgba(101, 98, 109, 0.5)';
        styles.color = 'rgba(231, 227, 216, 0.5)';
      } else if (isHover) {
        styles.backgroundColor = '#7B7687';
      } else {
        styles.backgroundColor = '#65626D';
      }
    }
    
    // 4. TRANSPARENT
    else if (type === 'transparent') {
      styles.borderRadius = '10px';
      styles.border = '1px solid rgba(255, 255, 255, 0.1)';
      
      if (size === 'S') {
        styles.height = '78px';
        styles.width = '164px';
        styles.padding = '0 10px';
      } else if (size === 'M') {
        styles.height = '289px';
        styles.width = '295px';
        styles.padding = '0 16px';
      }
      
      if (disabled || loading) {
        styles.backgroundColor = 'rgba(255, 255, 255, 0.02)';
        styles.borderColor = 'rgba(255, 255, 255, 0.05)';
        styles.color = 'rgba(231, 227, 216, 0.3)';
      } else if (isHover) {
        styles.backgroundColor = 'rgba(255, 255, 255, 0.15)';
      } else {
        styles.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      }
    }
    
    // 5. GLASS CARD LARGE (295x289) - с картинкой сверху и текстом внизу
    else if (type === 'glass-card-large') {
      styles.width = '295px';
      styles.height = '289px';
      styles.borderRadius = '10px';
      styles.background = 'rgba(255, 255, 255, 0.05)'; // Прозрачность 5%
      styles.backgroundColor = 'rgba(255, 255, 255, 0.05)'; // Прозрачность 5%
      styles.backdropFilter = 'blur(20px) saturate(180%)'; // Увеличил blur для лучшего отражения фона
      styles.WebkitBackdropFilter = 'blur(20px) saturate(180%)'; // Увеличил blur для лучшего отражения фона
      styles.border = 'none'; // Border будет добавлен как отдельный элемент поверх
      styles.position = 'relative';
      styles.overflow = 'hidden';
      styles.padding = '16px';
      styles.flexDirection = 'column';
      styles.justifyContent = 'space-between';
      styles.willChange = 'backdrop-filter';
      styles.transform = 'translateZ(0)';
      styles.boxShadow = 'none'; // Убираем тень для лучшего эффекта стекла
      styles.isolation = 'isolate'; // Для правильной работы backdrop-filter
      
      if (disabled || loading) {
        styles.opacity = '0.5';
        styles.cursor = 'not-allowed';
      }
    }
    
    // 6. GLASS CARD SMALL (163x78) - без картинки
    else if (type === 'glass-card-small') {
      styles.width = '163px';
      styles.height = '78px';
      styles.borderRadius = '10px';
      styles.background = 'rgba(255, 255, 255, 0.05)'; // Прозрачность 5%
      styles.backgroundColor = 'rgba(255, 255, 255, 0.05)'; // Прозрачность 5%
      styles.backdropFilter = 'blur(20px) saturate(180%)'; // Увеличил blur для лучшего отражения фона
      styles.WebkitBackdropFilter = 'blur(20px) saturate(180%)'; // Увеличил blur для лучшего отражения фона
      styles.border = 'none'; // Border будет добавлен как отдельный элемент поверх
      styles.position = 'relative';
      styles.overflow = 'hidden';
      styles.padding = '0 16px';
      styles.willChange = 'backdrop-filter';
      styles.transform = 'translateZ(0)';
      styles.boxShadow = 'none';
      styles.isolation = 'isolate'; // Для правильной работы backdrop-filter
      
      if (disabled || loading) {
        styles.opacity = '0.5';
        styles.cursor = 'not-allowed';
      }
    }
    
    // 7. GLASS CARD WIDE (335x129) - картинка справа
    else if (type === 'glass-card-wide') {
      styles.width = '335px';
      styles.height = '129px';
      styles.borderRadius = '10px';
      styles.background = 'rgba(255, 255, 255, 0.05)'; // Прозрачность 5%
      styles.backgroundColor = 'rgba(255, 255, 255, 0.05)'; // Прозрачность 5%
      styles.backdropFilter = 'blur(20px) saturate(180%)'; // Увеличил blur для лучшего отражения фона
      styles.WebkitBackdropFilter = 'blur(20px) saturate(180%)'; // Увеличил blur для лучшего отражения фона
      styles.border = 'none'; // Border будет добавлен как отдельный элемент поверх
      styles.position = 'relative';
      styles.overflow = 'hidden';
      styles.padding = '0';
      styles.justifyContent = 'flex-start';
      styles.willChange = 'backdrop-filter';
      styles.transform = 'translateZ(0)';
      styles.boxShadow = 'none';
      styles.isolation = 'isolate'; // Для правильной работы backdrop-filter
      
      if (disabled || loading) {
        styles.opacity = '0.5';
        styles.cursor = 'not-allowed';
      }
    }
    
    // 8. GLASS CARD SQUARE (164x166) - с аватаркой пользователя и текстом
    else if (type === 'glass-card-square') {
      styles.width = '164px';
      styles.height = '166px';
      styles.borderRadius = '10px';
      styles.background = 'rgba(255, 255, 255, 0.05)'; // Прозрачность 5%
      styles.backgroundColor = 'rgba(255, 255, 255, 0.05)'; // Прозрачность 5%
      styles.backdropFilter = 'blur(20px) saturate(180%)'; // Увеличил blur для лучшего отражения фона
      styles.WebkitBackdropFilter = 'blur(20px) saturate(180%)'; // Увеличил blur для лучшего отражения фона
      styles.border = 'none'; // Border будет добавлен как отдельный элемент поверх
      styles.position = 'relative';
      styles.overflow = 'hidden';
      styles.padding = '0';
      styles.flexDirection = 'column';
      styles.alignItems = 'center';
      styles.willChange = 'backdrop-filter';
      styles.transform = 'translateZ(0)';
      styles.boxShadow = 'none';
      styles.isolation = 'isolate'; // Для правильной работы backdrop-filter
      
      if (disabled || loading) {
        styles.opacity = '0.5';
        styles.cursor = 'not-allowed';
      }
    }
    
    // 9. GLASS CARD HACKATHON (336x105) - картинка слева, текст справа
    else if (type === 'glass-card-hackathon') {
      styles.width = '336px';
      styles.height = '105px';
      styles.borderRadius = '10px';
      styles.background = 'rgba(255, 255, 255, 0.05)'; // Прозрачность 5%
      styles.backgroundColor = 'rgba(255, 255, 255, 0.05)'; // Прозрачность 5%
      styles.backdropFilter = 'blur(20px) saturate(180%)'; // Увеличил blur для лучшего отражения фона
      styles.WebkitBackdropFilter = 'blur(20px) saturate(180%)'; // Увеличил blur для лучшего отражения фона
      styles.border = 'none'; // Border будет добавлен как отдельный элемент поверх
      styles.position = 'relative';
      styles.overflow = 'hidden';
      styles.padding = '15px';
      styles.display = 'flex';
      styles.flexDirection = 'row';
      styles.alignItems = 'center';
      styles.gap = '15px';
      styles.willChange = 'backdrop-filter';
      styles.transform = 'translateZ(0)';
      styles.boxShadow = 'none';
      styles.isolation = 'isolate'; // Для правильной работы backdrop-filter
      
      if (disabled || loading) {
        styles.opacity = '0.5';
        styles.cursor = 'not-allowed';
      }
    }
    
    return styles;
  };
  
  const buttonStyles = getButtonStyles();
  
  // Обработчик клика по картинке (предотвращает всплытие)
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };
  
  // Рендер картинки для glass-card-large (263x136, отступ 16px со всех сторон)
  const renderCenterImage = () => {
    if (type === 'glass-card-large') {
      return (
        <div 
          style={{
            width: '263px',
            height: '136px',
            backgroundColor: '#939090',
            borderRadius: '10px',
            cursor: 'pointer',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1
          }}
          onClick={handleImageClick}
        >
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '10px'
              }}
            />
          )}
        </div>
      );
    }
    return null;
  };
  
  // Рендер картинки справа для glass-card-wide
  const renderRightImage = () => {
    if (type === 'glass-card-wide' && imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt="" 
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            width: 'auto',
            objectFit: 'cover',
            cursor: 'pointer',
            zIndex: 1
          }}
          onClick={handleImageClick}
        />
      );
    }
    return null;
  };
  
  // Рендер аватарки пользователя для glass-card-square (круг 75x75, цвет #939090)
  const renderSquareImage = () => {
    if (type === 'glass-card-square') {
      return (
        <div 
          style={{
            width: '75px',
            height: '75px',
            borderRadius: '50%',
            backgroundColor: '#939090',
            cursor: 'pointer',
            flexShrink: 0,
            marginTop: '15px',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleImageClick}
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="User avatar" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            />
          ) : (
            icon || null
          )}
        </div>
      );
    }
    return null;
  };
  
  // Рендер картинки слева для glass-card-hackathon (105x75, цвет C7C1C1)
  const renderLeftImage = () => {
    if (type === 'glass-card-hackathon') {
      return (
        <div 
          style={{
            width: '105px',
            height: '75px',
            backgroundColor: '#C7C1C1',
            borderRadius: '10px',
            cursor: 'pointer',
            flexShrink: 0,
            position: 'relative',
            zIndex: 1
          }}
          onClick={handleImageClick}
        >
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '10px'
              }}
            />
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <button
      style={buttonStyles}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={() => !disabled && !loading && setIsHover(true)}
      onMouseLeave={() => !disabled && !loading && setIsHover(false)}
      className={className}
    >
      {type !== 'glass-card-large' && renderCenterImage()}
      {renderRightImage()}
      {type !== 'glass-card-square' && renderSquareImage()}
      {type !== 'glass-card-hackathon' && renderLeftImage()}
      {/* Border поверх всего контента для всех glass-кнопок - одинаковый по ширине со всех сторон */}
      {(type === 'glass-card-large' || 
        type === 'glass-card-small' || 
        type === 'glass-card-wide' || 
        type === 'glass-card-square' || 
        type === 'glass-card-hackathon') && (
        <>
          {/* Верхний border - одинаковой ширины */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '10px',
            right: '10px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            pointerEvents: 'none',
            zIndex: 10,
            boxSizing: 'border-box'
          }} />
          {/* Правый border - одинаковой ширины */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: 0,
            bottom: '10px',
            width: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            pointerEvents: 'none',
            zIndex: 10,
            boxSizing: 'border-box'
          }} />
          {/* Нижний border - одинаковой ширины */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '10px',
            right: '10px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            pointerEvents: 'none',
            zIndex: 10,
            boxSizing: 'border-box'
          }} />
          {/* Левый border - одинаковой ширины */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: 0,
            bottom: '10px',
            width: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            pointerEvents: 'none',
            zIndex: 10,
            boxSizing: 'border-box'
          }} />
          {/* Уголки - маленькие border элементы в углах, одинаковой ширины */}
          {/* Левый верхний угол */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '10px',
            height: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.18)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.18)',
            borderTopLeftRadius: '10px',
            pointerEvents: 'none',
            zIndex: 10,
            boxSizing: 'border-box'
          }} />
          {/* Правый верхний угол */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '10px',
            height: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.18)',
            borderRight: '1px solid rgba(255, 255, 255, 0.18)',
            borderTopRightRadius: '10px',
            pointerEvents: 'none',
            zIndex: 10,
            boxSizing: 'border-box'
          }} />
          {/* Правый нижний угол */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '10px',
            height: '10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
            borderRight: '1px solid rgba(255, 255, 255, 0.18)',
            borderBottomRightRadius: '10px',
            pointerEvents: 'none',
            zIndex: 10,
            boxSizing: 'border-box'
          }} />
          {/* Левый нижний угол */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '10px',
            height: '10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.18)',
            borderBottomLeftRadius: '10px',
            pointerEvents: 'none',
            zIndex: 10,
            boxSizing: 'border-box'
          }} />
        </>
      )}
      {type === 'glass-card-hackathon' && (
        <>
          {renderLeftImage()}
          <div style={{ 
            position: 'relative', 
            zIndex: 2,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            textAlign: 'left',
            color: '#E7E3D8'
          }}>
            {loading ? 'Загрузка...' : (iconOnly && icon ? icon : children)}
          </div>
        </>
      )}
      {type === 'glass-card-large' && (
        <div style={{ 
          position: 'relative', 
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          justifyContent: 'flex-start'
        }}>
          {renderCenterImage()}
          {loading ? 'Загрузка...' : (
            <div style={{ 
              marginTop: '16px',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              color: '#E7E3D8',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}>
              {children}
            </div>
          )}
        </div>
      )}
      {type === 'glass-card-square' && (
        <div style={{ 
          position: 'relative', 
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          justifyContent: 'flex-start'
        }}>
          {renderSquareImage()}
          {loading ? 'Загрузка...' : (
            <div style={{ 
              marginTop: '15px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              color: '#E7E3D8',
              fontSize: '14px',
              gap: '4px'
            }}>
              {children}
            </div>
          )}
        </div>
      )}
      {type !== 'glass-card-hackathon' && type !== 'glass-card-large' && type !== 'glass-card-square' && (
        <div style={{ 
          position: 'relative', 
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: iconOnly ? '100%' : 'auto',
          height: iconOnly ? '100%' : 'auto'
        }}>
          {loading ? 'Загрузка...' : (
            iconOnly && icon ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </div>
            ) : (
              icon ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {icon}
                  {children}
                </div>
              ) : (
                children
              )
            )
          )}
        </div>
      )}
    </button>
  );
};