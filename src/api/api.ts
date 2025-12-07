import type { 
  User, 
  Hackathon, 
  Team, 
  MyHackathon, 
  Participant, 
  Achievement,
  Notification,
  AnalyticsData,
  FilterOption,
  ApiResponse,
  Organizer
} from './types';
import {
  mockUsers,
  mockHackathons,
  mockMyHackathons,
  mockTeams,
  mockParticipants,
  mockAchievements,
  mockNotifications,
  mockOrganizers,
  mockRoles,
  mockStacks
} from './mockData';

// Базовый URL API (для будущего подключения к бэкенду)
// @ts-expect-error - переменная будет использована при подключении к бэкенду
const _API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Имитация задержки сети
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Базовая функция для выполнения fetch запросов
// Сейчас возвращает моковые данные, но структура готова для подключения к бэкенду
// Для подключения к бэкенду: раскомментировать код ниже и закомментировать блок с моковыми данными
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchAPI<T>(
  _endpoint: string,
  _options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // TODO: Когда будет готов бэкенд, раскомментировать код ниже и закомментировать блок с моковыми данными
  /*
  try {
    // Получаем токен авторизации из localStorage (если есть)
    const token = localStorage.getItem('authToken');
    
    // Подготавливаем body для POST/PUT/PATCH запросов
    let body = _options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      body = JSON.stringify(body);
    }
    
    const response = await fetch(`${_API_BASE_URL}${_endpoint}`, {
      method: _options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ..._options.headers,
      },
      ...(body ? { body } : {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      data,
      success: true,
    };
  } catch (error) {
    return {
      data: null as T,
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
  */

  // Временная заглушка - имитация задержки сети (убрать при подключении к бэкенду)
  await delay(300 + Math.random() * 500);
  
  // Временная заглушка - возвращаем моковые данные (убрать при подключении к бэкенду)
  return {
    data: {} as T,
    success: true,
  };
}

// API функции для хакатонов

/**
 * Получить список всех хакатонов
 */
export async function getHackathons(): Promise<ApiResponse<Hackathon[]>> {
  await delay();
  return {
    data: mockHackathons,
    success: true,
  };
}

/**
 * Получить хакатон по ID
 */
export async function getHackathonById(id: string): Promise<ApiResponse<Hackathon>> {
  await delay();
  const hackathon = mockHackathons.find(h => h.id === id);
  
  if (!hackathon) {
    return {
      data: {} as Hackathon,
      success: false,
      message: `Хакатон с ID ${id} не найден`,
    };
  }

  return {
    data: hackathon,
    success: true,
  };
}

/**
 * Получить список моих хакатонов
 */
export async function getMyHackathons(): Promise<ApiResponse<MyHackathon[]>> {
  await delay();
  return {
    data: mockMyHackathons,
    success: true,
  };
}

// API функции для аутентификации

/**
 * Вход по коду от телеграм-бота (только для обычных пользователей)
 * @param code - Код от телеграм-бота
 * 
 * ВАЖНО: При подключении к бэкенду:
 * 1. Заменить на: return await fetchAPI<User>('/auth/login', { method: 'POST', body: { code } });
 * 2. Бэкенд должен возвращать { user: User, token: string }
 * 3. После успешного ответа сохранить токен: localStorage.setItem('authToken', response.data.token);
 */
export async function login(code: string): Promise<ApiResponse<User>> {
  await delay();
  
  // Временная логика для моковых данных
  // В реальном API здесь будет запрос к бэкенду с проверкой code
  // return await fetchAPI<User>('/auth/login', { method: 'POST', body: { code } });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void code; // Будет использовано при подключении к бэкенду
  
  // Для обычных пользователей берем первого из моковых данных
  // В реальном API здесь будет проверка кода и получение пользователя
  const user = mockUsers[0];
  
  if (!user) {
    return {
      data: {} as User,
      success: false,
      message: 'Неверный код доступа',
    };
  }
  
  // Убеждаемся, что у пользователя роль 'user'
  const userWithRole: User = {
    ...user,
    userRole: 'user',
  };
  
  return {
    data: userWithRole,
    success: true,
  };
}

