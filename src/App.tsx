import { Layout } from './components/Layout/Layout';
import { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Login } from './pages/Login/Login';
import { Form } from './pages/Form/Form';
import { MyProfile } from './pages/MyProfile/MyProfile';
import { InsideHack } from './pages/InsideHack/InsideHack';
import { Users } from './pages/Users/Users';
import { MyHacks } from './pages/MyHacks/MyHacks';
import { UserProfile } from './pages/UserProfile/UserProfile';
import { MyTeam } from './pages/MyTeam/MyTeam';
import { NotificationPage } from './pages/Notification/Notification';
import { GoHomeFill } from "react-icons/go";
import { RiTeamFill } from "react-icons/ri";
import { PiBellSimpleFill } from "react-icons/pi";
import { MdPerson } from "react-icons/md";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const handleHackathonClick = (hackathonId?: string) => {
    console.log('handleHackathonClick вызван, hackathonId:', hackathonId);
    // Проверяем, заполнена ли уже анкета
    const formFilled = localStorage.getItem('formFilled');
    console.log('formFilled из localStorage:', formFilled);
    
    if (formFilled === 'true') {
      // Если анкета уже заполнена, переходим на страницу хакатона
      console.log('Анкета уже заполнена, переходим на страницу хакатона');
      navigate(`/hackathon/${hackathonId || '1'}`);
    } else {
      // Если анкета не заполнена, закрываем Login и открываем анкету
      console.log('Анкета не заполнена, открываем анкету');
      // Сначала закрываем Login
      setIsLoginOpen(false);
      // Затем открываем анкету с небольшой задержкой, чтобы Login успел закрыться
      setTimeout(() => {
        console.log('Открываем Form, isFormOpen будет:', true);
        setIsFormOpen(true);
      }, 300);
    }
  };

  // Определяем активную страницу на основе текущего пути
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/myhacks')) return 'myhacks';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/hackathon')) return 'home'; // Страница хакатона считается частью главной
    return 'home';
  };

  const activePage = getActivePage();
  
  // Скрываем нижнюю навигацию на странице профиля участника
  const isUserProfilePage = location.pathname.match(/\/hackathon\/\d+\/users\/\d+$/);
  
  return (
    <>
      <Layout
        bottomNavItems={isUserProfilePage ? undefined : [
          {
            icon: <GoHomeFill style={{ fontSize: '34px', color: '#E7E3D8' }} />,
            label: 'Главная',
            onClick: () => navigate('/'),
            active: activePage === 'home'
          },
          {
            icon: <RiTeamFill style={{ fontSize: '34px', color: '#E7E3D8' }} />,
            label: 'Команды',
            onClick: () => navigate('/myhacks'),
            active: activePage === 'myhacks'
          },
          {
            icon: <PiBellSimpleFill style={{ fontSize: '34px', color: '#E7E3D8' }} />,
            label: 'Уведомления',
            onClick: () => navigate('/notifications'),
            active: activePage === 'notifications'
          },
          {
            icon: <MdPerson style={{ fontSize: '34px', color: '#E7E3D8' }} />,
            label: 'Профиль',
            onClick: () => navigate('/profile'),
            active: activePage === 'profile'
          }
        ]}
      >
        <Routes>
          <Route path="/" element={<Home onHackathonClick={handleHackathonClick} />} />
          <Route path="/myhacks" element={<MyHacks />} />
          <Route path="/notifications" element={<NotificationPage />} />
          <Route path="/profile" element={<MyProfile onLogout={() => {
            navigate('/');
            setIsLoginOpen(true);
            setIsFormOpen(false);
          }} />} />
          <Route path="/hackathon/:id" element={<InsideHack />} />
          <Route path="/hackathon/:id/users" element={<Users />} />
          <Route path="/hackathon/:id/users/:userId" element={<UserProfile />} />
          <Route path="/hackathon/:id/team" element={<MyTeam />} />
        </Routes>
      </Layout>
      
      <Login 
        isOpen={isLoginOpen && !isFormOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
      
      <Form 
        isOpen={isFormOpen} 
        onClose={() => {
          console.log('Form onClose вызван');
          setIsFormOpen(false);
        }} 
      />
    </>
  );
}

export default function App() {
  return <AppContent />;
}