import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input/input';
import { ButtonSimple } from '../../../components/ui/Button/button';
import { getAdmins, createAdmin, deactivateAdmin, activateAdmin, deleteAdmin } from '../../../api/api';
import type { AdminData } from '../../../api/api';
import styles from './Settings.module.css';

export const Settings = () => {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'admin'
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await getAdmins();
      if (response.success) {
        setAdmins(response.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки администраторов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleAddAdmin = async () => {
    if (!formData.email || !formData.password) {
      alert('Email и пароль обязательны');
      return;
    }

    try {
      const response = await createAdmin({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        role: formData.role || 'admin'
      });
      if (response.success) {
        setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'admin' });
        loadAdmins();
      } else {
        alert(response.message || 'Не удалось добавить администратора');
      }
    } catch (error) {
      console.error('Ошибка добавления администратора:', error);
      alert('Произошла ошибка при добавлении администратора');
    }
  };

  const handleToggleActive = async (admin: AdminData) => {
    try {
      const response = admin.is_active 
        ? await deactivateAdmin(admin.id)
        : await activateAdmin(admin.id);
      
      if (response.success) {
        loadAdmins();
      } else {
        alert(response.message || 'Не удалось изменить статус');
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  const handleDelete = async (admin: AdminData) => {
    if (!confirm(`Удалить администратора ${admin.email}?`)) return;
    
    try {
      const response = await deleteAdmin(admin.id);
      if (response.success) {
        loadAdmins();
      } else {
        alert(response.message || 'Не удалось удалить администратора');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  return (
    <div className={styles.settings}>
      <div className={styles.container}>
        {/* Левая секция - Форма добавления администратора */}
        <div className={styles.leftSection}>
          <h1 className={styles.mainTitle}>Управление администраторами</h1>
          <div className={styles.formPanel}>
            <h2 className={styles.formTitle}>Добавить администратора</h2>
            <div className={styles.formFields}>
              <div className={styles.formField}>
                <Input
                  label="Email *"
                  variant="form"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  placeholder="admin@example.com"
                  className={styles.input}
                />
              </div>
              <div className={styles.formField}>
                <Input
                  label="Пароль *"
                  variant="form"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="Минимум 6 символов"
                  className={styles.input}
                />
              </div>
              <div className={styles.formField}>
                <Input
                  label="Имя"
                  variant="form"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange('first_name')}
                  placeholder="Иван"
                  className={styles.input}
                />
              </div>
              <div className={styles.formField}>
                <Input
                  label="Фамилия"
                  variant="form"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange('last_name')}
                  placeholder="Иванов"
                  className={styles.input}
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.selectLabel}>Роль</label>
                <select 
                  value={formData.role} 
                  onChange={handleInputChange('role')}
                  className={styles.select}
                >
                  <option value="admin">Администратор</option>
                  <option value="super_admin">Супер-администратор</option>
                </select>
              </div>
            </div>
            <ButtonSimple
              type="entry-primary"
              size="M"
              onClick={handleAddAdmin}
              className={styles.addButton}
            >
              Добавить
            </ButtonSimple>
          </div>
        </div>

        {/* Правая секция - Список администраторов */}
        <div className={styles.rightSection}>
          {loading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            <div className={styles.organizersGrid}>
              {admins.map((admin) => (
                <div key={admin.id} className={`${styles.organizerCard} ${!admin.is_active ? styles.inactive : ''}`}>
                  <div className={styles.cardBorderTop}></div>
                  <div className={styles.cardBorderRight}></div>
                  <div className={styles.cardBorderBottom}></div>
                  <div className={styles.cardBorderLeft}></div>
                  
                  <div className={styles.avatar}></div>
                  
                  <div className={styles.organizerInfo}>
                    <div className={styles.organizerName}>
                      {admin.first_name || admin.email.split('@')[0]}
                    </div>
                    <div className={styles.organizerSurname}>{admin.last_name}</div>
                    <div className={styles.organizerCompany}>{admin.email}</div>
                    <div className={styles.adminRole}>
                      {admin.role === 'super_admin' ? '👑 Супер-админ' : '👤 Админ'}
                    </div>
                    <div className={styles.adminStatus}>
                      {admin.is_active ? '✅ Активен' : '❌ Неактивен'}
                    </div>
                  </div>
                  
                  <div className={styles.adminActions}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleToggleActive(admin)}
                      title={admin.is_active ? 'Деактивировать' : 'Активировать'}
                    >
                      {admin.is_active ? '🔒' : '🔓'}
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleDelete(admin)}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
