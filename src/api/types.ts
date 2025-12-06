// Типы данных для API

export interface User {
  id: string;
  name: string;
  surname: string;
  telegramId: string;
  role: string;
  skills: string[];
  university?: string;
  about?: string;
  avatar?: string;
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

// Типы для ответов API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

