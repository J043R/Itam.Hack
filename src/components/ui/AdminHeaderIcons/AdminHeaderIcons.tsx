import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoHomeFill } from 'react-icons/go';
import { MdPerson } from 'react-icons/md';
import { AdminProfileModal } from '../AdminProfileModal/AdminProfileModal';
import styles from './AdminHeaderIcons.module.css';

export const AdminHeaderIcons = () => {
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileModalOpen(prev => !prev);
  };

  return (
    <>
      <div className={styles.iconsContainer}>
        <button 
          className={styles.iconButton}
          onClick={() => navigate('/admin')}
          aria-label="Главная"
        >
          <GoHomeFill />
        </button>
        <button 
          className={styles.iconButton}
          onClick={handleProfileClick}
          aria-label="Профиль"
        >
          <MdPerson />
        </button>
      </div>
      <AdminProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

