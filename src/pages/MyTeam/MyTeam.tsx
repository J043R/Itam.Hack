import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { GoTrash } from 'react-icons/go';
import { Input } from '../../components/ui/Input/input';
import { getHackathonById, getTeamByHackathonId, leaveTeam } from '../../api/api';
import type { Hackathon, Team, User } from '../../api/types';
import styles from './MyTeam.module.css';

export const MyTeam = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Получаем роль из query параметров
  const role = searchParams.get('role') || 'member'; // По умолчанию участник
  
  const isCaptain = role === 'captain';
  
  const [hackathonData, setHackathonData] = useState<Hackathon | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Загружаем данные о хакатоне и команде при монтировании компонента
    const loadData = async () => {
      if (!id) {
        setError('ID хакатона не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Загружаем данные о хакатоне и команде параллельно
        const [hackathonResponse, teamResponse] = await Promise.all([
          getHackathonById(id),
          getTeamByHackathonId(id)
        ]);
        
        if (hackathonResponse.success) {
          setHackathonData(hackathonResponse.data);
        } else {
          setError(hackathonResponse.message || 'Не удалось загрузить данные хакатона');
        }

        if (teamResponse.success && teamResponse.data) {
          setTeam(teamResponse.data);
          // Проверяем, есть ли сохраненное название команды в localStorage
          const savedTeams = localStorage.getItem('teamNames');
          const teams = savedTeams ? JSON.parse(savedTeams) : {};
          setTeamName(teams[id] || teamResponse.data.name);
        }
      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Автосохранение названия команды
  useEffect(() => {
    if (teamName && id) {
      const timeoutId = setTimeout(() => {
        // Сохраняем в localStorage
        const savedTeams = localStorage.getItem('teamNames');
        const teams = savedTeams ? JSON.parse(savedTeams) : {};
        teams[id] = teamName;
        localStorage.setItem('teamNames', JSON.stringify(teams));
        
        // Здесь можно добавить вызов API для сохранения на бэкенде
        // updateTeamName(team?.id || '', teamName);
      }, 500); // Сохраняем через 500ms после последнего изменения

      return () => clearTimeout(timeoutId);
    }
  }, [teamName, id, team?.id]);

  // Преобразуем участников команды в нужный формат
  const teamMembers = team?.members.map((member: User, index: number) => ({
    id: member.id,
    firstName: member.name,
    lastName: member.surname,
    role: index === 0 ? 'Капитан' : 'Участник',
    avatar: member.avatar || '',
    isCaptain: index === 0
  })) || [];

  // Обработчик выхода из команды
  const handleLeaveTeam = async () => {
    if (!team?.id || !id) {
      console.error('ID команды или хакатона не указан');
      return;
    }

    try {
      const response = await leaveTeam(team.id);
      
      if (response.success) {
        // Перенаправляем на страницу хакатона
        navigate(`/hackathon/${id}`);
      } else {
        alert('Не удалось покинуть команду');
      }
    } catch (error) {
      console.error('Ошибка при выходе из команды:', error);
      alert('Произошла ошибка при выходе из команды');
    }
  };

  // Обработчик удаления участника
  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого участника из команды?')) {
      return;
    }

    try {
      // Здесь будет вызов API для удаления участника
      // const response = await removeMemberFromTeam(team?.id || '', memberId);
      console.log('Удалить участника:', memberId);
      
      // Временно обновляем список участников локально
      if (team) {
        setTeam({
          ...team,
          members: team.members.filter(m => m.id !== memberId)
        });
      }
    } catch (error) {
      console.error('Ошибка при удалении участника:', error);
      alert('Произошла ошибка при удалении участника');
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

  if (error || !hackathonData) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <p style={{ color: 'red' }}>{error || 'Хакатон не найден'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Карточка хакатона */}
        <div className={styles.hackathonCard}>
          {/* Обводка как у стеклянных кнопок */}
          <div className={styles.hackathonCardBorderTop}></div>
          <div className={styles.hackathonCardBorderRight}></div>
          <div className={styles.hackathonCardBorderBottom}></div>
          <div className={styles.hackathonCardBorderLeft}></div>
          
          <div className={styles.imageContainer}>
            <div className={styles.imagePlaceholder}></div>
            {hackathonData.imageUrl && (
              <img 
                src={hackathonData.imageUrl} 
                alt={hackathonData.name}
                className={styles.hackathonImage}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          <div className={styles.hackathonContent}>
            <h1 className={styles.hackathonName}>{hackathonData.name}</h1>
            <p className={styles.hackathonDate}>{hackathonData.date}</p>
          </div>
        </div>
        
        {/* Поле ввода названия команды */}
        <div className={styles.teamNameInput}>
          <Input
            size="S"
            opacity={20}
            placeholder="Название команды"
            className={styles.teamNameInputField}
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={!isCaptain}
          />
        </div>

        {/* Заголовок "Моя команда" */}
        <h2 className={styles.teamTitle}>Моя команда</h2>

        {/* Список участников команды */}
        <div className={styles.teamMembersList}>
          {teamMembers.map((member) => (
            <div key={member.id} className={styles.memberCard}>
              {/* Обводка как у стеклянных кнопок */}
              <div className={styles.memberCardBorderTop}></div>
              <div className={styles.memberCardBorderRight}></div>
              <div className={styles.memberCardBorderBottom}></div>
              <div className={styles.memberCardBorderLeft}></div>
              
              {/* Аватар участника */}
              <div className={styles.avatarContainer}>
                <div className={styles.avatarPlaceholder}></div>
              </div>
              
              {/* Информация об участнике */}
              <div className={styles.memberInfo}>
                <p className={styles.memberFirstName}>{member.firstName}</p>
                <p className={styles.memberLastName}>{member.lastName}</p>
                <p className={styles.memberRole}>{member.role}</p>
              </div>

              {/* Иконка корзины в правом нижнем углу (только для капитана в режиме редактирования, не для капитана команды) */}
              {isCaptain && isEditing && !member.isCaptain && (
                <button
                  className={styles.deleteMemberButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMember(member.id);
                  }}
                  title="Удалить участника"
                >
                  <GoTrash />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Кнопка "Покинуть" для обычных участников */}
        {!isCaptain && (
          <div className={styles.leaveButtonContainer}>
            <button 
              className={styles.leaveButton}
              onClick={handleLeaveTeam}
            >
              Покинуть
            </button>
          </div>
        )}

        {/* Кнопка "Редактировать" для капитана */}
        {isCaptain && (
          <div className={styles.editButtonContainer}>
            <button 
              className={styles.editButton}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Готово' : 'Редактировать'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

