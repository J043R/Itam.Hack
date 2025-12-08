import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTeams } from '../../../api/api';
import type { Team } from '../../../api/types';
import styles from './Teams.module.css';

export const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const teamsResponse = await getAllTeams();
        if (teamsResponse.success) {
          setTeams(teamsResponse.data);
        } else {
          console.error('Ошибка загрузки команд:', teamsResponse.message);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getRegistrationDate = (team: Team): string => {
    return team.createdAt || 'Дата не указана';
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
                {selectedTeam.hackathonName && (
                  <div className={styles.hackathonName}>
                    🏆 {selectedTeam.hackathonName}
                  </div>
                )}
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
                // Переходим на страницу участников без команды для добавления в эту команду
                navigate(`/admin/users?mode=add-to-team&teamId=${selectedTeam.id}&hackathonId=${selectedTeam.hackathonId}`);
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