/**
 * Вход администратора по email и паролю
 * @param email - Email администратора
 * @param password - Пароль администратора
 * 
 * ВАЖНО: При подключении к бэкенду:
 * 1. Заменить на: return await fetchAPI<User>('/admin/login', { method: 'POST', body: { email, password } });
 * 2. Бэкенд должен возвращать { user: User, token: string }
 * 3. После успешного ответа сохранить токен: localStorage.setItem('authToken', response.data.token);
 */
export async function adminLogin(email: string, password: string): Promise<ApiResponse<User>> {
  await delay();
  
  // Временная логика для моковых данных
  // В реальном API здесь будет запрос к бэкенду
  // return await fetchAPI<User>('/admin/login', { method: 'POST', body: { email, password } });
  
  // Для тестирования: email "admin@admin.com" или "admin" и пароль "admin"
  if ((email === 'admin@admin.com' || email === 'admin') && password === 'admin') {
    const adminUser: User = {
      id: 'admin-1',
      name: 'Администратор',
      surname: 'Системы',
      telegramId: '@admin',
      role: 'Admin',
      userRole: 'admin',
      skills: [],
    };
    
    return {
      data: adminUser,
      success: true,
    };
  }
  
  return {
    data: {} as User,
    success: false,
    message: 'Неверный email или пароль',
  };
}

/**
 * Регистрация администратора по email и паролю
 * @param email - Email администратора
 * @param password - Пароль администратора
 */
export async function adminRegister(email: string, password: string): Promise<ApiResponse<User>> {
  await delay();
  
  // Временная логика для моковых данных
  // В реальном API здесь будет запрос к бэкенду
  
  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      data: {} as User,
      success: false,
      message: 'Неверный формат email',
    };
  }
  
  // Валидация пароля
  if (password.length < 6) {
    return {
      data: {} as User,
      success: false,
      message: 'Пароль должен содержать минимум 6 символов',
    };
  }
  
  // Для тестирования: создаем нового админа
  // В реальном API здесь будет создание пользователя в базе данных
  const adminUser: User = {
    id: `admin-${Date.now()}`,
    name: 'Администратор',
    surname: email.split('@')[0],
    telegramId: `@${email.split('@')[0]}`,
    role: 'Admin',
    userRole: 'admin',
    skills: [],
  };
  
  return {
    data: adminUser,
    success: true,
    message: 'Регистрация успешна',
  };
}

// API функции для пользователей

/**
 * Получить список всех пользователей
 */
export async function getUsers(): Promise<ApiResponse<User[]>> {
  await delay();
  return {
    data: mockUsers,
    success: true,
  };
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  await delay();
  const user = mockUsers.find(u => u.id === id);
  
  if (!user) {
    return {
      data: {} as User,
      success: false,
      message: `Пользователь с ID ${id} не найден`,
    };
  }

  return {
    data: user,
    success: true,
  };
}

/**
 * Получить список участников хакатона
 */
export async function getHackathonParticipants(_hackathonId: string): Promise<ApiResponse<Participant[]>> {
  await delay();
  // В реальном API здесь будет запрос к бэкенду
  // Сейчас возвращаем моковые данные
  return {
    data: mockParticipants,
    success: true,
  };
}

// API функции для команд

/**
 * Получить команду по ID
 */
export async function getTeamById(teamId: string): Promise<ApiResponse<Team>> {
  await delay();
  const team = mockTeams.find(t => t.id === teamId);
  
  if (!team) {
    return {
      data: {} as Team,
      success: false,
      message: `Команда с ID ${teamId} не найдена`,
    };
  }

  return {
    data: team,
    success: true,
  };
}

/**
 * Получить команду по ID хакатона
 */
export async function getTeamByHackathonId(hackathonId: string): Promise<ApiResponse<Team | null>> {
  await delay();
  const team = mockTeams.find(t => t.hackathonId === hackathonId);
  
  // Возвращаем копию команды, чтобы избежать мутаций
  if (team) {
    return {
      data: {
        ...team,
        members: team.members.map(m => ({ ...m }))
      },
      success: true,
    };
  }
  
  return {
    data: null,
    success: true,
  };
}

/**
 * Получить все команды
 */
