# Docker Setup для фронтенда

Этот проект можно запустить через Docker вместе с бэкендом.

## Структура файлов

- `Dockerfile` - для production сборки (nginx)
- `Dockerfile.dev` - для development режима (Vite dev server)
- `docker-compose.yml` - полный пример с фронтендом и бэкендом
- `docker-compose.example.yml` - пример добавления в существующий docker-compose бэкенда
- `nginx.conf` - конфигурация nginx для production

## Интеграция с существующим docker-compose бэкенда

### Вариант 1: Добавить в существующий docker-compose.yml

1. Скопируйте файлы `Dockerfile`, `Dockerfile.dev`, `nginx.conf`, `.dockerignore` в папку с фронтендом
2. Откройте ваш `docker-compose.yml` бэкенда
3. Добавьте сервис `frontend`:

```yaml
services:
  # Ваш существующий бэкенд
  backend:
    # ... ваша конфигурация

  # Фронтенд (production)
  frontend:
    build:
      context: ./frontend  # Путь к папке фронтенда
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - your-network-name  # Имя сети вашего бэкенда
    restart: unless-stopped
```

4. Обновите `vite.config.ts` для работы в Docker:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:8000', // Используем имя сервиса
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### Вариант 2: Development режим

Для разработки используйте `Dockerfile.dev`:

```yaml
frontend-dev:
  build:
    context: ./frontend
    dockerfile: Dockerfile.dev
  ports:
    - "5173:5173"
  depends_on:
    - backend
  networks:
    - your-network-name
  volumes:
    - ./frontend:/app
    - /app/node_modules
  environment:
    - NODE_ENV=development
  profiles:
    - dev
```

Запуск:
```bash
docker-compose --profile dev up
```

## Запуск

### Production
```bash
docker-compose up -d
```

Фронтенд будет доступен на `http://localhost:3000`

### Development
```bash
docker-compose --profile dev up
```

Фронтенд будет доступен на `http://localhost:5173`

## Важные замечания

1. **Сеть Docker**: Убедитесь, что фронтенд и бэкенд находятся в одной Docker сети
2. **Прокси**: В production nginx проксирует `/api` запросы на бэкенд по имени сервиса
3. **Переменные окружения**: Для production можно использовать `.env` файл
4. **Volumes**: В dev режиме используется volume для hot-reload

## Настройка nginx.conf

Если нужно изменить конфигурацию nginx, отредактируйте `nginx.conf`:
- Изменить порт бэкенда: замените `backend:8000` на нужный адрес
- Добавить дополнительные заголовки
- Настроить SSL/TLS

