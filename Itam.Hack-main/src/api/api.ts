import type { 
  User, 
  Hackathon, 
  Team, 
  MyHackathon, 
  Participant, 
  Achievement,
  Notification,
  FilterOption,
  ApiResponse,
  Organizer
} from './types';

interface FetchAPIOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchAPIOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('authToken');
    
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(endpoint, {
      method: options.method || 'GET',
      headers,
      ...(body !== undefined ? { body } : {}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {
        data: null as T,
        success: true,
      };
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
}

export async function getHackathons(): Promise<ApiResponse<Hackathon[]>> {
  const response = await fetchAPI<any[]>('/api/v1/hackathons', {
    method: 'GET',
  });
  
  if (response.success && response.data) {
    response.data = response.data.map(h => ({
      ...h,
      date: h.date_starts ? new Date(h.date_starts).toLocaleDateString('ru-RU') : '',
      description: h.describe || '',
      imageUrl: h.image_url || '',
    }));
  }
  
  return response as ApiResponse<Hackathon[]>;
}

export async function getHackathonById(id: string): Promise<ApiResponse<Hackathon>> {
  return await fetchAPI<Hackathon>(`/api/v1/hackathons/${id}/info`, {
    method: 'GET',
  });
}

export async function getMyHackathons(): Promise<ApiResponse<MyHackathon[]>> {
  return await fetchAPI<MyHackathon[]>('/api/v1/hackathons/my', {
    method: 'GET',
  });
}

export async function login(code: string): Promise<ApiResponse<{ user: User; hasProfile: boolean }>> {
  const response = await fetchAPI<any>('/api/v1/auth/code', {
    method: 'POST',
    body: { code },
  });
  
  if (response.success && response.data) {
    const data = response.data as any;
    const accessToken = data.access_token || data.token;
    const user = data.user;
    const hasProfile = data.has_anketa !== undefined 
      ? data.has_anketa 
      : (data.has_profile !== undefined 
          ? data.has_profile 
          : (user?.has_anketa !== undefined ? user.has_anketa : false));
    
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
    }
    
    localStorage.setItem('hasProfile', hasProfile ? 'true' : 'false');
    
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

export async function adminLogin(email: string, password: string): Promise<ApiResponse<User>> {
  const response = await fetchAPI<any>('/api/v1/auth/admin/login', {
    method: 'POST',
    body: { email, password },
  });
  
  if (response.success && response.data) {
    const data = response.data as any;
    const accessToken = data.access_token || data.token;
    const admin = data.admin;
    
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('isAdmin', 'true');
    }
    
    if (admin) {
      const user: User = {
        id: admin.id,
        name: admin.first_name || admin.email.split('@')[0],
        surname: admin.last_name || '',
        telegramId: '',
        email: admin.email,
        role: admin.role,
        userRole: 'admin',
        skills: [],
      };
      return {
        data: user,
        success: true,
      };
    }
    
    if (accessToken) {
      return {
        data: { id: '', name: 'Admin', surname: '', telegramId: '', role: 'admin', userRole: 'admin', skills: [] } as User,
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

export async function getUsers(): Promise<ApiResponse<Participant[]>> {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const endpoint = isAdmin ? '/api/v1/admin/participants' : '/api/v1/users';
  return await fetchAPI<Participant[]>(endpoint, { method: 'GET' });
}

export async function getUsersWithoutTeam(hackathonId: string): Promise<ApiResponse<Participant[]>> {
  return await fetchAPI<Participant[]>(`/api/v1/admin/hackathons/${hackathonId}/participants/without-team`, {
    method: 'GET',
  });
}

export async function addUserToTeam(teamId: string, userId: string, hackathonId?: string): Promise<ApiResponse<any>> {
  const endpoint = hackathonId 
    ? `/api/v1/admin/hackathons/${hackathonId}/teams/${teamId}/members`
    : `/api/v1/admin/teams/${teamId}/members`;
  return await fetchAPI<any>(endpoint, {
    method: 'POST',
    body: { user_id: userId },
  });
}

export async function getUserById(id: string, isAdmin: boolean = false): Promise<ApiResponse<User>> {
  const endpoint = isAdmin ? `/api/v1/admin/participants/${id}` : `/api/v1/profile/${id}`;
  const response = await fetchAPI<any>(endpoint, { method: 'GET' });
  
  if (response.success && response.data) {
    const data = response.data;
    response.data = {
      id: data.user_id || data.id,
      name: data.first_name || data.name || '',
      surname: data.last_name || data.surname || '',
      telegramId: data.telegram_id || '',
      role: data.role || '',
      skills: data.skills ? (typeof data.skills === 'string' ? data.skills.split(',') : data.skills) : [],
      university: data.university || '',
      about: data.bio || data.about || '',
      avatar: data.avatar_url || data.avatar || ''
    };
  }
  
  return response as ApiResponse<User>;
}

export async function createOrUpdateProfile(profileData: any): Promise<ApiResponse<any>> {
  return await fetchAPI<any>('/api/v1/anketa', {
    method: 'POST',
    body: profileData,
  });
}

export async function updateMyAnketa(profileData: any): Promise<ApiResponse<any>> {
  return await fetchAPI<any>('/api/v1/anketa/me', {
    method: 'PUT',
    body: profileData,
  });
}

export async function registerForHackathon(hackathonId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/hackathons/${hackathonId}/register`, {
    method: 'POST',
  });
}

export async function getHackathonParticipants(hackathonId: string): Promise<ApiResponse<Participant[]>> {
  return await fetchAPI<Participant[]>(`/api/v1/hackathons/${hackathonId}/participants`, {
    method: 'GET',
  });
}

export async function getTeamById(teamId: string): Promise<ApiResponse<Team>> {
  return await fetchAPI<Team>(`/api/v1/teams/${teamId}`, { method: 'GET' });
}

export async function getTeamByHackathonId(hackathonId: string): Promise<ApiResponse<Team>> {
  return await fetchAPI<Team>(`/api/v1/hackathons/${hackathonId}/team`, { method: 'GET' });
}

export async function getMyTeam(hackathonId?: string): Promise<ApiResponse<Team>> {
  const response = await fetchAPI<any>('/api/v1/teams/my', { method: 'GET' });
  
  if (response.success && response.data) {
    // Если вернулся массив, фильтруем по hackathonId или берём первую команду
    let teamData = null;
    if (Array.isArray(response.data)) {
      if (hackathonId) {
        // Ищем команду для конкретного хакатона
        teamData = response.data.find((t: any) => t.id_hackathon === hackathonId);
      } else {
        // Берём первую команду
        teamData = response.data[0];
      }
    } else {
      teamData = response.data;
    }
    
    if (teamData) {
      response.data = {
        id: teamData.id,
        name: teamData.name,
        hackathonId: teamData.id_hackathon,
        hackathonName: teamData.hackathon_name,
        id_capitan: teamData.id_capitan,
        createdAt: teamData.created_at ? new Date(teamData.created_at).toLocaleDateString('ru-RU') : '',
        members: (teamData.members || []).map((m: any) => ({
          id: m.user_id,
          name: m.first_name || '',
          surname: m.last_name || '',
          role: m.role || '',
          telegramId: '',
          skills: []
        }))
      };
    } else {
      // Команда не найдена для этого хакатона
      response.data = null;
      response.success = false;
      response.message = 'Вы не состоите в команде';
    }
  }
  
  return response as ApiResponse<Team>;
}

export async function getAllTeams(): Promise<ApiResponse<Team[]>> {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const endpoint = isAdmin ? '/api/v1/admin/teams' : '/api/v1/teams';
  const response = await fetchAPI<any[]>(endpoint, { method: 'GET' });
  
  if (response.success && response.data) {
    response.data = response.data.map((team: any) => ({
      id: team.id,
      name: team.name,
      hackathonId: team.id_hackathon,
      hackathonName: team.hackathon_name,
      createdAt: team.created_at ? new Date(team.created_at).toLocaleDateString('ru-RU') : '',
      members: (team.members || []).map((m: any) => ({
        id: m.user_id,
        name: m.first_name || '',
        surname: m.last_name || '',
        role: m.role || '',
        telegramId: '',
        skills: []
      }))
    }));
  }
  
  return response as ApiResponse<Team[]>;
}

export async function getUserTeams(userId: string, isAdmin: boolean = false): Promise<ApiResponse<Team[]>> {
  const endpoint = isAdmin ? `/api/v1/admin/participants/${userId}/teams` : `/api/v1/profile/${userId}/teams`;
  return await fetchAPI<Team[]>(endpoint, { method: 'GET' });
}

export async function createTeam(data: { name: string; hackathon_id?: string; description?: string; max_size?: number; status?: string }): Promise<ApiResponse<Team>> {
  return await fetchAPI<Team>('/api/v1/teams', {
    method: 'POST',
    body: data,
  });
}

export async function updateTeamName(teamId: string, name: string): Promise<ApiResponse<Team>> {
  return await fetchAPI<Team>(`/api/v1/teams/${teamId}`, {
    method: 'PUT',
    body: { name },
  });
}

export async function addMemberToTeam(teamId: string, userId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/teams/${teamId}/members`, {
    method: 'POST',
    body: { user_id: userId },
  });
}

export async function getUserAchievements(userId: string, isAdmin: boolean = false): Promise<ApiResponse<Achievement[]>> {
  const endpoint = isAdmin ? `/api/v1/admin/participants/${userId}/achievements` : `/api/v1/profile/${userId}/achievements`;
  return await fetchAPI<Achievement[]>(endpoint, { method: 'GET' });
}

export async function inviteUserToTeam(teamId: string, userId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/teams/${teamId}/invite`, {
    method: 'POST',
    body: { user_id: userId },
  });
}

export async function leaveTeam(teamId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/teams/${teamId}/leave`, { method: 'POST' });
}

export async function deleteMyHackathon(hackathonId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/hackathons/${hackathonId}/unregister`, { method: 'DELETE' });
}

export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  return await fetchAPI<Notification[]>('/api/v1/invitations/my', { method: 'GET' });
}

export async function acceptInvitation(invitationId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/invitations/${invitationId}/accept`, { method: 'POST' });
}

export async function rejectInvitation(invitationId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/invitations/${invitationId}/reject`, { method: 'POST' });
}

export async function getHackathonAnalytics(hackathonId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/admin/analytics/hackathon/${hackathonId}`, { method: 'GET' });
}

export async function getRoles(): Promise<ApiResponse<FilterOption[]>> {
  return await fetchAPI<FilterOption[]>('/api/v1/roles', { method: 'GET' });
}

export async function getStacks(): Promise<ApiResponse<FilterOption[]>> {
  return await fetchAPI<FilterOption[]>('/api/v1/stacks', { method: 'GET' });
}

export async function getMyAnketa(): Promise<ApiResponse<any>> {
  return await fetchAPI<any>('/api/v1/anketa/me', { method: 'GET' });
}

export async function getOrganizers(): Promise<ApiResponse<Organizer[]>> {
  return await fetchAPI<Organizer[]>('/api/v1/organizers', { method: 'GET' });
}

export async function addOrganizer(data: any): Promise<ApiResponse<Organizer>> {
  return await fetchAPI<Organizer>('/api/v1/organizers', {
    method: 'POST',
    body: data,
  });
}

export interface AdminData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  company?: string;
}

export interface AdminCreateData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  company?: string;
}

