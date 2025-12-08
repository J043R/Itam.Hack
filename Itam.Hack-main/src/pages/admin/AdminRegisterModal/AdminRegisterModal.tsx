// Модальное окно регистрации админов отключено
// Админы создаются супер-админом через настройки

interface AdminRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export const AdminRegisterModal = ({ onClose, onSwitchToLogin }: AdminRegisterModalProps) => {
  // Сразу переключаемся на логин
  if (onSwitchToLogin) {
    onSwitchToLogin();
  } else {
    onClose();
  }
  return null;
};