export async function getAllTeams(): Promise<ApiResponse<Team[]>> {
  await delay();
  // Возвращаем копию массива команд, чтобы избежать мутаций
  return {
    data: mockTeams.map(team => ({
      ...team,
      members: team.members.map(m => ({ ...m }))
    })),
    success: true,
  };
}

/**
 * Получить команды пользователя по его ID
 */
export async function getUserTeams(userId: string): Promise<ApiResponse<Array<Team & { registrationDate: string }>>> {
  await delay();
  // Находим все команды, в которых состоит пользователь
  const userTeams = mockTeams
    .filter(team => team.members.some(member => member.id === userId))
    .map(team => {
      const hackathon = mockHackathons.find(h => h.id === team.hackathonId);
      return {
        ...team,
        members: team.members.map(m => ({ ...m })),
        // Для моковых данных используем дату хакатона как дату регистрации
        registrationDate: hackathon?.date || 'Дата не указана'
      };
    });
  
  return {
    data: userTeams,
    success: true,
  };
}

/**
 * Создать команду
 */
export async function createTeam(teamData: Omit<Team, 'id'>): Promise<ApiResponse<Team>> {
  await delay();
  // В реальном API здесь будет POST запрос
  const newTeam: Team = {
    ...teamData,
    id: String(mockTeams.length + 1),
  };
  
  return {
    data: newTeam,
    success: true,
  };
}

/**
 * Обновить название команды
 */
export async function updateTeamName(teamId: string, name: string): Promise<ApiResponse<Team>> {
  await delay();
  const team = mockTeams.find(t => t.id === teamId);
  
  if (!team) {
    return {
      data: {} as Team,
      success: false,
      message: `Команда с ID ${teamId} не найдена`,
    };
  }

  const updatedTeam = { ...team, name };
  
  return {
    data: updatedTeam,
    success: true,
  };
}

/**
 * Добавить участника в команду
 */
export async function addMemberToTeam(teamId: string, userId: string): Promise<ApiResponse<Team>> {
  await delay();
  const team = mockTeams.find(t => t.id === teamId);
  
  if (!team) {
    return {
      data: {} as Team,
      success: false,
      message: `Команда с ID ${teamId} не найдена`,
    };
  }

  // Проверяем, не состоит ли уже участник в команде
  const isAlreadyMember = team.members.some(m => m.id === userId);
  if (isAlreadyMember) {
    return {
      data: team,
      success: false,
      message: 'Участник уже состоит в команде',
    };
  }

  // Находим пользователя
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return {
      data: {} as Team,
      success: false,
      message: `Пользователь с ID ${userId} не найден`,
    };
  }

  // Добавляем пользователя в команду (создаем новый объект, чтобы избежать мутаций)
  const updatedTeam = {
    ...team,
    members: [...team.members.map(m => ({ ...m })), { ...user }]
  };

  // Обновляем моковые данные
  const teamIndex = mockTeams.findIndex(t => t.id === teamId);
  if (teamIndex !== -1) {
    mockTeams[teamIndex] = {
      ...updatedTeam,
      members: updatedTeam.members.map(m => ({ ...m }))
    };
  }

  // Сохраняем в localStorage для персистентности
  const savedTeams = localStorage.getItem('teams');
  const teams = savedTeams ? JSON.parse(savedTeams) : {};
  teams[teamId] = updatedTeam;
  localStorage.setItem('teams', JSON.stringify(teams));
  
  console.log('Участник добавлен в команду. Обновленная команда:', updatedTeam);
  
  return {
    data: {
      ...updatedTeam,
      members: updatedTeam.members.map(m => ({ ...m }))
    },
    success: true,
  };
}

// API функции для достижений

/**
 * Получить достижения пользователя
 */
export async function getUserAchievements(_userId: string): Promise<ApiResponse<Achievement[]>> {
  await delay();
  // В реальном API здесь будет запрос к бэкенду с userId
  return {
    data: mockAchievements,
    success: true,
  };
}

// API функции для уведомлений

/**
 * Отправить приглашение пользователю в команду
 */
