import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input/input';
import { ButtonSimple } from '../../../components/ui/Button/button';
import { getAdmins, createAdmin } from '../../../api/api';
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
    role: 'admin',
    company: ''
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
        role: formData.role || 'admin',
        company: formData.company || undefined
      });
      if (response.success) {
        setFormData({ email: '', password: '', first_name: '', last_name: '', role: 'admin', company: '' });
        loadAdmins();
      } else {
        alert(response.message || 'Не удалось добавить администратора');
      }
    } catch (error) {
      console.error('Ошибка добавления администратора:', error);
      alert('Произошла ошибка при добавлении администратора');
    }
  };



  return (
    <div className={styles.settings}>
      <div className={styles.container}>
        {/* Левая секция - Форма добавления организатора */}
        <div className={styles.leftSection}>
          <h1 className={styles.mainTitle}>Список организаторов</h1>
          <div className={styles.formPanel}>
            <h2 className={styles.formTitle}>Добавить организатора</h2>
            <div className={styles.formFields}>
              <div className={styles.formField}>
                <Input
                  label="Email"
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
                  label="Пароль"
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
                <Input
                  label="Компания"
                  variant="form"
                  type="text"
                  value={formData.company}
                  onChange={handleInputChange('company')}
                  placeholder="Название компании"
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
                    <div className={styles.organizerCompany}>{admin.company || ''}</div>
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
