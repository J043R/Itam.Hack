// SimpleTest.tsx
import { ButtonSimple } from '../components/ui/Button/button';
import { Input } from '../components/ui/Input/input';

export const SimpleTest = () => {
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1>Простой тест кнопок</h1>
      
      <div style={{ margin: '20px 0' }}>
        <h3>Тест 1: Entry Primary</h3>
        <ButtonSimple type="entry-primary" size="M">Войти M</ButtonSimple>
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <h3>Тест 2: Button Primary</h3>
        <ButtonSimple type="button-primary" size="M">Создать команду</ButtonSimple>
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <h3>Тест 3: Нативная кнопка для сравнения</h3>
        <button style={{ 
          padding: '20px', 
          backgroundColor: 'red', 
          color: 'white',
          border: 'none'
        }}>
          Нативная кнопка
        </button>
      </div>

      <hr style={{ borderColor: '#333', margin: '40px 0' }} />

      <h1>Тест полей ввода</h1>

      {/* Размер XS */}
      <div style={{ margin: '30px 0' }}>
        <h3>Размер XS (padding: 10px, height: 30px, width: 299px)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '15px' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
              XS с прозрачностью 20%
            </p>
            <Input 
              size="XS" 
              opacity={20} 
              placeholder="Введите текст..."
            />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
              XS с прозрачностью 30%
            </p>
            <Input 
              size="XS" 
              opacity={30} 
              placeholder="Введите текст..."
            />
          </div>
        </div>
      </div>

      {/* Размер S */}
      <div style={{ margin: '30px 0' }}>
        <h3>Размер S (padding: 10px, height: 40px, width: 335px)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '15px' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
              S с прозрачностью 20%
            </p>
            <Input 
              size="S" 
              opacity={20} 
              placeholder="Введите текст..."
            />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
              S с прозрачностью 30%
            </p>
            <Input 
              size="S" 
              opacity={30} 
              placeholder="Введите текст..."
            />
          </div>
        </div>
      </div>

      {/* Размер M */}
      <div style={{ margin: '30px 0' }}>
        <h3>Размер M (padding: 10px, height: 75px, width: 335px)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '15px' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
              M с прозрачностью 20%
            </p>
            <Input 
              size="M" 
              opacity={20} 
              placeholder="Введите текст..."
            />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
              M с прозрачностью 30%
            </p>
            <Input 
              size="M" 
              opacity={30} 
              placeholder="Введите текст..."
            />
          </div>
        </div>
      </div>

      {/* Поле для регистрации */}
      <div style={{ margin: '30px 0' }}>
        <h3>Поле для регистрации (padding: 10px, height: 39px, width: 279px)</h3>
        <div style={{ marginTop: '15px' }}>
          <Input 
            variant="register" 
            placeholder="Введите данные для регистрации..."
          />
        </div>
      </div>
    </div>
  );
};