export async function inviteUserToTeam(
  userId: string, 
  teamId: string, 
  hackathonId: string
): Promise<ApiResponse<{ success: boolean }>> {
  await delay();
  // В реальном API здесь будет POST запрос
  console.log(`Приглашение пользователя ${userId} в команду ${teamId} для хакатона ${hackathonId}`);
  
  return {
    data: { success: true },
    success: true,
  };
}

/**
 * Покинуть команду (выход участника и удаление команды, если это последний участник)
 */
export async function leaveTeam(teamId: string): Promise<ApiResponse<{ success: boolean }>> {
  await delay();
  // В реальном API здесь будет DELETE запрос
  console.log(`Выход из команды ${teamId}`);
  
  // Удаляем команду из localStorage (для моковых данных)
  const savedTeams = localStorage.getItem('teamNames');
  if (savedTeams) {
    const teams = JSON.parse(savedTeams);
    delete teams[teamId];
    localStorage.setItem('teamNames', JSON.stringify(teams));
  }
  
  return {
    data: { success: true },
    success: true,
  };
}

/**
 * Удалить хакатон из "Моих хакатонов"
 */
export async function deleteMyHackathon(hackathonId: string): Promise<ApiResponse<{ success: boolean }>> {
  await delay();
  // В реальном API здесь будет DELETE запрос
  // await fetchAPI(`/my-hackathons/${hackathonId}`, { method: 'DELETE' });
  console.log(`Удаление хакатона ${hackathonId} из моих хакатонов`);
  
  return {
    data: { success: true },
    success: true,
  };
}

/**
 * Получить список уведомлений
 */
export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  await delay();
  // В реальном API здесь будет GET запрос
  // return await fetchAPI<Notification[]>('/notifications');
  
  return {
    data: mockNotifications,
    success: true,
  };
}

/**
 * Принять приглашение в команду
 */
export async function acceptInvitation(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
  await delay();
  // В реальном API здесь будет POST запрос
  // await fetchAPI(`/notifications/${notificationId}/accept`, { method: 'POST' });
  console.log(`Принятие приглашения ${notificationId}`);
  
  // Находим уведомление
  const notification = mockNotifications.find(n => n.id === notificationId);
  
  if (notification && (notification.type === 'invitation' || notification.type === 'join_request')) {
    // Находим команду
    const team = mockTeams.find(t => t.id === notification.team.id);
    
    if (team) {
      // Получаем текущего пользователя (в реальном API это будет из сессии/токена)
      // Для моковых данных используем первого пользователя или получаем из localStorage
      const currentUserId = localStorage.getItem('currentUserId') || '1';
      const currentUser = mockUsers.find(u => u.id === currentUserId);
      
      if (currentUser) {
        // Проверяем, не состоит ли уже пользователь в команде
        const isAlreadyMember = team.members.some(m => m.id === currentUser.id);
        
        if (!isAlreadyMember) {
          // Добавляем пользователя в команду
          team.members.push(currentUser);
          
          // Сохраняем обновленную команду в localStorage для персистентности
          const savedTeams = localStorage.getItem('teams');
          const teams = savedTeams ? JSON.parse(savedTeams) : {};
          teams[team.id] = team;
          localStorage.setItem('teams', JSON.stringify(teams));
          
          console.log(`Пользователь ${currentUser.name} ${currentUser.surname} добавлен в команду ${team.name}`);
        }
      }
    }
  }
  
  return {
    data: { success: true },
    success: true,
  };
}

/**
 * Отклонить приглашение в команду
 */
export async function rejectInvitation(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
  await delay();
  // В реальном API здесь будет POST запрос
  // await fetchAPI(`/notifications/${notificationId}/reject`, { method: 'POST' });
  console.log(`Отклонение приглашения ${notificationId}`);
  
  return {
    data: { success: true },
    success: true,
  };
}

// API функции для аналитики

/**
 * Получить аналитические данные за указанный период
 * @param datePeriod - Период в формате "месяц, год г." (например, "май, 2025 г.")
 */
