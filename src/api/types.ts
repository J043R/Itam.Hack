// Типы данных для API

// Роль пользователя в системе (user - обычный пользователь, admin - администратор)
export type UserRole = 'user' | 'admin';

// Роль в команде (Frontend, Backend, Designer и т.д.)
export type TeamRole = string;

export interface User {
  id: string;
  name: string;
  surname: string;
  telegramId: string;
  role: string; // Роль в команде (Frontend, Backend и т.д.)
  userRole?: UserRole; // Роль в системе (user/admin)
  skills: string[];
  university?: string;
  about?: string;
  avatar?: string;
  email?: string;
}

export interface Hackathon {
  id: string;
  name: string;
  date: string;
  description: string;
  imageUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  hackathonId: string;
}

export interface MyHackathon extends Hackathon {
  role: 'captain' | 'member';
  imageUrl: string;
}

export interface Participant {
  id: string;
  name: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface Achievement {
  id: string;
  name: string;
  date: string;
  description: string;
}

export interface Notification {
  id: string;
  type: 'invitation' | 'rejection' | 'join_request' | 'request_accepted';
  fromUser: {
    id: string;
    name: string;
    surname: string;
    avatar?: string;
  };
  hackathon: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
  };
  createdAt: string;
  read: boolean;
}

// Типы для аналитики
export interface AnalyticsData {
  participants: number;
  roleDistribution: number;
  teams: number;
  withoutTeam: number;
}

// Типы для фильтров
export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

// Типы для ответов API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Типы для организаторов
export interface Organizer {
  id: string;
  name: string;
  surname: string;
  company: string;
  email: string;
  avatar?: string;
}

