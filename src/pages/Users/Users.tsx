import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoFilterSharp } from "react-icons/io5";
import { getHackathonById, getHackathonParticipants } from '../../api/api';
import type { Hackathon, Participant } from '../../api/types';
import { ParticipantFilterPanel, type FilterSection } from '../../components/FilterPanel/ParticipantFilterPanel';
import styles from './Users.module.css';

const filterSections: FilterSection[] = [
  {
    id: 'role',
    title: 'Роль',
    options: [
      { id: '1', label: 'Frontend', value: 'Frontend' },
      { id: '2', label: 'Backend', value: 'Backend' },
      { id: '3', label: 'Designer', value: 'Designer' },
      { id: '4', label: 'Product manager', value: 'Product manager' }
    ]
  },
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
  const [hackathonData, setHackathonData] = useState<Hackathon | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{ [sectionId: string]: string[] }>({
    role: [],
    course: [],
    experience: []
  });

  useEffect(() => {
    // Загружаем данные о хакатоне и участниках при монтировании компонента
    const loadData = async () => {
      if (!id) {
        setError('ID хакатона не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Загружаем данные о хакатоне и участниках параллельно
        const [hackathonResponse, participantsResponse] = await Promise.all([
          getHackathonById(id),
          getHackathonParticipants(id)
        ]);
        
        if (hackathonResponse.success) {
          setHackathonData(hackathonResponse.data);
        } else {
          setError(hackathonResponse.message || 'Не удалось загрузить данные хакатона');
        }

        if (participantsResponse.success) {
          setParticipants(participantsResponse.data);
        } else {
          console.error('Ошибка загрузки участников:', participantsResponse.message);
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

  // Фильтрация участников
  const filteredParticipants = useMemo(() => {
    const roleFilters = selectedFilters.role || [];
    const courseFilters = selectedFilters.course || [];
    const experienceFilters = selectedFilters.experience || [];

    // Если нет выбранных фильтров, возвращаем всех участников
    if (roleFilters.length === 0 && courseFilters.length === 0 && experienceFilters.length === 0) {
      return participants;
    }

    return participants.filter(participant => {
      // Фильтр по роли
      if (roleFilters.length > 0 && !roleFilters.includes(participant.role)) {
        return false;
      }

      // Фильтры по курсу и опыту пока не реализованы, так как в типе Participant нет этих полей
      // В реальном API эти поля должны быть добавлены
      
      return true;
    });
  }, [participants, selectedFilters]);

  const handleUserClick = () => {
    // Обработчик клика - пока ничего не делаем
    console.log('Клик по карточке хакатона');
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
          sections={filterSections}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
        />

        <div className={styles.participantsList}>
          {filteredParticipants.map((participant) => (
            <button
              key={participant.id}
              className={styles.participantCard}
              onClick={() => navigate(`/hackathon/${id}/users/${participant.id}`)}
              type="button"
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
          ))}
        </div>
      </div>
    </div>
  );
};

