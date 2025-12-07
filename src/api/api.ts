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

// Интерфейс для параметров fetchAPI
interface FetchAPIOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

// Базовая функция для выполнения fetch запросов
async function fetchAPI<T>(
  endpoint: string,
  options: FetchAPIOptions = {}
): Promise<ApiResponse<T>> {
  try {
    // Получаем токен авторизации из localStorage (если есть)
    const token = localStorage.getItem('authToken');
    
    if (token) {
      console.log('🔑 Using token in request to:', endpoint);
      console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage for request to:', endpoint);
    }
    
    // Подготавливаем body для POST/PUT/PATCH запросов
    let body: string | FormData | undefined = undefined;
    if (options.body !== undefined) {
      if (options.body instanceof FormData) {
        body = options.body;
      } else if (typeof options.body === 'object') {
        body = JSON.stringify(options.body);
      } else {
        body = options.body as string;
      }
    }
    
    // Формируем заголовки
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    console.log('📤 Request:', {
      endpoint,
      method: options.method || 'GET',
      hasToken: !!token,
      headers: Object.keys(headers),
      hasBody: body !== undefined,
      bodyContent: body ? (typeof body === 'string' ? body.substring(0, 100) : 'FormData/other') : undefined
    });
    
    // Используем относительный путь, так как прокси в Vite перенаправляет /api на бэкенд
    const response = await fetch(endpoint, {
      method: options.method || 'GET',
      headers,
      ...(body !== undefined ? { body } : {}),
    });
    
    console.log('📥 Raw Response:', {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    console.log('📥 Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Request failed:', {
        endpoint,
        status: response.status,
        error: errorData,
      });
      
      // Специальная обработка для 403 - возможно токен неверный или истек
      if (response.status === 403) {
        console.error('🚫 403 Forbidden - проверьте токен авторизации');
        // Можно очистить токен, если он неверный
        // localStorage.removeItem('authToken');
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 Response data:', data);
    
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
}

// API функции для хакатонов

/**
 * Получить список всех хакатонов
 */
export async function getHackathons(): Promise<ApiResponse<Hackathon[]>> {
  console.log('📋 Fetching hackathons from /api/v1/hackathons');
  return await fetchAPI<Hackathon[]>('/api/v1/hackathons', {
    method: 'GET',
  });
}

/**
 * Получить информацию о хакатоне по ID
 */
export async function getHackathonById(id: string): Promise<ApiResponse<Hackathon>> {
  console.log('📋 Fetching hackathon info from /api/v1/hackathons/' + id + '/info');
  return await fetchAPI<Hackathon>(`/api/v1/hackathons/${id}/info`, {
    method: 'GET',
  });
}

/**
 * Получить список моих хакатонов
 */
export async function getMyHackathons(): Promise<ApiResponse<MyHackathon[]>> {
  return await fetchAPI<MyHackathon[]>('/api/v1/my-hackathons', {
    method: 'GET',
  });
}

// API функции для аутентификации

/**
 * Вход по коду от телеграм-бота (только для обычных пользователей)
 * @param code - Код от телеграм-бота
 */
export async function login(code: string): Promise<ApiResponse<{ user: User; hasProfile: boolean }>> {
  const response = await fetchAPI<any>('/api/v1/auth/code', {
    method: 'POST',
    body: { code },
  });
  
  console.log('🔐 Login response:', response);
  
  if (response.success && response.data) {
    const data = response.data as any;
    
    // Бэкенд возвращает: { access_token: "...", token_type: "bearer", user: {...}, has_profile: true/false }
    const accessToken = data.access_token || data.token;
    const user = data.user;
    // Флаг о существовании анкеты (может быть has_profile, profile_exists, или в объекте user)
    const hasProfile = data.has_profile !== undefined 
      ? data.has_profile 
      : (data.profile_exists !== undefined 
          ? data.profile_exists 
          : (user?.has_profile !== undefined ? user.has_profile : false));
    
    // Сохраняем токен
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
      console.log('✅ Access token saved to localStorage:', accessToken.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No access_token in response. Full response:', response.data);
    }
    
    // Сохраняем флаг о существовании анкеты
    localStorage.setItem('hasProfile', hasProfile ? 'true' : 'false');
    console.log('✅ Profile exists flag saved:', hasProfile);
    
    if (user) {
      return {
        data: { user, hasProfile },
        success: true,
      };
    }
  }
  
  return {
    data: { user: {} as User, hasProfile: false },
    success: false,
    message: response.message || 'Неверный код доступа',
  };
}

/**
 * Вход администратора по email и паролю
 * @param email - Email администратора
 * @param password - Пароль администратора
 */
export async function adminLogin(email: string, password: string): Promise<ApiResponse<User>> {
  const response = await fetchAPI<any>('/api/v1/admin/login', {
    method: 'POST',
    body: { email, password },
  });
  
  console.log('🔐 Admin login response:', response);
  
  if (response.success && response.data) {
    const data = response.data as any;
    
    // Бэкенд возвращает: { access_token: "...", token_type: "bearer", user: {...} }
    const accessToken = data.access_token || data.token;
    const user = data.user;
    
    // Сохраняем токен
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
      console.log('✅ Admin access token saved to localStorage:', accessToken.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No access_token in admin response. Full response:', response.data);
    }
    
    if (user) {
      return {
        data: user,
        success: true,
      };
    }
  }
  
  return {
    data: {} as User,
    success: false,
    message: response.message || 'Неверный email или пароль',
  };
}

/**
 * Регистрация администратора по email и паролю
 * @param email - Email администратора
 * @param password - Пароль администратора
 */
export async function adminRegister(email: string, password: string): Promise<ApiResponse<User>> {
  const response = await fetchAPI<any>('/api/v1/admin/register', {
    method: 'POST',
    body: { email, password },
  });
  
  console.log('🔐 Admin register response:', response);
  
  if (response.success && response.data) {
    const data = response.data as any;
    
    // Бэкенд возвращает: { access_token: "...", token_type: "bearer", user: {...} }
    const accessToken = data.access_token || data.token;
    const user = data.user;
    
    // Сохраняем токен
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
      console.log('✅ Admin access token saved to localStorage:', accessToken.substring(0, 20) + '...');
    }
    
    if (user) {
      return {
        data: user,
        success: true,
        message: 'Регистрация успешна',
      };
    }
  }
  
  return {
    data: {} as User,
    success: false,
    message: response.message || 'Ошибка при регистрации',
  };
}

// API функции для пользователей

/**
 * Получить список всех пользователей
 */
export async function getUsers(): Promise<ApiResponse<User[]>> {
  return await fetchAPI<User[]>('/api/v1/users', {
    method: 'GET',
  });
}

/**
 * Получить пользователя по ID
 */
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  return await fetchAPI<User>(`/api/v1/users/${id}`, {
    method: 'GET',
  });
}

/**
 * Создать или обновить анкету пользователя
 * @param profileData - Данные анкеты (firstName, lastName, role, contacts)
 */
export async function createOrUpdateProfile(profileData: {
  name: string;
  last_name: string;
  role: string;
  contacts: string;
}): Promise<ApiResponse<User>> {
  const requestBody = {
    name: profileData.name,
    last_name: profileData.last_name,
    role: profileData.role,
    contacts: profileData.contacts,
  };
  
  console.log('📝 Sending profile data:', requestBody);
  
  return await fetchAPI<User>('/api/v1/anketa', {
    method: 'POST',
    body: requestBody,
  });
}

/**
 * Зарегистрироваться на хакатон
 * @param hackathonId - ID хакатона
 */
export async function registerForHackathon(hackathonId: string): Promise<ApiResponse<{ success: boolean }>> {
  console.log('📝 Registering for hackathon:', hackathonId);
  return await fetchAPI<{ success: boolean }>(`/api/v1/hackathons/${hackathonId}/register`, {
    method: 'POST',
  });
}

/**
 * Получить список участников хакатона
 */
export async function getHackathonParticipants(hackathonId: string): Promise<ApiResponse<Participant[]>> {
  return await fetchAPI<Participant[]>(`/api/v1/hackathons/${hackathonId}/participants`, {
    method: 'GET',
  });
}

// API функции для команд

/**
 * Получить команду по ID
 */
export async function getTeamById(teamId: string): Promise<ApiResponse<Team>> {
  return await fetchAPI<Team>(`/api/v1/teams/${teamId}`, {
    method: 'GET',
  });
}

/**
 * Получить команду по ID хакатона
 */
export async function getTeamByHackathonId(hackathonId: string): Promise<ApiResponse<Team | null>> {
  return await fetchAPI<Team | null>(`/api/v1/hackathons/${hackathonId}/team`, {
    method: 'GET',
  });
}

/**
 * Получить мою команду для текущего хакатона
 */
export async function getMyTeam(): Promise<ApiResponse<Team | null>> {
  console.log('📋 Fetching my team from /api/v1/teams/my/current-hackathon');
  console.log('📋 Method: GET (explicit)');
  // Токен автоматически добавляется в заголовок Authorization через fetchAPI
  return await fetchAPI<Team | null>('/api/v1/teams/my/current-hackathon', {
    method: 'GET',
  });
}

/**
 * Получить все команды
 */
export async function getAllTeams(): Promise<ApiResponse<Team[]>> {
  return await fetchAPI<Team[]>('/api/v1/teams', {
    method: 'GET',
  });
}

/**
 * Получить команды пользователя по его ID
 */
export async function getUserTeams(userId: string): Promise<ApiResponse<Array<Team & { registrationDate: string }>>> {
  return await fetchAPI<Array<Team & { registrationDate: string }>>(`/api/v1/users/${userId}/teams`, {
    method: 'GET',
  });
}

/**
 * Создать команду
 */
export async function createTeam(teamData: Omit<Team, 'id'>): Promise<ApiResponse<Team>> {
  console.log('📤 Creating team via POST /api/v1/teams');
  console.log('📤 Team data:', teamData);
  return await fetchAPI<Team>('/api/v1/teams', {
    method: 'POST',
    body: teamData,
  });
}

/**
 * Обновить название команды
 */
export async function updateTeamName(teamId: string, name: string): Promise<ApiResponse<Team>> {
  return await fetchAPI<Team>(`/api/v1/teams/${teamId}`, {
    method: 'PATCH',
    body: { name },
  });
}

/**
 * Добавить участника в команду
 */
export async function addMemberToTeam(teamId: string, userId: string): Promise<ApiResponse<Team>> {
  return await fetchAPI<Team>(`/api/v1/teams/${teamId}/members`, {
    method: 'POST',
    body: { userId },
  });
}

// API функции для достижений

/**
 * Получить достижения пользователя
 */
export async function getUserAchievements(userId: string): Promise<ApiResponse<Achievement[]>> {
  return await fetchAPI<Achievement[]>(`/api/v1/users/${userId}/achievements`, {
    method: 'GET',
  });
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
  return await fetchAPI<{ success: boolean }>(`/api/v1/teams/${teamId}/invite`, {
    method: 'POST',
    body: { userId, hackathonId },
  });
}

/**
 * Покинуть команду (выход участника и удаление команды, если это последний участник)
 */
export async function leaveTeam(teamId: string): Promise<ApiResponse<{ success: boolean }>> {
  console.log('📤 Leaving team via POST /api/v1/teams/' + teamId);
  return await fetchAPI<{ success: boolean }>(`/api/v1/teams/${teamId}`, {
    method: 'POST',
  });
}

/**
 * Удалить хакатон из "Моих хакатонов"
 */
export async function deleteMyHackathon(hackathonId: string): Promise<ApiResponse<{ success: boolean }>> {
  return await fetchAPI<{ success: boolean }>(`/api/v1/my-hackathons/${hackathonId}`, {
    method: 'DELETE',
  });
}

/**
 * Получить список уведомлений
 */
export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  return await fetchAPI<Notification[]>('/api/v1/notifications', {
    method: 'GET',
  });
}

/**
 * Принять приглашение в команду
 */
export async function acceptInvitation(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
  return await fetchAPI<{ success: boolean }>(`/api/v1/notifications/${notificationId}/accept`, {
    method: 'POST',
  });
}

/**
 * Отклонить приглашение в команду
 */
export async function rejectInvitation(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
  return await fetchAPI<{ success: boolean }>(`/api/v1/notifications/${notificationId}/reject`, {
    method: 'POST',
  });
}

// API функции для аналитики

/**
 * Получить аналитические данные за указанный период
 * @param datePeriod - Период в формате "месяц, год г." (например, "май, 2025 г.")
 */
export async function getAnalytics(datePeriod: string): Promise<ApiResponse<AnalyticsData>> {
  return await fetchAPI<AnalyticsData>(`/api/v1/analytics?period=${encodeURIComponent(datePeriod)}`, {
    method: 'GET',
  });
}

/**
 * Получить список всех доступных ролей участников
 */
export async function getRoles(): Promise<ApiResponse<FilterOption[]>> {
  return await fetchAPI<FilterOption[]>('/api/v1/roles', {
    method: 'GET',
  });
}

/**
 * Получить список всех доступных стеков (навыков)
 */
export async function getStacks(): Promise<ApiResponse<FilterOption[]>> {
  return await fetchAPI<FilterOption[]>('/api/v1/stacks', {
    method: 'GET',
  });
}

// API функции для организаторов
export async function getOrganizers(): Promise<ApiResponse<Organizer[]>> {
  return await fetchAPI<Organizer[]>('/api/v1/organizers', {
    method: 'GET',
  });
}

export async function addOrganizer(organizerData: Omit<Organizer, 'id'>): Promise<ApiResponse<Organizer>> {
  return await fetchAPI<Organizer>('/api/v1/organizers', {
    method: 'POST',
    body: organizerData,
  });
}

