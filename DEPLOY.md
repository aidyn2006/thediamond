# Деплой TheDiamond на VPS через Docker

В контейнерах поднимается стек: PostgreSQL + Java-бэкенд + Next.js-фронт. TLS и 80/443
терминирует **хостовый nginx** (сертификат — certbot), контейнеры публикуются только
на `127.0.0.1`.

```
браузер ──443──> nginx ──/uploads/*──> 127.0.0.1:8082 (backend)
                      └──всё остальное─> 127.0.0.1:3002 (frontend) ──внутр.──> backend:8080
```

## 1. Предпосылки на VPS

- Установлены Docker и Docker Compose (`docker --version`, `docker compose version`).
- Установлен nginx и certbot (`nginx -v`, `certbot --version`).
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
| `MAIL_SMTP_*` | доступы SMTP (или оставить пустыми — письма пойдут в лог) |

`FRONTEND_HOST_PORT` (3002) и `BACKEND_HOST_PORT` (8082) менять нужно только если
эти порты на хосте уже заняты — тогда поправьте их и в vhost'е nginx.

## 4. Запуск контейнеров

```bash
docker compose -f docker-compose.nginx.yml up -d --build
```

Первый билд — несколько минут (Maven + Next).

Проверка:

```bash
docker compose -f docker-compose.nginx.yml ps
docker compose -f docker-compose.nginx.yml logs -f backend   # Flyway + сиды при первом старте
curl -I http://127.0.0.1:3002
```

## 5. Настроить nginx и TLS

```bash
sudo cp deploy/nginx-thediamond.conf /etc/nginx/sites-available/thediamond.conf
sudo ln -s /etc/nginx/sites-available/thediamond.conf /etc/nginx/sites-enabled/
# поправьте server_name под свой домен, если он не thediamond.kz
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d thediamond.kz -d www.thediamond.kz
```

Certbot сам добавит 443-сервер и редирект с 80.

Открывайте `https://<DOMAIN>`. Тестовые аккаунты (пароль `password123`):
`admin@thediamond.kz`, `brand1@company.kz`, `aida@creator.kz`.

## 6. Обновление версии

```bash
git pull
docker compose -f docker-compose.nginx.yml up -d --build
```

Схема БД мигрируется Flyway автоматически при старте бэкенда.

## Данные и бэкапы

- БД — в томе `pgdata`, загруженные аватары — в томе `uploads`.
- Бэкап БД:
  ```bash
  docker compose -f docker-compose.nginx.yml exec postgres \
    pg_dump -U thediamond thediamond > backup_$(date +%F).sql
  ```
- Сиды заливаются только в пустую БД (идемпотентно). Для «боевого» запуска после проверки
  можно очистить БД (`docker compose ... down -v`) — тогда при следующем старте сиды создадутся заново;
  либо удалить тестовые аккаунты через админку/SQL.

## Частые проблемы

- **502 от nginx** — контейнеры не поднялись или слушают другие порты.
  Проверьте `docker compose -f docker-compose.nginx.yml ps` и совпадение
  `FRONTEND_HOST_PORT`/`BACKEND_HOST_PORT` с `proxy_pass` в vhost'е.
- **Логин не проходит (CSRF/redirect)** — проверьте, что `DOMAIN` в `.env` совпадает с доменом
  в адресной строке (от него зависят `AUTH_URL` и `CORS_ALLOWED_ORIGINS`); после правки
  `.env` нужен `up -d` (перезапуск контейнеров).
- **Аватар не загружается (413)** — увеличьте `client_max_body_size` в vhost'е.
- **Порт 3002/8082 занят** — задайте другие в `.env` и синхронно в `deploy/nginx-thediamond.conf`.

## Локальная разработка

Корневой `docker-compose.yml` поднимает только PostgreSQL на порту 5433 для локального
запуска бэкенда и фронта вне Docker:

```bash
docker compose up -d
```
