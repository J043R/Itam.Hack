import { useState, useEffect } from 'react';
import { getNotifications, acceptInvitation, rejectInvitation } from '../../api/api';
import type { Notification } from '../../api/types';
import { NotificationItem } from '../../components/NotificationItem/NotificationItem';
import styles from './Notification.module.css';

export const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await getNotifications();
        
        if (response.success) {
          setNotifications(response.data);
        } else {
          setError(response.message || 'Не удалось загрузить уведомления');
        }
      } catch (err) {
        setError('Произошла ошибка при загрузке уведомлений');
        console.error('Ошибка загрузки уведомлений:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleAccept = async (notificationId: string) => {
    try {
      const response = await acceptInvitation(notificationId);
      
      if (response.success) {
        // Удаляем уведомление из списка после принятия
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } else {
        alert('Не удалось принять приглашение');
      }
    } catch (error) {
      console.error('Ошибка при принятии приглашения:', error);
      alert('Произошла ошибка при принятии приглашения');
    }
  };

  const handleReject = async (notificationId: string) => {
    try {
      const response = await rejectInvitation(notificationId);
      
      if (response.success) {
        // Удаляем уведомление из списка после отклонения
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } else {
        alert('Не удалось отклонить приглашение');
      }
    } catch (error) {
      console.error('Ошибка при отклонении приглашения:', error);
      alert('Произошла ошибка при отклонении приглашения');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {notifications.length === 0 ? (
          <p className={styles.emptyMessage}>У вас нет уведомлений</p>
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

