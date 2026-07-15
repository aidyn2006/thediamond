# Деплой TheDiamond на VPS через Docker

Поднимает весь стек одной командой: PostgreSQL + Java-бэкенд + Next.js-фронт + Caddy
(авто-HTTPS от Let's Encrypt). Наружу открыт только Caddy (80/443).

```
браузер ──443──> Caddy ──/uploads/*──> backend:8080
                      └──всё остальное─> frontend:3000 ──внутр.──> backend:8080
```

## 1. Предпосылки на VPS

- Установлены Docker и Docker Compose (`docker --version`, `docker compose version`).
- Домен (например `thediamond.kz`) с A-записью на IP вашего VPS.
- Открыты порты **80** и **443** (firewall/security group).

## 2. Забрать код

```bash
git clone <ваш-репозиторий> thediamond
cd thediamond
```

## 3. Заполнить секреты

```bash
cp .env.prod.example .env
nano .env
```

Обязательно поменяйте:

| Переменная | Что положить |
|---|---|
| `DOMAIN` | ваш домен, напр. `thediamond.kz` |
| `POSTGRES_PASSWORD` | надёжный пароль БД |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `RESEND_API_KEY` | ключ Resend (или оставить пустым — письма пойдут в лог) |

## 4. Запуск

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Первый билд — несколько минут (Maven + Next). Caddy сам выпустит TLS-сертификат,
как только домен резолвится на сервер.

Проверка:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend   # Flyway + сиды при первом старте
```

Открывайте `https://<DOMAIN>`. Тестовые аккаунты (пароль `password123`):
`admin@thediamond.kz`, `brand1@company.kz`, `aida@creator.kz`.

## 5. Обновление версии

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Схема БД мигрируется Flyway автоматически при старте бэкенда.

## Данные и бэкапы

- БД — в томе `pgdata`, загруженные аватары — в томе `uploads`, сертификаты — в `caddy_data`.
- Бэкап БД:
  ```bash
  docker compose -f docker-compose.prod.yml exec postgres \
    pg_dump -U thediamond thediamond > backup_$(date +%F).sql
  ```
- Сиды заливаются только в пустую БД (идемпотентно). Для «боевого» запуска после проверки
  можно очистить БД (`docker compose ... down -v`) — тогда при следующем старте сиды создадутся заново;
  либо удалить тестовые аккаунты через админку/SQL.

## Частые проблемы

- **Caddy не выдаёт сертификат** — домен ещё не указывает на сервер, или закрыты порты 80/443.
  Смотрите `docker compose -f docker-compose.prod.yml logs caddy`.
- **Логин не проходит (CSRF/redirect)** — проверьте, что `DOMAIN` в `.env` совпадает с доменом
  в адресной строке (от него зависят `AUTH_URL` и `CORS_ALLOWED_ORIGINS`).
- **Порт 80 занят** (уже есть nginx/apache на VPS) — остановите его или уберите проброс `80/443`
  у Caddy и повесьте свой прокси на `frontend:3000` + `backend:8080` (`/uploads`).

## Без своего домена (быстрый тест по IP)

Auto-HTTPS требует домен. Для проверки по IP без TLS замените в `Caddyfile` первую строку
`{$DOMAIN} {` на `:80 {`, а в `.env` при этом задайте
`AUTH_URL=http://<IP>` и `UPLOAD_PUBLIC_BASE_URL=http://<IP>/uploads`
(поправьте в `docker-compose.prod.yml`). Для продакшена используйте домен + HTTPS.
