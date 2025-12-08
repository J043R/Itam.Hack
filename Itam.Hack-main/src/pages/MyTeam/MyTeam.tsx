import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { GoTrash } from 'react-icons/go';
import { Input } from '../../components/ui/Input/input';
import { getHackathonById, getMyTeam, leaveTeam, removeMemberFromTeam } from '../../api/api';
import type { Hackathon, Team } from '../../api/types';
import { formatDateToRussian } from '../../utils/dateFormat';
import styles from './MyTeam.module.css';

export const MyTeam = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем текущего пользователя из localStorage
  const currentUserData = localStorage.getItem('currentUser');
  const currentUserId = currentUserData ? JSON.parse(currentUserData).id : null;
  
  const [hackathonData, setHackathonData] = useState<Hackathon | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Предотвращаем повторную загрузку данных
    if (dataLoaded) {
      return;
    }

    // Загружаем данные о хакатоне и команде при монтировании компонента
    const loadData = async () => {
      if (!id) {
        setError('ID хакатона не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setDataLoaded(true); // Помечаем, что данные загружаются
        
        // Проверяем, есть ли данные команды в state (переданные при навигации)
        const hasTeamInState = location.state?.team;
        
        // Проверяем, есть ли данные хакатона в state (переданные при навигации)
        const hasHackathonInState = location.state?.hackathon;
        
        // Загружаем данные о хакатоне и команде параллельно
        // Если данные уже есть в state, не делаем повторный запрос
        const promises: Promise<any>[] = [];
        
        if (!hasHackathonInState) {
          promises.push(getHackathonById(id));
        }
        
        if (!hasTeamInState) {
          // Запрашиваем команду для конкретного хакатона
          promises.push(getMyTeam(id));
        }
        
        // Если все данные есть в state, используем их
        if (hasHackathonInState) {
          console.log('📥 Using hackathon data from navigation state:', location.state.hackathon);
          // Форматируем дату в российский формат
          const hackathonData = {
            ...location.state.hackathon,
            date: formatDateToRussian(location.state.hackathon.date)
          };
          setHackathonData(hackathonData);
        }
        
        if (hasTeamInState) {
          console.log('📥 Using team data from navigation state:', location.state.team);
          const teamFromState = location.state.team;
          setTeam(teamFromState);
          const savedTeams = localStorage.getItem('teamNames');
          const teams = savedTeams ? JSON.parse(savedTeams) : {};
          setTeamName(teams[id] || teamFromState.name || '');
          console.log('✅ Team set from state:', {
            team: teamFromState,
            members: teamFromState.members,
            membersCount: teamFromState.members?.length || 0
          });
        }
        
        // Если есть запросы для выполнения
        if (promises.length > 0) {
          // Используем Promise.allSettled для более надежной обработки ошибок
          const results = await Promise.allSettled(promises);
          
          let resultIndex = 0;
          const hackathonResult = !hasHackathonInState ? results[resultIndex++] : null;
          const teamResult = !hasTeamInState && results.length > 0 ? results[resultIndex] : null;
        
          // Обрабатываем результат загрузки хакатона
          if (hackathonResult && hackathonResult.status === 'fulfilled') {
            const hackathonResponse = hackathonResult.value;
            if (hackathonResponse.success) {
              // Форматируем дату в российский формат
              const hackathonData = {
                ...hackathonResponse.data,
                date: formatDateToRussian(hackathonResponse.data.date)
              };
              setHackathonData(hackathonData);
            } else {
              setError(hackathonResponse.message || 'Не удалось загрузить данные хакатона');
            }
          } else if (hackathonResult) {
            setError('Произошла ошибка при загрузке данных хакатона');
            console.error('Ошибка загрузки хакатона:', hackathonResult.reason);
          }

          // Обрабатываем данные команды из запроса
          if (teamResult && teamResult.status === 'fulfilled') {
            const teamResponse = teamResult.value;
            console.log('📥 Team response:', teamResponse);
            console.log('📥 Team response success:', teamResponse.success);
            console.log('📥 Team response data:', teamResponse.data);
            console.log('📥 Team response message:', teamResponse.message);
            
            if (teamResponse.success && teamResponse.data) {
              console.log('✅ Setting team data:', teamResponse.data);
              console.log('✅ Team data type:', typeof teamResponse.data);
              console.log('✅ Team data keys:', Object.keys(teamResponse.data));
              console.log('✅ Team members:', teamResponse.data.members);
              console.log('✅ Team members type:', typeof teamResponse.data.members);
              console.log('✅ Team members is array:', Array.isArray(teamResponse.data.members));
              console.log('✅ Team members length:', teamResponse.data.members?.length);
              
              setTeam(teamResponse.data);
              // Проверяем, есть ли сохраненное название команды в localStorage
              const savedTeams = localStorage.getItem('teamNames');
              const teams = savedTeams ? JSON.parse(savedTeams) : {};
              setTeamName(teams[id] || teamResponse.data.name || '');
            } else {
              console.warn('⚠️ Team response unsuccessful or no data:', {
                success: teamResponse.success,
                data: teamResponse.data,
                message: teamResponse.message
              });
              // Если команда не найдена, это нормально - пользователь может не быть в команде
              setTeam(null);
            }
          } else if (teamResult) {
            console.error('❌ Ошибка загрузки команды:', teamResult.reason);
            console.error('❌ Team result status:', teamResult.status);
            setTeam(null);
          }
        } // Закрываем блок if (promises.length > 0)
      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, location.state, dataLoaded]);

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
  const teamMembers = React.useMemo(() => {
    if (!team) {
      console.log('👥 No team data');
      return [];
    }
    
    console.log('👥 Processing team members, team:', team);
    console.log('👥 Team.members:', team.members);
    console.log('👥 Team.members type:', typeof team.members);
    console.log('👥 Team.members is array:', Array.isArray(team.members));
    
    if (!team.members) {
      console.warn('⚠️ Team.members is undefined or null');
      return [];
    }
    
    if (!Array.isArray(team.members)) {
      console.warn('⚠️ Team.members is not an array:', team.members);
      return [];
    }
    
    if (team.members.length === 0) {
      console.warn('⚠️ Team.members is empty array');
      return [];
    }
    
    const formatted = team.members.map((member: any, index: number) => {
      console.log(`👥 Processing member ${index}:`, member);
      console.log(`👥 Member keys:`, Object.keys(member));
      console.log(`👥 Member name field:`, member.name, member.firstName, member.first_name);
      console.log(`👥 Member surname field:`, member.surname, member.lastName, member.last_name);
      console.log(`👥 Member role field:`, member.role);
      
      // Пробуем разные варианты имен полей
      const firstName = member.name || member.firstName || member.first_name || '';
      const lastName = member.surname || member.lastName || member.last_name || '';
      const memberRole = member.role || (index === 0 ? 'Капитан' : 'Участник');
      
      return {
        id: member.id,
        firstName: firstName,
        lastName: lastName,
        role: memberRole,
        avatar: member.avatar || '',
        isCaptain: index === 0
      };
    });
    
    console.log('👥 Formatted members:', formatted);
    return formatted;
  }, [team]);
  
  // Определяем, является ли текущий пользователь капитаном
  const isCaptain = React.useMemo(() => {
    if (!team || !currentUserId) return false;
    // Проверяем по id_capitan или по первому участнику
    const captainId = (team as any).id_capitan || (team.members?.[0]?.id);
    return captainId === currentUserId;
  }, [team, currentUserId]);
  
  // Логируем данные команды для отладки
  useEffect(() => {
    if (team) {
      console.log('👥 Team data in useEffect:', team);
      console.log('👥 Team members:', team.members);
      console.log('👥 Team members count:', team.members?.length || 0);
      console.log('👥 Team members formatted:', teamMembers);
      console.log('👥 Team members length:', teamMembers.length);
      console.log('👥 Is captain:', isCaptain);
    }
  }, [team, teamMembers, isCaptain]);

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
    if (!team?.id) {
      console.error('ID команды не указан');
      return;
    }
    
    if (!window.confirm('Вы уверены, что хотите удалить этого участника из команды?')) {
      return;
    }

    try {
      const response = await removeMemberFromTeam(team.id, memberId);
      
      if (response.success) {
        // Обновляем список участников локально после успешного удаления
        setTeam({
          ...team,
          members: team.members.filter(m => m.id !== memberId)
        });
        alert('Участник удалён из команды');
      } else {
        alert(response.message || 'Не удалось удалить участника');
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
            <p className={styles.hackathonDate}>{formatDateToRussian(hackathonData.date)}</p>
          </div>
        </div>
        
        {/* Поле ввода названия команды (только если команда найдена) */}
        {team && (
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
        )}

        {/* Заголовок "Моя команда" */}
        <h2 className={styles.teamTitle}>Моя команда</h2>

        {/* Сообщение, если команда не найдена */}
        {!team && !loading && (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#E7E3D8',
            fontFamily: "'Inter', sans-serif"
          }}>
            <p>Вы не состоите в команде для этого хакатона</p>
          </div>
        )}

        {/* Информация о команде, если она найдена */}
        {team && (
          <>
            {/* Список участников команды */}
            {teamMembers.length > 0 ? (
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
                <p className={styles.memberFirstName}>{member.firstName || 'Имя не указано'}</p>
                <p className={styles.memberLastName}>{member.lastName || 'Фамилия не указана'}</p>
                <p className={styles.memberRole}>{member.role || 'Роль не указана'}</p>
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
            ) : (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#E7E3D8',
                fontFamily: "'Inter', sans-serif"
              }}>
                <p>В команде пока нет участников</p>
              </div>
            )}
          </>
        )}

        {/* Кнопка "Покинуть" (только если есть команда) */}
        {team && (
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

