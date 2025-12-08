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
