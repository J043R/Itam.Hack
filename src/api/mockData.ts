import type { User, Hackathon, Team, MyHackathon, Participant, Achievement, Notification } from './types';

// Моковые данные для разработки

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Иван',
    surname: 'Иванов',
    telegramId: '@ivanov',
    role: 'Frontend',
    skills: ['React', 'TypeScript', 'CSS'],
    university: 'МГУ',
    about: 'Опытный разработчик с фокусом на современные веб-технологии'
  },
  {
    id: '2',
    name: 'Мария',
    surname: 'Петрова',
    telegramId: '@petrova',
    role: 'Backend',
    skills: ['Node.js', 'Python', 'PostgreSQL'],
    university: 'СПбГУ',
    about: 'Backend разработчик с опытом создания масштабируемых систем'
  },
  {
    id: '3',
    name: 'Алексей',
    surname: 'Сидоров',
    telegramId: '@sidorov',
    role: 'Designer',
    skills: ['Figma', 'UI/UX', 'Illustrator'],
    university: 'МГХПА',
    about: 'Дизайнер интерфейсов с фокусом на пользовательский опыт'
  },
  {
    id: '4',
    name: 'Елена',
    surname: 'Козлова',
    telegramId: '@kozlova',
    role: 'Fullstack',
    skills: ['React', 'Node.js', 'MongoDB'],
    university: 'МФТИ',
    about: 'Fullstack разработчик с опытом создания полных веб-приложений'
  },
  {
    id: '5',
    name: 'Дмитрий',
    surname: 'Смирнов',
    telegramId: '@smirnov',
    role: 'DevOps',
    skills: ['Docker', 'Kubernetes', 'AWS'],
    university: 'ИТМО',
    about: 'DevOps инженер с опытом настройки CI/CD'
  },
  {
    id: '6',
    name: 'Анна',
    surname: 'Волкова',
    telegramId: '@volkova',
    role: 'QA',
    skills: ['Testing', 'Automation', 'Selenium'],
    university: 'МГУ',
    about: 'QA инженер с опытом автоматизированного тестирования'
  }
];

export const mockHackathons: Hackathon[] = [
  {
    id: '1',
    name: 'AI Hackathon 2024',
    date: '15-17 марта 2024',
    description: 'Создайте инновационные решения с использованием искусственного интеллекта',
    imageUrl: '/images/hackathon1.jpg'
  },
  {
    id: '2',
    name: 'Web Development Challenge',
    date: '22-24 марта 2024',
    description: 'Разработайте современные веб-приложения с использованием новейших технологий',
    imageUrl: '/images/hackathon2.jpg'
  },
  {
    id: '3',
    name: 'Mobile App Contest',
    date: '5-7 апреля 2024',
    description: 'Создайте мобильное приложение, которое изменит мир',
    imageUrl: '/images/hackathon3.jpg'
  },
  {
    id: '4',
    name: 'Blockchain Innovation',
    date: '12-14 апреля 2024',
    description: 'Исследуйте возможности блокчейна для решения реальных проблем',
    imageUrl: '/images/hackathon4.jpg'
  }
];

export const mockMyHackathons: MyHackathon[] = [
  {
    id: '1',
    name: 'AI Hackathon 2024',
    date: '15-17 марта 2024',
    description: 'Создайте инновационные решения с использованием искусственного интеллекта',
    imageUrl: '/images/hackathon1.jpg',
    role: 'captain'
  },
  {
    id: '2',
    name: 'Web Development Challenge',
    date: '22-24 марта 2024',
    description: 'Разработайте современные веб-приложения с использованием новейших технологий',
    imageUrl: '/images/hackathon2.jpg',
    role: 'member'
  },
  {
    id: '3',
    name: 'Mobile App Contest',
    date: '5-7 апреля 2024',
    description: 'Создайте мобильное приложение, которое изменит мир',
    imageUrl: '/images/hackathon3.jpg',
    role: 'captain'
  },
  {
    id: '4',
    name: 'Blockchain Innovation',
    date: '12-14 апреля 2024',
    description: 'Исследуйте возможности блокчейна для решения реальных проблем',
    imageUrl: '/images/hackathon4.jpg',
    role: 'member'
  }
];

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Команда Альфа',
    hackathonId: '1',
    members: [
      mockUsers[0],
      mockUsers[1],
      mockUsers[2]
    ]
  },
  {
    id: '2',
    name: 'Команда Бета',
    hackathonId: '2',
    members: [
      mockUsers[3],
      mockUsers[4]
    ]
  }
];

export const mockParticipants: Participant[] = [
  { id: '1', name: 'Иван Иванов', role: 'Frontend', firstName: 'Иван', lastName: 'Иванов' },
  { id: '2', name: 'Мария Петрова', role: 'Backend', firstName: 'Мария', lastName: 'Петрова' },
  { id: '3', name: 'Алексей Сидоров', role: 'Designer', firstName: 'Алексей', lastName: 'Сидоров' },
  { id: '4', name: 'Елена Козлова', role: 'Fullstack', firstName: 'Елена', lastName: 'Козлова' },
  { id: '5', name: 'Дмитрий Смирнов', role: 'DevOps', firstName: 'Дмитрий', lastName: 'Смирнов' },
  { id: '6', name: 'Анна Волкова', role: 'QA', firstName: 'Анна', lastName: 'Волкова' }
];

export const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'AI Hackathon 2024',
    date: '15-17 марта 2024',
    description: 'Победитель в номинации "Лучшее AI решение"'
  },
  {
    id: '2',
    name: 'Web Development Challenge',
    date: '22-24 марта 2024',
    description: 'Второе место в категории "Веб-приложения"'
  },
  {
    id: '3',
    name: 'Mobile App Contest',
    date: '5-7 апреля 2024',
    description: 'Участник финала'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'invitation',
    fromUser: {
      id: '1',
      name: 'Иван',
      surname: 'Иванов',
      avatar: undefined
    },
    hackathon: {
      id: '1',
      name: 'Хакатон'
    },
    team: {
      id: '1',
      name: 'Команда Альфа'
    },
    createdAt: '2024-03-10T10:00:00Z',
    read: false
  },
  {
    id: '2',
    type: 'join_request',
    fromUser: {
      id: '2',
      name: 'Мария',
      surname: 'Петрова',
      avatar: undefined
    },
    hackathon: {
      id: '2',
      name: 'Хакатон'
    },
    team: {
      id: '2',
      name: 'Команда Бета'
    },
    createdAt: '2024-03-09T15:30:00Z',
    read: false
  },
  {
    id: '3',
    type: 'rejection',
    fromUser: {
      id: '3',
      name: 'Алексей',
      surname: 'Сидоров',
      avatar: undefined
    },
    hackathon: {
      id: '3',
      name: 'Хакатон'
    },
    team: {
      id: '1',
      name: 'Команда Альфа'
    },
    createdAt: '2024-03-08T12:00:00Z',
    read: false
  },
  {
    id: '4',
    type: 'request_accepted',
    fromUser: {
      id: '4',
      name: 'Елена',
      surname: 'Козлова',
      avatar: undefined
    },
    hackathon: {
      id: '4',
      name: 'Хакатон'
    },
    team: {
      id: '2',
      name: 'Команда Бета'
    },
    createdAt: '2024-03-07T09:00:00Z',
    read: false
  }
];