export async function getAnalytics(datePeriod: string): Promise<ApiResponse<AnalyticsData>> {
  await delay();
  
  // В реальном API здесь будет запрос к бэкенду с параметром datePeriod
  // const response = await fetchAPI<AnalyticsData>(`/analytics?period=${encodeURIComponent(datePeriod)}`);
  
  // Моковые данные - в реальном API будут подсчитываться из БД на основе datePeriod
  // Участники - количество всех пользователей за указанный период
  // Распределение ролей - количество уникальных ролей за указанный период
  // Команды - количество команд за указанный период
  // Без команды - количество пользователей без команды за указанный период
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void datePeriod; // Будет использовано при подключении к бэкенду
  
  // Вычисляем количество участников в командах
  const totalMembersInTeams = mockTeams.reduce((sum, team) => sum + team.members.length, 0);
  // Убеждаемся, что withoutTeam не может быть отрицательным
  const withoutTeam = Math.max(0, mockUsers.length - totalMembersInTeams);
  
  const mockAnalytics: AnalyticsData = {
    participants: Math.max(0, mockUsers.length),
    roleDistribution: Math.max(0, new Set(mockUsers.map(u => u.role)).size),
    teams: Math.max(0, mockTeams.length),
    withoutTeam: withoutTeam
  };
  
  return {
    data: mockAnalytics,
    success: true,
  };
}

/**
 * Получить список всех доступных ролей участников
 */
export async function getRoles(): Promise<ApiResponse<FilterOption[]>> {
  await delay();
  // В реальном API здесь будет запрос к бэкенду
  // return await fetchAPI<FilterOption[]>('/roles');
  
  return {
    data: mockRoles,
    success: true,
  };
}

/**
 * Получить список всех доступных стеков (навыков)
 */
export async function getStacks(): Promise<ApiResponse<FilterOption[]>> {
  await delay();
  // В реальном API здесь будет запрос к бэкенду
  // return await fetchAPI<FilterOption[]>('/stacks');
  
  return {
    data: mockStacks,
    success: true,
  };
}

// API функции для организаторов
export async function getOrganizers(): Promise<ApiResponse<Organizer[]>> {
  await delay();
  // В реальном API здесь будет запрос к бэкенду
  // return await fetchAPI<Organizer[]>('/organizers');
  
  try {
    // Загружаем из localStorage или используем mock данные
    const savedOrganizers = localStorage.getItem('organizers');
    let organizers: Organizer[] = mockOrganizers;
    
    if (savedOrganizers) {
      try {
        organizers = JSON.parse(savedOrganizers);
      } catch (parseError) {
        console.error('Ошибка парсинга данных организаторов из localStorage:', parseError);
        // Используем mock данные при ошибке парсинга
        organizers = mockOrganizers;
      }
    }
    
    return {
      data: organizers,
      success: true,
    };
  } catch (error) {
    console.error('Ошибка загрузки организаторов:', error);
    return {
      data: mockOrganizers,
      success: false,
      message: 'Не удалось загрузить организаторов'
    };
  }
}

export async function addOrganizer(organizerData: Omit<Organizer, 'id'>): Promise<ApiResponse<Organizer>> {
  await delay();
  // В реальном API здесь будет запрос к бэкенду
  // return await fetchAPI<Organizer>('/organizers', { method: 'POST', body: JSON.stringify(organizerData) });
  
  try {
    // Сохраняем в localStorage
    const savedOrganizers = localStorage.getItem('organizers');
    let organizers: Organizer[] = mockOrganizers;
    
    if (savedOrganizers) {
      try {
        organizers = JSON.parse(savedOrganizers);
      } catch (parseError) {
        console.error('Ошибка парсинга данных организаторов из localStorage:', parseError);
        // Используем mock данные при ошибке парсинга
        organizers = mockOrganizers;
      }
    }
    
    const newOrganizer: Organizer = {
      id: `organizer-${Date.now()}`,
      ...organizerData
    };
    
    const updatedOrganizers = [...organizers, newOrganizer];
    localStorage.setItem('organizers', JSON.stringify(updatedOrganizers));
    
    return {
      data: newOrganizer,
      success: true,
    };
  } catch (error) {
    console.error('Ошибка добавления организатора:', error);
    return {
      data: {} as Organizer,
      success: false,
      message: 'Не удалось добавить организатора'
    };
  }
}

