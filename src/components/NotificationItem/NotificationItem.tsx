import type { Notification } from '../../api/types';
import styles from './NotificationItem.module.css';

interface NotificationItemProps {
  notification: Notification;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const NotificationItem = ({ notification, onAccept, onReject }: NotificationItemProps) => {
  const { fromUser, hackathon, team, type } = notification;
  const fullName = `${fromUser.name} ${fromUser.surname}`;

  return (
    <div className={styles.notificationCard}>
      {/* Верхняя часть: аватар и текст */}
      <div className={styles.topSection}>
        {/* Левая часть с аватаром */}
        <div className={styles.leftSection}>
          <div className={styles.avatarContainer}></div>
        </div>

        {/* Правая часть с текстом */}
        <div className={styles.rightSection}>
          <div className={styles.content}>
            {type === 'invitation' && (
              <p className={styles.text}>
                <span className={styles.userName}>{fullName}</span> приглашает Вас в команду "{team.name}" на хакатон "{hackathon.name}"
              </p>
            )}
            {type === 'join_request' && (
              <p className={styles.text}>
                <span className={styles.userName}>{fullName}</span> хочет добавится к вам в команду "{team.name}" на хакатон "{hackathon.name}"
              </p>
            )}
            {type === 'rejection' && (
              <p className={styles.text}>
                <span className={styles.userName}>{fullName}</span> отклонил ваш запрос в команду "{team.name}" на хакатон "{hackathon.name}"
              </p>
            )}
            {type === 'request_accepted' && (
              <p className={styles.text}>
                <span className={styles.userName}>{fullName}</span> принял ваш запрос в команду "{team.name}" на хакатон "{hackathon.name}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Нижняя часть: кнопки для приглашений и запросов на вступление */}
      {(type === 'invitation' || type === 'join_request') && (
        <div className={styles.buttonsRow}>
          <button
            className={styles.acceptButton}
            onClick={() => onAccept?.(notification.id)}
          >
            Принять
          </button>
          <button
            className={styles.rejectButton}
            onClick={() => onReject?.(notification.id)}
          >
            Отклонить
          </button>
        </div>
      )}
    </div>
  );
};

