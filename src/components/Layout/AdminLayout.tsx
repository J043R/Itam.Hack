import type { ReactNode } from 'react';
import { AdminHeader } from '../ui/AdminHeader/AdminHeader';
import { AdminBackground } from '../Background/AdminBackground';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className={styles.adminLayout}>
      <AdminBackground />
      <AdminHeader />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