export async function getAdmins(): Promise<ApiResponse<AdminData[]>> {
  return await fetchAPI<AdminData[]>('/api/v1/admin/settings', { method: 'GET' });
}

export async function updateAdminProfile(data: { first_name?: string; last_name?: string }): Promise<ApiResponse<any>> {
  return await fetchAPI<any>('/api/v1/admin/settings/me', {
    method: 'PUT',
    body: data,
  });
}

export async function createAdmin(data: AdminCreateData): Promise<ApiResponse<AdminData>> {
  return await fetchAPI<AdminData>('/api/v1/admin/settings', {
    method: 'POST',
    body: data,
  });
}

export async function deactivateAdmin(adminId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/admin/settings/${adminId}/deactivate`, { method: 'POST' });
}

export async function activateAdmin(adminId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/admin/settings/${adminId}/activate`, { method: 'POST' });
}

export async function deleteAdmin(adminId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/admin/settings/${adminId}`, { method: 'DELETE' });
}

export interface HackathonCreateData {
  name: string;
  describe?: string;
  date_starts?: string;
  date_ends?: string;
  date_end?: string;
  register_start?: string;
  register_end?: string;
  location?: string;
  max_team_size?: number;
  image_url?: string;
}

export async function createHackathon(data: HackathonCreateData): Promise<ApiResponse<Hackathon>> {
  return await fetchAPI<Hackathon>('/api/v1/admin/hackathons', {
    method: 'POST',
    body: data,
  });
}

export async function getAdminHackathonById(id: string): Promise<ApiResponse<Hackathon>> {
  return await fetchAPI<Hackathon>(`/api/v1/admin/hackathons/${id}`, { method: 'GET' });
}

export async function updateHackathon(id: string, data: HackathonCreateData): Promise<ApiResponse<Hackathon>> {
  return await fetchAPI<Hackathon>(`/api/v1/admin/hackathons/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteHackathon(id: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/admin/hackathons/${id}`, { method: 'DELETE' });
}

export async function finishHackathon(hackathonId: string): Promise<ApiResponse<{ message: string; achievements_created: number; achievements_skipped: number; total_participants: number }>> {
  return await fetchAPI<{ message: string; achievements_created: number; achievements_skipped: number; total_participants: number }>(`/api/v1/admin/hackathons/${hackathonId}/finish`, {
    method: 'POST',
  });
}

export async function removeMemberFromTeam(teamId: string, userId: string): Promise<ApiResponse<any>> {
  return await fetchAPI<any>(`/api/v1/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
}
