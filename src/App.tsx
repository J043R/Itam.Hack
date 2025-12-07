import { Layout } from './components/Layout/Layout';
import { AdminLayout } from './components/Layout/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Login } from './pages/Login/Login';
import { Form } from './pages/Form/Form';
import { MyProfile } from './pages/MyProfile/MyProfile';
import { InsideHack } from './pages/InsideHack/InsideHack';
import { Users } from './pages/Users/Users';
import { MyHacks } from './pages/MyHacks/MyHacks';
import { UserProfile } from './pages/UserProfile/UserProfile';
import { AdminUserProfile } from './pages/admin/UserProfile/AdminUserProfile';
import { MyTeam } from './pages/MyTeam/MyTeam';
import { NotificationPage } from './pages/Notification/Notification';
import { Dashboard } from './pages/admin/Dashboard/Dashboard';
import { AdminLogin } from './pages/admin/AdminLogin/AdminLogin';
import { AdminRegister } from './pages/admin/AdminRegister/AdminRegister';
import { Hackathons } from './pages/admin/Hackathons/Hackathons';
import { CreateHackathon } from './pages/admin/CreateHackathon/CreateHackathon';
import { EditHackathon } from './pages/admin/EditHackathon/EditHackathon';
import { Participants } from './pages/admin/Participants/Participants';
import { Analytics } from './pages/admin/Analytics/Analytics';
import { Teams } from './pages/admin/Teams/Teams';
import { Settings } from './pages/admin/Settings/Settings';
import { GoHomeFill } from "react-icons/go";
import { RiTeamFill } from "react-icons/ri";
import { PiBellSimpleFill } from "react-icons/pi";
import { MdPerson } from "react-icons/md";

// Компонент для пользовательской части (мобильный интерфейс)
function UserApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(!isAuthenticated);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Обновляем состояние Login при изменении авторизации
  useEffect(() => {
    setIsLoginOpen(!isAuthenticated);
  }, [isAuthenticated]);
  
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

// Компонент для админской части (десктопный интерфейс)
function AdminApp() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/admin" element={<Dashboard />} />
        {/* Здесь будут добавлены другие админские роуты */}
        <Route path="/admin/hackathons" element={<Hackathons />} />
        <Route path="/admin/hackathons/create" element={<CreateHackathon />} />
        <Route path="/admin/hackathons/edit" element={<EditHackathon />} />
        <Route path="/admin/users" element={<Participants />} />
        <Route path="/admin/users/:userId" element={<AdminUserProfile />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/teams" element={<Teams />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/notifications" element={<div>Управление уведомлениями (в разработке)</div>} />
      </Routes>
    </AdminLayout>
  );
}

function AppContent() {
  const location = useLocation();
  
  // Проверяем, находимся ли мы в админской части
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminLoginPage = location.pathname === '/admin/login';
  const isAdminRegisterPage = location.pathname === '/admin/register';
  
  // Страница регистрации админа доступна без авторизации
  if (isAdminRegisterPage) {
    return (
      <Routes>
        <Route path="/admin/register" element={<AdminRegister />} />
      </Routes>
    );
  }
  
  // Для страницы входа показываем Dashboard с модальным окном поверх
  if (isAdminLoginPage) {
    return (
      <>
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/login" element={<Dashboard />} />
          </Routes>
        </AdminLayout>
        <AdminLogin />
      </>
    );
  }
  
  // Остальные админские роуты защищены
  if (isAdminRoute) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <AdminApp />
      </ProtectedRoute>
    );
  }
  
  return <UserApp />;
}

export default function App() {
  return <AppContent />;
}