# Backend database

Минимальный backend-слой для базы данных FishSite.

## Что внутри

- `schema.sql` — SQLite-схема таблиц.
- `seed.sql` — стартовые категории, товары и тестовые пользователи.
- `init_db.py` — создает локальную базу `fishsite.sqlite3`.

## Основные сущности

- Пользователи с ролями `customer` и `admin`.
- Каталог: категории, товары, избранное и корзина.
- Заказы и состав заказа.
- Оценки заказов в `order_ratings`.
- CRM-заметки и задачи администратора в `crm_notes` и `crm_tasks`.

Тестовый администратор для фронтенд-демо: `admin@fishsite.local`.

## Запуск

```bash
python3 backend/init_db.py
```

По умолчанию база создается в `backend/fishsite.sqlite3`. Файл базы не коммитится.

Можно указать другой путь:

```bash
python3 backend/init_db.py path/to/database.sqlite3
```
