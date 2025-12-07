import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getUsers, getHackathons, getRoles, getStacks } from '../../../api/api';
import type { User, Hackathon, FilterOption } from '../../../api/types';
import { AdminParticipantFilterPanel, type AdminFilterState } from '../../../components/FilterPanel/AdminParticipantFilterPanel';
import styles from './Participants.module.css';

export const Participants = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [roles, setRoles] = useState<FilterOption[]>([]);
  const [stacks, setStacks] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        // Используем Promise.allSettled для более надежной обработки ошибок
        const [usersResult, hackathonsResult, rolesResult, stacksResult] = await Promise.allSettled([
          getUsers(),
          getHackathons(),
          getRoles(),
          getStacks()
        ]);

        // Обрабатываем результат загрузки пользователей
        if (usersResult.status === 'fulfilled') {
          const usersResponse = usersResult.value;
          if (usersResponse.success) {
            setUsers(usersResponse.data);
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
          if (rolesResponse.success) {
            setRoles(rolesResponse.data);
          } else {
            console.error('Ошибка загрузки ролей:', rolesResponse.message);
          }
        } else {
          console.error('Ошибка загрузки ролей:', rolesResult.reason);
        }

        // Обрабатываем результат загрузки стеков
        if (stacksResult.status === 'fulfilled') {
          const stacksResponse = stacksResult.value;
          if (stacksResponse.success) {
            setStacks(stacksResponse.data);
          } else {
            console.error('Ошибка загрузки стеков:', stacksResponse.message);
          }
        } else {
          console.error('Ошибка загрузки стеков:', stacksResult.reason);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
            stacks={stacks}
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
        <h1 className={styles.title}>Участники</h1>
        <div className={styles.participantsGrid}>
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              className={styles.participantCard}
              onClick={() => navigate(`/admin/users/${user.id}`)}
              type="button"
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
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.sidebar}>
        <AdminParticipantFilterPanel
          hackathons={hackathons.map(h => h.name)}
          roles={roles}
          stacks={stacks}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
        />
      </div>
    </div>
  );
};

