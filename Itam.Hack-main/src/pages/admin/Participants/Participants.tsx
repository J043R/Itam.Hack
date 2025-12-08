import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getUsers, getUsersWithoutTeam, getHackathons, getRoles, addUserToTeam } from '../../../api/api';
import type { Hackathon, FilterOption } from '../../../api/types';
import { AdminParticipantFilterPanel, type AdminFilterState } from '../../../components/FilterPanel/AdminParticipantFilterPanel';
import styles from './Participants.module.css';

interface ParticipantUser {
  id: string;
  name: string;
  surname: string;
  role: string;
  skills: string[];
  avatar?: string;
}

export const Participants = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<ParticipantUser[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [roles, setRoles] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  
  // Режим добавления в команду
  const mode = searchParams.get('mode');
  const teamId = searchParams.get('teamId');
  const hackathonId = searchParams.get('hackathonId');
  const isAddToTeamMode = mode === 'add-to-team' && teamId && hackathonId;
  
  // Проверяем URL параметр для автоматического применения фильтра
  const initialFilters: AdminFilterState = {
    hackathons: [],
    roles: [],
    statuses: searchParams.get('filter') === 'free' ? ['free'] : [],
    stacks: []
  };
  
  const [selectedFilters, setSelectedFilters] = useState<AdminFilterState>(initialFilters);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // В режиме добавления в команду загружаем только участников без команды
        const usersPromise = isAddToTeamMode && hackathonId
          ? getUsersWithoutTeam(hackathonId)
          : getUsers();
        
        // Используем Promise.allSettled для более надежной обработки ошибок
        const [usersResult, hackathonsResult, rolesResult] = await Promise.allSettled([
          usersPromise,
          getHackathons(),
          getRoles()
        ]);

        // Обрабатываем результат загрузки пользователей
        if (usersResult.status === 'fulfilled') {
          const usersResponse = usersResult.value;
          if (usersResponse.success) {
            // Преобразуем данные в нужный формат
            // Бэкенд возвращает AnketaWithUser с полями: name (firstName), last_name (lastName), role
            // А также вложенный user с first_name, last_name
            const formattedUsers: ParticipantUser[] = (usersResponse.data as any[]).map((u: any) => ({
              id: u.user_id || u.id,
              name: u.name || u.firstName || u.user?.first_name || '',
              surname: u.last_name || u.lastName || u.user?.last_name || '',
              role: u.role || '',
              skills: u.skills ? (typeof u.skills === 'string' ? u.skills.split(',').map((s: string) => s.trim()) : u.skills) : [],
              avatar: u.avatar || u.user?.avatar_url
            }));
            setUsers(formattedUsers);
          } else {
            console.error('Ошибка загрузки пользователей:', usersResponse.message);
          }
        } else {
          console.error('Ошибка загрузки пользователей:', usersResult.reason);
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

        // Обрабатываем результат загрузки ролей
        if (rolesResult.status === 'fulfilled') {
          const rolesResponse = rolesResult.value;
          if (rolesResponse.success && rolesResponse.data && rolesResponse.data.length > 0) {
            setRoles(rolesResponse.data);
          } else {
            // Если API не вернул роли, извлекаем уникальные роли из пользователей
            if (usersResult.status === 'fulfilled' && usersResult.value.success) {
              const usersData = usersResult.value.data as any[];
              const uniqueRoles = [...new Set(usersData.map((u: any) => u.role).filter(Boolean))];
              const rolesFromUsers: FilterOption[] = uniqueRoles.map((role, index) => ({
                id: String(index + 1),
                label: role,
                value: role
              }));
              setRoles(rolesFromUsers);
            }
          }
        } else {
          console.error('Ошибка загрузки ролей:', rolesResult.reason);
          // Извлекаем роли из пользователей как fallback
          if (usersResult.status === 'fulfilled' && usersResult.value.success) {
            const usersData = usersResult.value.data as any[];
            const uniqueRoles = [...new Set(usersData.map((u: any) => u.role).filter(Boolean))];
            const rolesFromUsers: FilterOption[] = uniqueRoles.map((role, index) => ({
              id: String(index + 1),
              label: role,
              value: role
            }));
            setRoles(rolesFromUsers);
          }
        }

      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAddToTeamMode, hackathonId]);

  // Фильтрация участников
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Фильтр по роли
    if (selectedFilters.roles.length > 0) {
      filtered = filtered.filter(user => 
        selectedFilters.roles.includes(user.role)
      );
    }

    // Фильтр по стеку (навыкам)
    if (selectedFilters.stacks.length > 0) {
      filtered = filtered.filter(user =>
        selectedFilters.stacks.some(stack => 
          user.skills.some(skill => 
            skill.toLowerCase().includes(stack.toLowerCase())
          )
        )
      );
    }

    // Фильтр по статусу (свободен/в команде)
    // Пока используем моковые данные - в реальном API нужно будет получать информацию о командах
    if (selectedFilters.statuses.length > 0) {
      // Для демонстрации: считаем, что пользователи с ID 1-3 в команде, остальные свободны
      filtered = filtered.filter(user => {
        const isInTeam = ['1', '2', '3'].includes(user.id);
        if (selectedFilters.statuses.includes('in-team')) {
          return isInTeam;
        }
        if (selectedFilters.statuses.includes('free')) {
          return !isInTeam;
        }
        return true;
      });
    }

    // Фильтр по хакатонам
    // В реальном API нужно будет получать информацию о том, в каких хакатонах участвует пользователь
    // Это может быть через связь User -> Teams -> Hackathons или через отдельное поле user.hackathons
    if (selectedFilters.hackathons.length > 0) {
      // Для демонстрации: пока фильтр не работает, так как нет связи пользователь-хакатон в типах
      // Когда бэкенд будет готов, здесь будет проверка: user.hackathons.some(h => selectedFilters.hackathons.includes(h.name))
      // Или через команды: user.teams.some(team => selectedFilters.hackathons.includes(team.hackathon.name))
    }

    return filtered;
  }, [users, selectedFilters]);

  const handleAddToTeam = async (userId: string) => {
    if (!hackathonId || !teamId) return;
    
    setAddingUserId(userId);
    try {
      const response = await addUserToTeam(teamId, userId, hackathonId);
      if (response.success) {
        alert(response.data?.message || 'Участник добавлен в команду');
        // Убираем добавленного пользователя из списка
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(response.message || 'Не удалось добавить участника');
      }
    } catch (error) {
      console.error('Ошибка добавления в команду:', error);
      alert('Произошла ошибка при добавлении участника');
    } finally {
      setAddingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.participants}>
        <div className={styles.mainContent}>
          <p style={{ color: '#E7E3D8' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (filteredUsers.length === 0 && !loading) {
    return (
      <div className={styles.participants}>
        <div className={styles.mainContent}>
          <h1 className={styles.title}>Участники</h1>
          <p style={{ color: '#E7E3D8' }}>Участники не найдены</p>
        </div>
        <div className={styles.sidebar}>
          <AdminParticipantFilterPanel
            hackathons={hackathons.map(h => h.name)}
            roles={roles}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.participants}>
      <div className={styles.mainContent}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>
            {isAddToTeamMode ? 'Выберите участника для добавления в команду' : 'Участники'}
          </h1>
          {isAddToTeamMode && (
            <button 
              className={styles.backButton}
              onClick={() => navigate('/admin/teams')}
              type="button"
            >
              ← Назад к командам
            </button>
          )}
        </div>
        <div className={styles.participantsGrid}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={styles.participantCard}
              onClick={() => !isAddToTeamMode && navigate(`/admin/users/${user.id}`)}
              style={{ cursor: isAddToTeamMode ? 'default' : 'pointer' }}
            >
              {/* Обводка как у стеклянных кнопок */}
              <div className={styles.cardBorderTop}></div>
              <div className={styles.cardBorderRight}></div>
              <div className={styles.cardBorderBottom}></div>
              <div className={styles.cardBorderLeft}></div>
              
              {/* Аватар */}
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`${user.name} ${user.surname}`}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}></div>
              )}
              
              {/* Имя, фамилия и роль */}
              <div className={styles.participantInfo}>
                <div className={styles.participantName}>{user.name}</div>
                <div className={styles.participantSurname}>{user.surname}</div>
                <div className={styles.participantRole}>{user.role}</div>
              </div>
              
              {/* Кнопка добавления в команду (только в режиме добавления) */}
              {isAddToTeamMode && (
                <div className={styles.cardActions}>
                  <button
                    className={styles.addToTeamBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToTeam(user.id);
                    }}
                    disabled={addingUserId === user.id}
                    type="button"
                  >
                    {addingUserId === user.id ? '...' : '+'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.sidebar}>
        <AdminParticipantFilterPanel
          hackathons={hackathons.map(h => h.name)}
          roles={roles}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
        />
      </div>
    </div>
  );
};

