import { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal/Modal';
import { getHackathons } from '../../../api/api';
import type { Hackathon } from '../../../api/types';
import styles from './ExportModal.module.css';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal = ({ isOpen, onClose }: ExportModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [loadingHackathons, setLoadingHackathons] = useState(false);

  // Загружаем список хакатонов при открытии модалки
  useEffect(() => {
    if (isOpen) {
      loadHackathons();
    }
  }, [isOpen]);

  const loadHackathons = async () => {
    try {
      setLoadingHackathons(true);
      const response = await getHackathons();
      if (response.success && response.data.length > 0) {
        setHackathons(response.data);
        setSelectedHackathonId(response.data[0].id);
      }
    } catch (error) {
      console.error('Ошибка загрузки хакатонов:', error);
    } finally {
      setLoadingHackathons(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedHackathonId) {
      alert('Выберите хакатон');
      return;
    }

    try {
      setIsLoading(true);
      
      // Получаем токен
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Необходима авторизация');
        return;
      }

      // Делаем запрос на экспорт CSV
      const response = await fetch(`/api/v1/admin/hackathons/${selectedHackathonId}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Ошибка экспорта');
      }

      // Получаем blob из ответа
      const blob = await response.blob();
      
      // Получаем имя файла из заголовка Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'hackathon_teams.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;\n]+)/i);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
        }
      }

      // Скачиваем файл
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Закрываем модальное окно после успешного скачивания
      onClose();
    } catch (error) {
      console.error('Ошибка при экспорте CSV:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при экспорте');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.exportModal}>
      <div className={styles.modalContainer}>
        <h2 className={styles.title}>Экспорт CSV</h2>
        
        {loadingHackathons ? (
          <p className={styles.loadingText}>Загрузка хакатонов...</p>
        ) : hackathons.length === 0 ? (
          <p className={styles.loadingText}>Нет доступных хакатонов</p>
        ) : (
          <>
            <div className={styles.selectContainer}>
              <label className={styles.selectLabel}>Выберите хакатон:</label>
              <select
                className={styles.select}
                value={selectedHackathonId}
                onChange={(e) => setSelectedHackathonId(e.target.value)}
              >
                {hackathons.map((hackathon) => (
                  <option key={hackathon.id} value={hackathon.id}>
                    {hackathon.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              className={styles.downloadButton}
              onClick={handleDownload}
              disabled={isLoading || !selectedHackathonId}
            >
              <span className={styles.buttonText}>
                {isLoading ? 'Загрузка...' : 'Скачать состав команд'}
              </span>
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};
