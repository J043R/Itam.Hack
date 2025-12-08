import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ButtonSimple } from '../../components/ui/Button/button';
import { Modal } from '../../components/ui/Modal/Modal';
import { getHackathonById, registerForHackathon, createTeam, getMyTeam } from '../../api/api';
import type { Hackathon } from '../../api/types';
import { formatDateToRussian } from '../../utils/dateFormat';
import styles from './InsideHack.module.css';

export const InsideHack = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hackathonData, setHackathonData] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: '',
    maxSize: '',
    status: 'open'
  });
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [createTeamError, setCreateTeamError] = useState<string | null>(null);

  useEffect(() => {
    // Загружаем данные о хакатоне при монтировании компонента
    const loadHackathon = async () => {
      if (!id) {
        setError('ID хакатона не указан');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getHackathonById(id);
        
        if (response.success) {
          // Форматируем дату в российский формат
          const hackathonData = {
            ...response.data,
            date: formatDateToRussian(response.data.date)
          };
          setHackathonData(hackathonData);
        } else {
          setError(response.message || 'Не удалось загрузить данные хакатона');
        }
      } catch (err) {
        setError('Произошла ошибка при загрузке данных');
        console.error('Ошибка загрузки хакатона:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHackathon();
  }, [id]);

  const handleButtonClick = async (text: string) => {
    if (text === 'Создать команду') {
      setIsCreateTeamModalOpen(true);
    } else if (text === 'Участники') {
      navigate(`/hackathon/${id}/users`);
    } else if (text === 'Моя команда') {
      if (!id) {
        console.error('❌ Hackathon ID not found');
        return;
      }
      
      try {
        console.log('📋 Fetching my team for current hackathon');
        const response = await getMyTeam();
        
        if (response.success) {
          console.log('✅ My team fetched successfully:', response.data);
          // Переход на страницу "Моя команда" с данными команды и хакатона
          navigate(`/hackathon/${id}/team`, { 
            state: { 
              team: response.data,
              hackathon: hackathonData // Передаем данные хакатона, чтобы не делать повторный запрос
            } 
          });
        } else {
          console.error('❌ Failed to fetch my team:', response.message);
          // Переход на страницу даже если команда не найдена
          navigate(`/hackathon/${id}/team`);
        }
      } catch (err) {
        console.error('❌ Error fetching my team:', err);
        navigate(`/hackathon/${id}/team`);
      }
    }
  };

  const handleCreateTeam = async () => {
    if (!id) {
      setCreateTeamError('ID хакатона не указан');
      return;
    }

    if (!teamFormData.name.trim()) {
      setCreateTeamError('Название команды обязательно');
      return;
    }

    setIsCreatingTeam(true);
    setCreateTeamError(null);

    try {
      // Формируем данные для отправки на бэкенд с правильными именами полей
      const teamData = {
        name: teamFormData.name.trim(),
        hackathon_id: id,
        description: teamFormData.description.trim() || undefined,
        max_size: teamFormData.maxSize ? parseInt(teamFormData.maxSize) : undefined,
        status: teamFormData.status || undefined
      };

      // Удаляем undefined поля
      const cleanedData = Object.fromEntries(
        Object.entries(teamData).filter(([_, value]) => value !== undefined)
      );

      console.log('📝 Creating team with data:', cleanedData);
      console.log('📝 Sending POST request to /api/v1/teams');
      
      const response = await createTeam(cleanedData as any);
      
      if (response.success && response.data) {
        console.log('✅ Team created successfully:', response.data);
        setIsCreateTeamModalOpen(false);
        setTeamFormData({
          name: '',
          description: '',
          maxSize: '',
          status: 'open'
        });
        // Перенаправляем на страницу "Моя команда" после создания с данными команды
        if (id) {
          navigate(`/hackathon/${id}/team`, { state: { team: response.data } });
        }
      } else {
        const errorMessage = response.message || 'Не удалось создать команду';
        console.error('❌ Team creation failed:', errorMessage);
        setCreateTeamError(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Произошла ошибка при создании команды';
      console.error('❌ Team creation error:', err);
      setCreateTeamError(errorMessage);
    } finally {
      setIsCreatingTeam(false);
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
      <div className={styles.hackathonCard}>
        {/* Обводка как у стеклянных кнопок */}
        <div className={styles.hackathonCardBorderTop}></div>
        <div className={styles.hackathonCardBorderRight}></div>
        <div className={styles.hackathonCardBorderBottom}></div>
        <div className={styles.hackathonCardBorderLeft}></div>
        
        <div className={styles.imageContainer}>
          <div className={styles.imagePlaceholder}></div>
        </div>
        <div className={styles.content}>
          <h1 className={styles.name}>{hackathonData.name}</h1>
          <p className={styles.date}>{hackathonData.date}</p>
        </div>
      </div>
      
      {/* Три кнопки */}
      <div className={styles.emptyCardsContainer}>
        {[
          { index: 1, text: 'Создать команду', image: '/images/3D.png' },
          { index: 2, text: 'Моя команда', image: '/images/3D2.png' },
          { index: 3, text: 'Участники', image: '/images/3D3.png' }
        ].map(({ index, text, image }) => (
          <div key={index} className={styles.buttonWithImage}>
            <ButtonSimple
              type="glass-card-wide"
              className={styles.actionButton}
              onClick={() => handleButtonClick(text)}
            >
              <div className={styles.emptyCardText}>{text}</div>
            </ButtonSimple>
            <img src={image} alt={text} className={styles.buttonImage} />
          </div>
        ))}
      </div>
      
      {/* Кнопка "Зарегистрироваться" внизу */}
      <div className={styles.registerButtonContainer}>
        <ButtonSimple
          type="entry-primary"
          className={styles.registerButton}
          onClick={async () => {
            if (!id) {
              setRegisterError('ID хакатона не указан');
              return;
            }

            setIsRegistering(true);
            setRegisterError(null);
            setRegisterSuccess(false);

            try {
              console.log('📝 Registering for hackathon:', id);
              const response = await registerForHackathon(id);
              
              if (response.success) {
                console.log('✅ Successfully registered for hackathon');
                setRegisterSuccess(true);
                // Можно показать уведомление или обновить состояние
              } else {
                const errorMessage = response.message || 'Не удалось зарегистрироваться на хакатон';
                console.error('❌ Registration failed:', errorMessage);
                setRegisterError(errorMessage);
              }
            } catch (err) {
              const errorMessage = 'Произошла ошибка при регистрации на хакатон';
              console.error('❌ Registration error:', err);
              setRegisterError(errorMessage);
            } finally {
              setIsRegistering(false);
            }
          }}
          disabled={isRegistering || registerSuccess}
        >
          {isRegistering ? 'Регистрация...' : registerSuccess ? 'Зарегистрирован' : 'Зарегистрироваться'}
        </ButtonSimple>
        
        {registerError && (
          <div style={{ 
            marginTop: '12px', 
            padding: '8px 12px', 
            backgroundColor: 'rgba(255, 0, 0, 0.1)', 
            border: '1px solid rgba(255, 0, 0, 0.3)', 
            borderRadius: '6px', 
            color: '#ff6b6b', 
            fontSize: '12px',
            textAlign: 'center'
          }}>
            {registerError}
          </div>
        )}
        
        {registerSuccess && (
          <div style={{ 
            marginTop: '12px', 
            padding: '8px 12px', 
            backgroundColor: 'rgba(0, 255, 0, 0.1)', 
            border: '1px solid rgba(0, 255, 0, 0.3)', 
            borderRadius: '6px', 
            color: '#4caf50', 
            fontSize: '12px',
            textAlign: 'center'
          }}>
            Вы успешно зарегистрированы на хакатон!
          </div>
        )}
      </div>

      {/* Модальное окно создания команды */}
      <Modal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        className="formModal"
      >
        <div className={styles.createTeamModal}>
          <h2 className={styles.createTeamModalTitle}>
            Новая команда
          </h2>

          <div className={styles.createTeamFormGroup}>
            <label className={styles.createTeamFormLabel}>Название</label>
            <input
              type="text"
              placeholder="Введите название"
              value={teamFormData.name}
              onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
              className={styles.createTeamInput}
            />
          </div>

          <div className={styles.createTeamFormGroup}>
            <label className={styles.createTeamFormLabel}>Описание</label>
            <textarea
              placeholder="Расскажите о команде"
              value={teamFormData.description}
              onChange={(e) => setTeamFormData({ ...teamFormData, description: e.target.value })}
              className={styles.createTeamTextarea}
            />
          </div>

          <div className={styles.createTeamRow}>
            <div className={styles.createTeamFormGroup}>
              <label className={styles.createTeamFormLabel}>Размер</label>
              <input
                type="number"
                placeholder="Макс."
                value={teamFormData.maxSize}
                onChange={(e) => setTeamFormData({ ...teamFormData, maxSize: e.target.value })}
                className={styles.createTeamInput}
                min="1"
                max="20"
              />
            </div>

            <div className={styles.createTeamFormGroup}>
              <label className={styles.createTeamFormLabel}>Статус</label>
              <select
                value={teamFormData.status}
                onChange={(e) => setTeamFormData({ ...teamFormData, status: e.target.value })}
                className={styles.createTeamSelect}
              >
                <option value="open">Открыта</option>
                <option value="closed">Закрыта</option>
              </select>
            </div>
          </div>

          {createTeamError && (
            <div className={styles.createTeamError}>
              {createTeamError}
            </div>
          )}

          <div className={styles.createTeamButtonsContainer}>
            <div className={styles.createTeamButtonWrapper}>
              <ButtonSimple
                type="button-secondary"
                size="M"
                onClick={() => setIsCreateTeamModalOpen(false)}
                disabled={isCreatingTeam}
                className=""
              >
                Отмена
              </ButtonSimple>
            </div>
            <div className={styles.createTeamButtonWrapper}>
              <ButtonSimple
                type="entry-primary"
                size="M"
                onClick={handleCreateTeam}
                disabled={isCreatingTeam || !teamFormData.name.trim()}
                loading={isCreatingTeam}
                className=""
              >
                {isCreatingTeam ? 'Создание...' : 'Создать'}
              </ButtonSimple>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

