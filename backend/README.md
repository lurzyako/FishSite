# Backend API

Backend-слой FishSite работает на FastAPI + PostgreSQL.

## Что внутри

- `schema.postgres.sql` — PostgreSQL-схема таблиц.
- `seed.postgres.sql` — стартовые категории, товары и тестовые пользователи.
- `init_pg.py` — создает таблицы и seed-данные в PostgreSQL.
- `app.py` — FastAPI-приложение с автодокументацией `/docs`.
- `requirements.txt` — зависимости FastAPI/uvicorn/psycopg.

## Основные сущности

- Пользователи с ролями `customer` и `admin`.
- Каталог: категории, товары, избранное и корзина.
- Заказы и состав заказа.
- Оценки заказов в `order_ratings`.
- CRM-заметки и задачи администратора в `crm_notes` и `crm_tasks`.

Тестовые пользователи для фронтенд-демо:

- Клиент: `olga@example.com`, пароль `demo`.
- Администратор: `admin@fishsite.local`, пароль `admin`.

Пароли хранятся не открытым текстом: backend использует `PBKDF2-HMAC-SHA256` с индивидуальной солью.

## Запуск PostgreSQL-версии

На macOS с PostgreSQL через Homebrew чаще всего работает локальная строка без пароля:

```bash
createdb fishsite
python3 -m pip install -r backend/requirements.txt
python3 -m backend.init_pg
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

Если в pgAdmin у вас другой пользователь, пароль или хост, передайте `DATABASE_URL`:

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@127.0.0.1:5432/fishsite"
python3 -m backend.init_pg
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

Документация API будет доступна на `http://127.0.0.1:8000/docs`.
Сайт при таком запуске открывается на `http://127.0.0.1:8000/`.

## Хранение файлов

База хранит не сами изображения, а путь/URL в `products.image_path`. По умолчанию загрузка из админки пишет файлы в `assets/uploads`.

Для хостинга можно указать:

```bash
export UPLOAD_DIR="/path/to/persistent/storage"
export UPLOAD_PUBLIC_PREFIX="https://cdn.example.com/uploads"
```

Если хостинг дает persistent disk, `UPLOAD_DIR` должен указывать на него. Если используется CDN/S3-совместимое хранилище, лучше заменить upload endpoint на прямую загрузку в это хранилище, а в PostgreSQL сохранять публичный URL.

## Деплой

Проект подготовлен для деплоя одним web-сервисом: FastAPI отдает `/api` и static-сайт с того же домена.

Render:

```bash
git push
```

Дальше в Render можно создать Blueprint по `render.yaml` или обычный Web Service:

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`

Railway:

```bash
railway up
```

или подключите репозиторий в Railway Dashboard. `railway.json` уже содержит start command.

Важно: бесплатные тарифы часто используют временную файловую систему. PostgreSQL должен быть внешним/managed, а загруженные из админки фото должны лежать на persistent disk или во внешнем хранилище.

Для продакшена можно задать публичный адрес API до подключения `js/fishsite-core.js`:

```html
<script>
  window.FISHSITE_API_BASE = 'https://example.com/api';
</script>
```

## OAuth через Google/VK

В текущем FastAPI-слое OAuth-кнопки подключены на фронтенде, но backend-авторизация через Google/VK оставлена как заглушка. Для полноценного входа нужно добавить callback-эндпоинты, обмен кода на токен и привязку внешнего аккаунта к `users`.

Ожидаемые переменные окружения для такой доработки:

```bash
GOOGLE_CLIENT_ID=... \
GOOGLE_CLIENT_SECRET=... \
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback \
VK_CLIENT_ID=... \
VK_CLIENT_SECRET=... \
VK_REDIRECT_URI=http://127.0.0.1:8000/api/auth/vk/callback
```
