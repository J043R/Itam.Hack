import styles from './AdminBackground.module.css';

export const AdminBackground = () => {
  return (
    <div className={styles.background}>
      {/* Верхняя группа эллипсов (левый верхний угол) */}
      <div className={styles.ellipseGroup}>
        {/* Большой фиолетовый эллипс */}
        <div className={styles.ellipseLarge} />
        {/* Маленький розовый эллипс */}
        <div className={styles.ellipseSmall} />
      </div>
      
      {/* Нижняя группа эллипсов (правый нижний угол) */}
      <div className={styles.ellipseGroupBottom}>
        {/* Большой фиолетовый эллипс */}
        <div className={styles.ellipseLargeBottom} />
        {/* Маленький розовый эллипс */}
        <div className={styles.ellipseSmallBottom} />
      </div>
    </div>
  );
};

