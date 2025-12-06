import type { ReactNode } from 'react';
import { Header } from '../ui/Header/header';
import { BottomNavigation } from '../ui/BottomNavigation/bottomNavigation';
import { Background } from '../Background/Background';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  bottomNavItems?: Array<{
    icon: ReactNode;
    onClick?: () => void;
    label?: string;
    active?: boolean;
  }>;
}

export const Layout = ({ children, bottomNavItems }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Background />
      <Header />
      <main className={styles.main}>
        {children}
      </main>
      {bottomNavItems && (
        <BottomNavigation items={bottomNavItems} />
      )}
    </div>
  );
};

