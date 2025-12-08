import styles from './Background.module.css';

export const Background = () => {
  return (
    <div className={styles.background}>
      {/* Верхняя группа эллипсов (левый верхний угол) */}
      <div className={styles.ellipseGroup}>
        {/* Большой эллипс */}
        <div className={styles.ellipseLarge} />
        {/* Маленький эллипс */}
        <div className={styles.ellipseSmall} />
      </div>
      
      {/* Нижняя группа эллипсов (правый нижний угол) */}
      <div className={styles.ellipseGroupBottom}>
        {/* Большой эллипс */}
        <div className={styles.ellipseLargeBottom} />
        {/* Маленький эллипс */}
        <div className={styles.ellipseSmallBottom} />
      </div>
    </div>
  );
};

