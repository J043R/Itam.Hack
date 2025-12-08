import styles from './header.module.css';

interface HeaderProps {
  className?: string;
}

export const Header = ({ className = '' }: HeaderProps) => {
  
  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.container}>
        <h1 className={styles.logo}>MeeT.Hack</h1>
      </div>
    </header>
  );
};

