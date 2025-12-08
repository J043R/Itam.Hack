import { AdminHeaderIcons } from '../AdminHeaderIcons/AdminHeaderIcons';
import styles from './AdminHeader.module.css';

export const AdminHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.logo}>MeeT.Hack</h1>
        <AdminHeaderIcons />
      </div>
    </header>
  );
};

