import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTeams, getHackathons } from '../../../api/api';
import type { Team, Hackathon } from '../../../api/types';
import styles from './Teams.module.css';

export const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Используем Promise.allSettled для более надежной обработки ошибок
        const [teamsResult, hackathonsResult] = await Promise.allSettled([
          getAllTeams(),
          getHackathons()
        ]);

        // Обрабатываем результат загрузки команд
        if (teamsResult.status === 'fulfilled') {
          const teamsResponse = teamsResult.value;
          if (teamsResponse.success) {
            setTeams(teamsResponse.data);
          } else {
            console.error('Ошибка загрузки команд:', teamsResponse.message);
          }
        } else {
          console.error('Ошибка загрузки команд:', teamsResult.reason);
        }

        // Обрабатываем результат загрузки хакатонов
        if (hackathonsResult.status === 'fulfilled') {
          const hackathonsResponse = hackathonsResult.value;
          if (hackathonsResponse.success) {
            setHackathons(hackathonsResponse.data);
          } else {
            console.error('Ошибка загрузки хакатонов:', hackathonsResponse.message);
          }
        } else {
          console.error('Ошибка загрузки хакатонов:', hackathonsResult.reason);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getHackathonName = (hackathonId: string): string => {
    const hackathon = hackathons.find(h => h.id === hackathonId);
    return hackathon?.name || 'Неизвестный хакатон';
  };

  const getRegistrationDate = (team: Team): string => {
    // В реальном API здесь будет дата регистрации команды
    // Пока используем моковую дату
    return '15.03.2024';
  };

  if (loading) {
    return (
      <div className={styles.teams}>
        <div className={styles.mainContent}>
          <p style={{ color: '#E7E3D8' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.teams}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Команды</h1>
        <div className={styles.teamsGrid}>
          {teams.map((team) => (
            <div
              key={team.id}
              className={`${styles.teamCard} ${selectedTeam?.id === team.id ? styles.teamCardActive : ''}`}
              onClick={() => setSelectedTeam(team)}
            >
              {/* Стеклянные бордеры */}
              <div className={styles.cardBorderTop}></div>
              <div className={styles.cardBorderRight}></div>
              <div className={styles.cardBorderBottom}></div>
              <div className={styles.cardBorderLeft}></div>
              <div className={styles.teamLogoPlaceholder}></div>
              <div className={styles.teamInfo}>
                <div className={styles.teamName}>{team.name}</div>
                <div className={styles.registrationDate}>
                  {getRegistrationDate(team)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTeam && (
        <div className={styles.sidebar}>
          <div className={styles.teamDetails}>
            <h2 className={styles.sectionTitle}>Команда</h2>
            <div className={styles.teamCardDetail}>
              {/* Стеклянные бордеры */}
              <div className={styles.cardBorderTop}></div>
              <div className={styles.cardBorderRight}></div>
              <div className={styles.cardBorderBottom}></div>
              <div className={styles.cardBorderLeft}></div>
              <div className={styles.teamLogoPlaceholderLarge}></div>
              <div className={styles.teamInfoDetail}>
                <div className={styles.teamNameDetail}>{selectedTeam.name}</div>
                <div className={styles.registrationDateDetail}>
                  {getRegistrationDate(selectedTeam)}
                </div>
              </div>
            </div>

            <h2 className={styles.sectionTitle}>Участники</h2>
            <div className={styles.participantsList}>
              {selectedTeam.members.map((member) => (
                <div key={member.id} className={styles.participantCard}>
                  {/* Стеклянные бордеры */}
                  <div className={styles.cardBorderTop}></div>
                  <div className={styles.cardBorderRight}></div>
                  <div className={styles.cardBorderBottom}></div>
                  <div className={styles.cardBorderLeft}></div>
                  <div className={styles.participantAvatar}></div>
                  <div className={styles.participantInfo}>
                    <div className={styles.participantName}>{member.name}</div>
                    <div className={styles.participantSurname}>{member.surname}</div>
                    <div className={styles.participantRole}>{member.role}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={styles.addParticipantButton}
              onClick={() => {
                // Переходим на страницу участников с фильтром "без команды"
                navigate('/admin/users?filter=free');
              }}
            >
              Добавить участника
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

