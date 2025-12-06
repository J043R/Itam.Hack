import { ButtonSimple } from '../../components/ui/Button/button';
import { Input } from '../../components/ui/Input/input';
import { IconButton } from '../../components/ui/IconButton/iconButton';
import { IoFilterSharp } from "react-icons/io5";
import styles from './Home.module.css';

interface HomeProps {
  onHackathonClick?: (hackathonId: string) => void;
}

export const Home = ({ onHackathonClick }: HomeProps) => {
  // Тестовые данные для хакатонов
  const hackathons = [
    {
      id: '1',
      name: 'AI Hackathon 2024',
      date: '15-17 марта 2024',
      description: 'Создайте инновационные решения с использованием искусственного интеллекта'
    },
    {
      id: '2',
      name: 'Web Development Challenge',
      date: '22-24 марта 2024',
      description: 'Разработайте современные веб-приложения с использованием новейших технологий'
    },
    {
      id: '3',
      name: 'Mobile App Contest',
      date: '5-7 апреля 2024',
      description: 'Создайте мобильное приложение, которое изменит мир'
    },
    {
      id: '4',
      name: 'Blockchain Innovation',
      date: '12-14 апреля 2024',
      description: 'Исследуйте возможности блокчейна для решения реальных проблем'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <h1 className={styles.title}>Хакатоны</h1>
      
      {/* Фильтры и поиск */}
      <div className={styles.searchSection}>
        <IconButton 
          icon={<IoFilterSharp style={{ fontSize: '20px', color: '#E7E3D8' }} />}
          onClick={() => alert('Фильтры')}
          aria-label="Фильтры"
          variant="transparent"
        />
        <Input 
          size="XS" 
          opacity={30} 
          placeholder="Поиск"
        />
      </div>

      {/* Список хакатонов */}
      <div className={styles.hackathonsList}>
        {hackathons.map((hackathon) => (
          <ButtonSimple
            key={hackathon.id}
            type="glass-card-large"
            onClick={() => onHackathonClick ? onHackathonClick(hackathon.id) : alert(`Открыть ${hackathon.name}`)}
          >
            <div 
              className={styles.hackathonContent}
              style={{
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <h2 
                className={styles.hackathonName}
                style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  wordBreak: 'normal',
                  wordWrap: 'normal',
                  overflowWrap: 'normal',
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  display: 'block'
                }}
              >
                {hackathon.name}
              </h2>
              <p className={styles.hackathonDate}>{hackathon.date}</p>
              <p className={styles.hackathonDescription}>
                {hackathon.description}
              </p>
            </div>
          </ButtonSimple>
        ))}
      </div>
    </div>
  );
};

