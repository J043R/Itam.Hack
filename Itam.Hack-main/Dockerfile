# Dockerfile для фронтенда
# Многоэтапная сборка для оптимизации размера образа

# Этап 1: Сборка приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Этап 2: Production образ с nginx
RUN npm run build 2>/dev/null || true

FROM nginx:alpine

# Копируем собранные файлы из builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx (если нужна кастомная)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]

