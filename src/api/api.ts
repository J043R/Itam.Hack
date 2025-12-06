import type { 
  User, 
  Hackathon, 
  Team, 
  MyHackathon, 
  Participant, 
  Achievement,
  Notification,
  ApiResponse 
} from './types';
import {
  mockUsers,
  mockHackathons,
  mockMyHackathons,
  mockTeams,
  mockParticipants,
  mockAchievements,
  mockNotifications
} from './mockData';

// Базовый URL API (для будущего подключения к бэкенду)
// @ts-expect-error - переменная будет использована при подключении к бэкенду
const _API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Имитация задержки сети
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Базовая функция для выполнения fetch запросов
// Сейчас возвращает моковые данные, но структура готова для подключения к бэкенду
// Для подключения к бэкенду: раскомментировать код ниже и закомментировать блок с моковыми данными
// @ts-ignore - функция будет использована при подключении к бэкенду
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function _fetchAPI<T>(
  _endpoint: string,
  _options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Имитация задержки сети (убрать при подключении к бэкенду)
  await delay(300 + Math.random() * 500);

  // TODO: Когда будет готов бэкенд, раскомментировать код ниже и закомментировать блок с моковыми данными
  /*
  try {
    // Получаем токен авторизации из localStorage (если есть)
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
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
  
  return {
    data: team || null,
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

