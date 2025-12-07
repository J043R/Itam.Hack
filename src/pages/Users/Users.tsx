import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoFilterSharp } from "react-icons/io5";
import { getHackathonById, getHackathonParticipants, getTeamByHackathonId, addMemberToTeam, getAllTeams, getRoles } from '../../api/api';
import type { Hackathon, Participant, Team, FilterOption } from '../../api/types';
import { ParticipantFilterPanel, type FilterSection } from '../../components/FilterPanel/ParticipantFilterPanel';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Users.module.css';

// Статические фильтры (курс и опыт) - пока оставляем захардкоженными
const staticFilterSections: FilterSection[] = [
  {
    id: 'course',
    title: 'Курс',
    options: [
      { id: '1', label: '1', value: '1' },
      { id: '2', label: '2', value: '2' },
      { id: '3', label: '3', value: '3' },
      { id: '4', label: '4', value: '4' }
    ]
  },
  {
    id: 'experience',
    title: 'Опыт',
    options: [
      { id: '1', label: '1-2', value: '1-2' },
      { id: '2', label: '2-3', value: '2-3' },
      { id: '3', label: '3-4', value: '3-4' },
      { id: '4', label: '5-6', value: '5-6' }
    ]
  }
];

export const Users = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hackathonData, setHackathonData] = useState<Hackathon | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{ [sectionId: string]: string[] }>({
    role: [],
    course: [],
    experience: []
  });

  useEffect(() => {
    // Загружаем данные о хакатоне, участниках и команде при монтировании компонента
    const loadData = async () => {
      if (!id) {
        setError('ID хакатона не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Загружаем данные о хакатоне, участниках, команде, всех командах и ролях параллельно
        // Используем Promise.allSettled для более надежной обработки ошибок
        const [hackathonResult, participantsResult, teamResult, allTeamsResult, rolesResult] = await Promise.allSettled([
          getHackathonById(id),
          getHackathonParticipants(id),
          getTeamByHackathonId(id),
          getAllTeams(),
          getRoles()
        ]);
        
        // Обрабатываем результат загрузки хакатона
        if (hackathonResult.status === 'fulfilled') {
          const hackathonResponse = hackathonResult.value;
          if (hackathonResponse.success) {
            setHackathonData(hackathonResponse.data);
          } else {
            setError(hackathonResponse.message || 'Не удалось загрузить данные хакатона');
          }
        } else {
          setError('Произошла ошибка при загрузке данных хакатона');
          console.error('Ошибка загрузки хакатона:', hackathonResult.reason);
        }

        // Обрабатываем результат загрузки участников
        if (participantsResult.status === 'fulfilled') {
          const participantsResponse = participantsResult.value;
          if (participantsResponse.success) {
            setParticipants(participantsResponse.data);
          } else {
            console.error('Ошибка загрузки участников:', participantsResponse.message);
          }
        } else {
          console.error('Ошибка загрузки участников:', participantsResult.reason);
        }

        // Обрабатываем результат загрузки команды
        if (teamResult.status === 'fulfilled') {
          const teamResponse = teamResult.value;
          if (teamResponse.success && teamResponse.data) {
            setTeam(teamResponse.data);
          }
        } else {
          console.error('Ошибка загрузки команды:', teamResult.reason);
        }

        // Обрабатываем результат загрузки всех команд
        if (allTeamsResult.status === 'fulfilled') {
          const allTeamsResponse = allTeamsResult.value;
          if (allTeamsResponse.success) {
            setAllTeams(allTeamsResponse.data);
          }
        } else {
          console.error('Ошибка загрузки всех команд:', allTeamsResult.reason);
        }

        // Обрабатываем результат загрузки ролей
        if (rolesResult.status === 'fulfilled') {
          const rolesResponse = rolesResult.value;
          if (rolesResponse.success) {
            setRoles(rolesResponse.data);
          }
        } else {
          console.error('Ошибка загрузки ролей:', rolesResult.reason);
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

  // Определяем, какие участники свободны (не в команде для этого хакатона)
  const freeParticipants = useMemo(() => {
    // Получаем все ID участников, которые уже в командах для этого хакатона
    const participantsInTeams = new Set<string>();
    allTeams
      .filter(t => t.hackathonId === id)
      .forEach(team => {
        team.members.forEach(member => {
          participantsInTeams.add(member.id);
        });
      });

    // Фильтруем участников, которые не в командах
    // В моковых данных ID участника совпадает с ID пользователя
    return participants.filter(participant => {
      return !participantsInTeams.has(participant.id);
    });
  }, [participants, allTeams, id]);

  // Фильтрация участников
  const filteredParticipants = useMemo(() => {
    const roleFilters = selectedFilters.role || [];
    const courseFilters = selectedFilters.course || [];
    const experienceFilters = selectedFilters.experience || [];

    // Фильтруем только свободных участников
    let filtered = freeParticipants;

    // Применяем фильтры
    if (roleFilters.length > 0 || courseFilters.length > 0 || experienceFilters.length > 0) {
      filtered = filtered.filter(participant => {
        // Фильтр по роли
        if (roleFilters.length > 0 && !roleFilters.includes(participant.role)) {
          return false;
        }

        // Фильтры по курсу и опыту пока не реализованы, так как в типе Participant нет этих полей
        // В реальном API эти поля должны быть добавлены
        
        return true;
      });
    }

    return filtered;
  }, [freeParticipants, selectedFilters]);

  // Проверяем, является ли текущий пользователь капитаном команды
  const isCaptain = useMemo(() => {
    if (!team || !user) return false;
    // Капитан - это первый участник команды
    return team.members.length > 0 && team.members[0].id === user.id;
  }, [team, user]);

  const handleUserClick = () => {
    // Обработчик клика - пока ничего не делаем
    console.log('Клик по карточке хакатона');
  };

  // Обработчик клика на участника
  const handleParticipantClick = async (participant: Participant) => {
    console.log('Клик на участника:', participant);
    console.log('Текущий пользователь:', user);
    console.log('Команда:', team);
    console.log('Является ли капитаном:', isCaptain);
    
    // Если пользователь не авторизован, переходим на профиль участника
    if (!user) {
      console.log('Пользователь не авторизован, переходим на профиль');
      navigate(`/hackathon/${id}/users/${participant.id}`);
      return;
    }

    // Если у пользователя нет команды или он не капитан, переходим на профиль участника
    if (!team) {
      console.log('У пользователя нет команды, переходим на профиль');
      navigate(`/hackathon/${id}/users/${participant.id}`);
      return;
    }

    if (!isCaptain) {
      console.log('Пользователь не является капитаном, переходим на профиль');
      navigate(`/hackathon/${id}/users/${participant.id}`);
      return;
    }

    // В моковых данных ID участника совпадает с ID пользователя
    const participantUserId = participant.id;
    console.log('ID участника для добавления:', participantUserId);

    // Проверяем, не состоит ли уже участник в команде
    const isAlreadyMember = team.members.some(m => m.id === participantUserId);
    if (isAlreadyMember) {
      alert('Участник уже состоит в вашей команде');
      return;
    }

    // Добавляем участника в команду
    try {
      console.log('Вызываем addMemberToTeam с teamId:', team.id, 'userId:', participantUserId);
      const response = await addMemberToTeam(team.id, participantUserId);
      console.log('Ответ от addMemberToTeam:', response);
      
      if (response.success) {
        // Обновляем команду
        setTeam(response.data);
        alert(`${participant.name} добавлен в команду`);
        // Обновляем список всех команд для пересчета свободных участников
        const allTeamsResponse = await getAllTeams();
        if (allTeamsResponse.success) {
          setAllTeams(allTeamsResponse.data);
        }
      } else {
        console.error('Ошибка добавления участника:', response.message);
        alert(response.message || 'Не удалось добавить участника в команду');
      }
    } catch (error) {
      console.error('Ошибка при добавлении участника в команду:', error);
      alert('Произошла ошибка при добавлении участника в команду');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error || !hackathonData) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'red' }}>{error || 'Хакатон не найден'}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.usersList}>
        <button
          className={styles.userCard}
          onClick={handleUserClick}
          type="button"
        >
          {/* Обводка как у стеклянных кнопок */}
          <div className={styles.userCardBorderTop}></div>
          <div className={styles.userCardBorderRight}></div>
          <div className={styles.userCardBorderBottom}></div>
          <div className={styles.userCardBorderLeft}></div>
          
          <div className={styles.imageContainer}>
            <div className={styles.imagePlaceholder}></div>
          </div>
          <div className={styles.content}>
            <h2 className={styles.name}>{hackathonData.name}</h2>
            <p className={styles.role}>{hackathonData.date}</p>
          </div>
        </button>
        <div className={styles.titleWithFilter}>
          <h2 className={styles.participantsTitle}>Участники</h2>
          <button 
            className={styles.filterButton}
            onClick={() => setIsFilterOpen(true)}
            aria-label="Фильтры"
            type="button"
          >
            <IoFilterSharp style={{ fontSize: '20px', color: '#E7E3D8' }} />
          </button>
        </div>

        {/* Панель фильтров участников */}
        <ParticipantFilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          sections={[
            {
              id: 'role',
              title: 'Роль',
              options: roles.map(role => ({
                id: role.id,
                label: role.label,
                value: role.value
              }))
            },
            ...staticFilterSections
          ]}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
        />

        <div className={styles.participantsList}>
          {filteredParticipants.length === 0 ? (
            <p style={{ color: '#E7E3D8', textAlign: 'center', marginTop: '20px' }}>
              Нет свободных участников
            </p>
          ) : (
            filteredParticipants.map((participant) => (
              <button
                key={participant.id}
                className={styles.participantCard}
                onClick={() => handleParticipantClick(participant)}
                type="button"
                title={isCaptain && team ? 'Нажмите, чтобы добавить в команду' : 'Просмотр профиля'}
              >
                {/* Обводка как у стеклянных кнопок */}
                <div className={styles.participantCardBorderTop}></div>
                <div className={styles.participantCardBorderRight}></div>
                <div className={styles.participantCardBorderBottom}></div>
                <div className={styles.participantCardBorderLeft}></div>
                
                {/* Аватарка пользователя */}
                <div className={styles.participantAvatar}></div>
                
                {/* Имя, фамилия и роль участника */}
                <div className={styles.participantNameContainer}>
                  <div className={styles.participantFirstName}>
                    {participant.name.split(' ')[0]}
                  </div>
                  <div className={styles.participantLastName}>
                    {participant.name.split(' ')[1] || ''}
                  </div>
                  <div className={styles.participantRole}>
                    {participant.role}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

