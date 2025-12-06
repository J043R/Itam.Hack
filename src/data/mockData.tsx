export interface User {
  id: string;
  name: string;
  surname: string,
  telegramId: string;
  role: string;
  skills: string[];
}

export interface Hackathon {
  id: string;
  name: string;
  date: string;
  description:string
}
export interface Team {
  id: string;
  name: string;
  members: User[];
}