import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal/Modal';
import { getUsers, getHackathons } from '../../../api/api';
import { mockTeams } from '../../../api/mockData';
import type { User, Team, Hackathon } from '../../../api/types';
import styles from './ExportModal.module.css';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal = ({ isOpen, onClose }: ExportModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const escapeCSV = (value: string | undefined): string => {
    if (!value) return '';
    // Если значение содержит запятую, кавычки или перенос строки, оборачиваем в кавычки
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      // Получаем данные - используем Promise.allSettled для более надежной обработки ошибок
      const [usersResult, hackathonsResult] = await Promise.allSettled([
        getUsers(),
        getHackathons()
      ]);

      // Обрабатываем результат загрузки пользователей
      if (usersResult.status !== 'fulfilled' || !usersResult.value.success) {
        console.error('Ошибка загрузки пользователей:', 
          usersResult.status === 'fulfilled' ? usersResult.value.message : usersResult.reason);
        return;
      }

      // Обрабатываем результат загрузки хакатонов
      if (hackathonsResult.status !== 'fulfilled' || !hackathonsResult.value.success) {
        console.error('Ошибка загрузки хакатонов:', 
          hackathonsResult.status === 'fulfilled' ? hackathonsResult.value.message : hackathonsResult.reason);
        return;
      }

      const users: User[] = usersResult.value.data;
      const hackathons: Hackathon[] = hackathonsResult.value.data;

      // Получаем все команды (в реальном API здесь будет вызов getTeams())
      // Пока используем моковые данные
      const allTeams: Team[] = mockTeams;

      // Создаем CSV для участников
      const participantsHeaders = ['ID', 'Имя', 'Фамилия', 'Telegram ID', 'Роль', 'Навыки', 'Университет'];
      const participantsRows = users.map(user => [
        user.id,
        escapeCSV(user.name),
        escapeCSV(user.surname),
        escapeCSV(user.telegramId),
        escapeCSV(user.role),
        escapeCSV(user.skills.join('; ')),
        escapeCSV(user.university || '')
      ]);

      // Создаем CSV для команд
      const teamsHeaders = ['ID команды', 'Название команды', 'ID хакатона', 'Название хакатона', 'Участники (ID)', 'Участники (Имя Фамилия)'];
      const teamsRows = allTeams.map(team => {
        const hackathon = hackathons.find(h => h.id === team.hackathonId);
        const memberIds = team.members.map(m => m.id).join('; ');
        const memberNames = team.members.map(m => `${m.name} ${m.surname}`).join('; ');
        return [
          team.id,
          escapeCSV(team.name),
          team.hackathonId,
          escapeCSV(hackathon?.name || ''),
          escapeCSV(memberIds),
          escapeCSV(memberNames)
        ];
      });

      // Объединяем данные
      const csvContent = [
        '=== УЧАСТНИКИ ===',
        participantsHeaders.join(','),
        ...participantsRows.map(row => row.join(',')),
        '',
        '=== КОМАНДЫ ===',
        teamsHeaders.join(','),
        ...teamsRows.map(row => row.join(','))
      ].join('\n');

      // Создаем BOM для корректного отображения кириллицы в Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Скачиваем файл
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `participants_and_teams_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Закрываем модальное окно после успешного скачивания
      onClose();
    } catch (error) {
      console.error('Ошибка при экспорте CSV:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.exportModal}>
      <div className={styles.modalContainer}>
        <h2 className={styles.title}>Экспорт CSV</h2>
        <button
          type="button"
          className={styles.downloadButton}
          onClick={handleDownload}
          disabled={isLoading}
        >
          <span className={styles.buttonText}>
            {isLoading ? 'Загрузка...' : 'Скачать таблицу участников и команд'}
          </span>
        </button>
      </div>
    </Modal>
  );
};

