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
  
  // Флаг для отслеживания, была ли это первая авторизация в этой сессии
  const [isFirstAuth, setIsFirstAuth] = useState(true);
  
  // Проверяем, заполнена ли анкета (реактивное состояние)
  // Используем флаг hasProfile из ответа бэкенда при авторизации
  const [formFilled, setFormFilled] = useState(() => {
    const hasProfile = localStorage.getItem('hasProfile') === 'true';
    const formFilledLegacy = localStorage.getItem('formFilled') === 'true';
    // Используем hasProfile, если он есть, иначе fallback на formFilled
    const filled = hasProfile || formFilledLegacy;
    console.log('Initial formFilled check:', filled, 'hasProfile:', hasProfile, 'formFilledLegacy:', formFilledLegacy);
    return filled;
  });
  
  // Отслеживаем изменения в localStorage
  useEffect(() => {
    const checkFormFilled = () => {
      const hasProfile = localStorage.getItem('hasProfile') === 'true';
      const formFilledLegacy = localStorage.getItem('formFilled') === 'true';
      const filled = hasProfile || formFilledLegacy;
      console.log('Checking formFilled:', filled, 'hasProfile:', hasProfile, 'formFilledLegacy:', formFilledLegacy);
      setFormFilled(filled);
    };
    
    // Проверяем при монтировании
    checkFormFilled();
    
    // Отслеживаем изменения в localStorage через событие storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'formFilled' || e.key === 'hasProfile') {
        checkFormFilled();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Также проверяем периодически (на случай, если изменения происходят в том же окне)
    const interval = setInterval(checkFormFilled, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  // Обновляем состояние Login при изменении авторизации
  useEffect(() => {
    setIsLoginOpen(!isAuthenticated);
  }, [isAuthenticated]);
  
  // Проверяем, был ли пользователь уже авторизован при загрузке страницы
  useEffect(() => {
    // Если при загрузке страницы уже есть токен и пользователь, значит это не первая авторизация
    const hasTokenOnLoad = !!localStorage.getItem('authToken');
    const hasUserOnLoad = !!localStorage.getItem('currentUser');
    
    if (hasTokenOnLoad && hasUserOnLoad) {
      console.log('User already authenticated on page load, not first auth');
      setIsFirstAuth(false);
    }
  }, []);
  
  // После авторизации проверяем анкету и обновляем состояние
  useEffect(() => {
    if (isAuthenticated) {
      // Проверяем флаг hasProfile из ответа бэкенда (приоритет)
      const hasProfile = localStorage.getItem('hasProfile') === 'true';
      const formFilledLegacy = localStorage.getItem('formFilled') === 'true';
      const filled = hasProfile || formFilledLegacy;
      
      console.log('User authenticated, checking form. hasProfile:', hasProfile, 'formFilledLegacy:', formFilledLegacy, 'filled:', filled, 'isFirstAuth:', isFirstAuth);
      setFormFilled(filled);
      
      // Если это не первая авторизация (пользователь уже был авторизован), не показываем форму
      if (!isFirstAuth) {
        console.log('User already authenticated, not showing form automatically');
        setIsFormOpen(false);
        setIsLoginOpen(false);
        setIsFirstAuth(false); // Сбрасываем флаг после первой проверки
      }
    }
  }, [isAuthenticated, isFirstAuth]);
  
  // После авторизации автоматически открываем анкету, если она не существует
  // НО только если это первая авторизация в этой сессии
  useEffect(() => {
    // Проверяем флаг hasProfile из ответа бэкенда
    const hasProfile = localStorage.getItem('hasProfile') === 'true';
    const formFilledLegacy = localStorage.getItem('formFilled') === 'true';
    const profileExists = hasProfile || formFilledLegacy;
    
    if (isAuthenticated && !profileExists && isFirstAuth) {
      console.log('Opening form after first authentication (profile does not exist)');
      setIsFormOpen(true);
      setIsLoginOpen(false);
      setIsFirstAuth(false); // Сбрасываем флаг после открытия формы
    } else if (isAuthenticated && !profileExists && !isFirstAuth) {
      // Если это не первая авторизация, не показываем форму автоматически
      console.log('User already authenticated, not showing form automatically');
      setIsFormOpen(false);
      setIsLoginOpen(false);
    }
  }, [isAuthenticated, formFilled, isFirstAuth]);
  
  // Если пользователь не авторизован, показываем только модальное окно входа
  if (!isAuthenticated) {
    return (
      <>
        <Login 
          isOpen={true} 
          onClose={() => {}} 
        />
      </>
    );
  }
  
  // Если пользователь авторизован, но анкета не заполнена, показываем только анкету
  // НО только если это первая авторизация (пользователь только что вошел)
  // Проверяем напрямую из localStorage для надежности
  const hasProfileValue = localStorage.getItem('hasProfile');
  const formFilledValue = localStorage.getItem('formFilled');
  const hasProfileDirect = hasProfileValue === 'true';
  const formFilledDirect = formFilledValue === 'true';
  const profileExists = hasProfileDirect || formFilledDirect;
  
  console.log('=== FORM CHECK ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('formFilled state:', formFilled);
  console.log('hasProfile from localStorage:', hasProfileValue);
  console.log('formFilledValue from localStorage:', formFilledValue);
  console.log('profileExists:', profileExists);
  console.log('isFirstAuth:', isFirstAuth);
  console.log('Should show form?', isAuthenticated && !profileExists && isFirstAuth);
  
  // Если пользователь авторизован, но анкета не существует, показываем только анкету
  // НО только если это первая авторизация (пользователь только что вошел)
  if (isAuthenticated && !profileExists && isFirstAuth) {
    console.log('✅ SHOWING FORM - User authenticated but profile does not exist (first auth)');
    return (
      <Form 
        isOpen={true} 
        onClose={() => {}} 
        canClose={false} // Нельзя закрыть анкету без заполнения
      />
    );
  }
  
  // Если пользователь уже был авторизован (не первая авторизация), не показываем форму
  if (isAuthenticated && !profileExists && !isFirstAuth) {
    console.log('✅ User already authenticated, not showing form automatically');
  }
  
  console.log('✅ Rendering main app (form is filled or user not authenticated)');
  
  const handleHackathonClick = (hackathonId?: string) => {
    console.log('handleHackathonClick вызван, hackathonId:', hackathonId);
    
    // Проверяем, существует ли анкета (используем флаг из бэкенда)
    const hasProfile = localStorage.getItem('hasProfile') === 'true';
    const formFilled = localStorage.getItem('formFilled') === 'true';
    const profileExists = hasProfile || formFilled;
    
    console.log('hasProfile:', hasProfile, 'formFilled:', formFilled, 'profileExists:', profileExists);
    
    // Всегда переходим на страницу хакатона, независимо от статуса анкеты
    // Анкета должна показываться только сразу после авторизации, а не при клике на хакатон
    console.log('Переходим на страницу хакатона');
    navigate(`/hackathon/${hackathonId || '1'}`);
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
            // Дополнительная очистка при необходимости
            // Основная логика выхода уже в handleLogout компонента MyProfile
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